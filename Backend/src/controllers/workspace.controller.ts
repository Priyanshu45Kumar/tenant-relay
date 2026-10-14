import { Request, Response } from "express";
import { TenantModel } from "../models/tenant.model.js";

export const getCurrentWorkspace = async (
  request: Request,
  response: Response,
): Promise<void> => {
  if (!request.auth) {
    response.status(401).json({
      success: false,
      message: "Authentication Required",
    });
    return;
  }

  try {
    const workspace = await TenantModel.findById(
      request.auth.tenantId,
    ).select("name slug createdAt");

    if (!workspace) {
      response.status(404).json({
        success: false,
        message: "Workspace not found",
      });
      return;
    }

    response.status(200).json({
      success: true,
      data: {
        id: workspace._id.toString(),
        name: workspace.name,
        slug: workspace.slug,
        role: "role" in request.auth ? request.auth.role ?? null : null,
        createdAt: workspace.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to get workspace:", error);

    response.status(500).json({
      success: false,
      message: "Unable to retrieve workspace",
    });
  }
};

export const updateWorkspace = async (
  request: Request,
  response: Response,
): Promise<void> => {
  if (!request.auth) {
    response.status(401).json({
      success: false,
      message: "Authentication Required",
    });
    return;
  }

  const { name, slug } = request.body;

  if (name === undefined && slug === undefined) {
    response.status(400).json({
      success: false,
      message: "At least one field is required",
    });
    return;
  }

  // Validate input types before sending data to Mongoose.
  if (
    (name !== undefined && typeof name !== "string") ||
    (slug !== undefined && typeof slug !== "string")
  ) {
    response.status(400).json({
      success: false,
      message: "Name and slug must be strings",
    });
    return;
  }

  // Normalize the slug before updating.
  const normalizedSlug =
    typeof slug === "string" ? slug.trim().toLowerCase() : undefined;

  if (
    normalizedSlug !== undefined &&
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)
  ) {
    response.status(400).json({
      success: false,
      message:
        "Slug can only contain lowercase letters, numbers and single hyphens",
    });
    return;
  }

  try {
    const workspace = await TenantModel.findByIdAndUpdate(
      request.auth.tenantId,
      {
        ...(name !== undefined && { name: name.trim() }),
        ...(normalizedSlug !== undefined && {
          slug: normalizedSlug,
        }),
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("name slug createdAt");

    if (!workspace) {
      response.status(404).json({
        success: false,
        message: "Workspace not found",
      });
      return;
    }

    response.status(200).json({
      success: true,
      message: "Workspace updated successfully",
      data: {
        id: workspace._id.toString(),
        name: workspace.name,
        slug: workspace.slug,
        createdAt: workspace.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error("Failed to update workspace:", error);

    const mongoError = error as {
      code?: number;
      name?: string;
      message?: string;
      errors?: Record<string, { message?: string }>;
    };

    // Duplicate slug.
    if (mongoError.code === 11000) {
      response.status(409).json({
        success: false,
        message: "This workspace slug is already taken",
      });
      return;
    }

    // Schema validation errors.
    if (mongoError.name === "ValidationError") {
      response.status(400).json({
        success: false,
        message: "Workspace validation failed",
        errors: Object.values(mongoError.errors ?? {}).map(
          (item) => item.message ?? "Invalid value",
        ),
      });
      return;
    }

    response.status(500).json({
      success: false,
      message: "Unable to update workspace",
    });
  }
};