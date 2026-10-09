import { randomBytes, createHash } from "node:crypto";
import type { Request, Response } from "express";

import { MembershipModel } from "../models/membership.model.js";
import { TeamInvitationModel } from "../models/invitation.model.js";
import { MEMBERSHIP_ROLES } from "../constants/membership-roles.js";
import { sendTeamInvitationEmail } from "../services/email.service.js";
import { UserModel } from "../models/user.model.js";
import { TenantModel } from "../models/tenant.model.js";
export const getTeamMembers = async (
  request: Request,
  response: Response,
): Promise<void> => {
  if (!request.auth) {
    response.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const { tenantId } = request.auth;

  try {
    const members = await MembershipModel.find({
      tenantId,
    })
      .populate("userId", "name email")
      .sort({ createdAt: 1 });

    response.status(200).json({
      success: true,
      data: members.map((member) => {
        const user = member.userId as unknown as {
          _id: string;
          name: string;
          email: string;
        };

        return {
          id: member._id.toString(),
          userId: user._id.toString(),
          name: user.name,
          email: user.email,
          role: member.role,
          joinedAt: member.createdAt,
        };
      }),
    });
  } catch (error) {
    console.error("Failed to fetch team members:", error);

    response.status(500).json({
      success: false,
      message: "Unable to fetch team members",
    });
  }
};

export const createTeamInvitation = async (
  request: Request,
  response: Response,
): Promise<void> => {
  if (!request.auth) {
    response.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  const { tenantId, userId } = request.auth;

  const { email, role } = request.body;

  if (typeof email !== "string" || !email.trim()) {
    response.status(400).json({
      success: false,
      message: "Email is required",
    });
    return;
  }

  if (!MEMBERSHIP_ROLES.includes(role)) {
    response.status(400).json({
      success: false,
      message: "Invalid team role",
    });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Get current user who is sending the invitation
    const inviter = await UserModel.findById(userId).select("name");

    // Get workspace information
    const tenant = await TenantModel.findById(tenantId).select("name");

    if (!inviter || !tenant) {
      response.status(404).json({
        success: false,
        message: "Workspace or user not found",
      });
      return;
    }

    // Check whether user is already a workspace member
    const existingMember = await MembershipModel.findOne({
      tenantId,
    }).populate({
      path: "userId",
      match: { email: normalizedEmail },
    });

    if (existingMember?.userId) {
      response.status(409).json({
        success: false,
        message: "User is already a member of this workspace",
      });
      return;
    }

    // Check for an existing active invitation
    const existingInvitation = await TeamInvitationModel.findOne({
      tenantId,
      email: normalizedEmail,
      acceptedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (existingInvitation) {
      response.status(409).json({
        success: false,
        message: "An active invitation already exists for this email",
      });
      return;
    }

    // Generate secure random invitation token
    const rawToken = randomBytes(32).toString("hex");

    // Store only the hash in database
    const tokenHash = createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Invitation expires after 24 hours
    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    const invitation = await TeamInvitationModel.create({
      tenantId,
      email: normalizedEmail,
      role,
      tokenHash,
      expiresAt,
    });

    // Frontend invitation URL
    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    const invitationLink =
      `${frontendUrl}/accept-invite?token=${rawToken}`;

    // Send invitation email
    await sendTeamInvitationEmail({
      to: normalizedEmail,
      inviterName: inviter.name,
      workspaceName: tenant.name,
      role,
      invitationLink,
    });

    // Never return the raw token in API response
    response.status(201).json({
      success: true,
      message: "Team invitation sent successfully",
      data: {
        id: invitation._id.toString(),
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error(
      "Failed to create team invitation:",
      error,
    );

    response.status(500).json({
      success: false,
      message: "Unable to create team invitation",
    });
  }
};

export const acceptTeamInvitation = async (
  request: Request,
  response: Response,
): Promise<void> => {
  if (!request.auth) {
    response.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (request.auth.authType !== "jwt" || !request.auth.userId) {
    response.status(401).json({
      success: false,
      message: "User authentication required",
    });
    return;
  }

  const { userId } = request.auth;
  const { token } = request.body;

  if (typeof token !== "string" || !token.trim()) {
    response.status(400).json({
      success: false,
      message: "Invitation token is required",
    });
    return;
  }

  const tokenHash = createHash("sha256")
    .update(token.trim())
    .digest("hex");

  try {
    const invitation = await TeamInvitationModel.findOne({
      tokenHash,
      acceptedAt: null,
    });

    if (!invitation) {
      response.status(404).json({
        success: false,
        message: "Invalid or already used invitation",
      });
      return;
    }

    if (invitation.expiresAt <= new Date()) {
      response.status(410).json({
        success: false,
        message: "Invitation has expired",
      });
      return;
    }

    const user = await UserModel.findById(userId).select("email");

    if (!user) {
      response.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.email !== invitation.email) {
      response.status(403).json({
        success: false,
        message: "This invitation belongs to a different email address",
      });
      return;
    }

    const existingMembership = await MembershipModel.findOne({
      tenantId: invitation.tenantId,
      userId,
    });

    if (existingMembership) {
      response.status(409).json({
        success: false,
        message: "You are already a member of this workspace",
      });
      return;
    }

    await MembershipModel.create({
      tenantId: invitation.tenantId,
      userId,
      role: invitation.role,
    });

    invitation.acceptedAt = new Date();
    await invitation.save();

    response.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      data: {
        tenantId: invitation.tenantId.toString(),
        role: invitation.role,
      },
    });
  } catch (error) {
    console.error(
      "Failed to accept team invitation:",
      error,
    );

    response.status(500).json({
      success: false,
      message: "Unable to accept team invitation",
    });
  }
};