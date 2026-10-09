import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Users,
  X,
  UserPlus,
  Loader2,
} from "lucide-react";
import axios from "axios";

import {
  getTeamMembers,
  createTeamInvitation,
} from "../../api/team.api";

import type { TeamMember } from "../../types/team";

const roleStyles: Record<TeamMember["role"], string> = {
  owner:
    "border-blue-500/20 bg-blue-500/10 text-blue-400",
  admin:
    "border-purple-500/20 bg-purple-500/10 text-purple-400",
  developer:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  viewer:
    "border-zinc-700 bg-zinc-800/60 text-zinc-400",
};

type InviteRole = "admin" | "developer" | "viewer";

const Team = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] =
    useState(false);

  const [inviteEmail, setInviteEmail] = useState("");

  const [inviteRole, setInviteRole] =
    useState<InviteRole>("developer");

  const [isInviting, setIsInviting] = useState(false);

  const [inviteError, setInviteError] = useState("");

  const [inviteSuccess, setInviteSuccess] = useState("");

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setFetchError("");

      try {
        const response = await getTeamMembers();

        setMembers(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setFetchError(
            error.response?.data?.message ||
              "Unable to load team members",
          );
        } else {
          setFetchError(
            "Unable to load team members",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleInviteMember = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setInviteError("");
    setInviteSuccess("");

    const email = inviteEmail.trim();

    if (!email) {
      setInviteError("Email is required");
      return;
    }

    setIsInviting(true);

    try {
      await createTeamInvitation({
        email,
        role: inviteRole,
      });

      setInviteSuccess(
        "Invitation sent successfully.",
      );

      setInviteEmail("");

      setTimeout(() => {
        setIsInviteModalOpen(false);
        setInviteSuccess("");
      }, 1200);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setInviteError(
          error.response?.data?.message ||
            "Unable to send invitation",
        );
      } else {
        setInviteError(
          "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsInviting(false);
    }
  };

  const closeInviteModal = () => {
    if (isInviting) {
      return;
    }

    setIsInviteModalOpen(false);
    setInviteEmail("");
    setInviteRole("developer");
    setInviteError("");
    setInviteSuccess("");
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6 text-white md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5EA1FF]/20 bg-[#5EA1FF]/10">
              <Users className="h-5 w-5 text-[#5EA1FF]" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Team
              </h1>

              <p className="mt-1 text-sm text-zinc-400">
                Manage members of your workspace.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setIsInviteModalOpen(true)
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5EA1FF] px-4 py-2.5 text-sm font-medium text-[#06101f] transition-all hover:bg-[#75afff] hover:shadow-lg hover:shadow-[#5EA1FF]/20"
        >
          <Plus className="h-4 w-4" />
          Invite member
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              Total members
            </p>

            <Users className="h-4 w-4 text-zinc-500" />
          </div>

          <p className="mt-3 text-2xl font-semibold">
            {loading ? "—" : members.length}
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              Workspace roles
            </p>

            <ShieldCheck className="h-4 w-4 text-zinc-500" />
          </div>

          <p className="mt-3 text-2xl font-semibold">
            4
          </p>
        </div>
      </div>

      {/* Error */}
      {fetchError && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {fetchError}
        </div>
      )}

      {/* Members */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60">
        <div className="border-b border-zinc-800 px-5 py-4">
          <h2 className="font-medium">
            Workspace members
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            People who have access to this workspace.
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="divide-y divide-zinc-800">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4 px-5 py-5"
              >
                <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-800" />

                <div className="flex-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
                  <div className="mt-2 h-3 w-48 animate-pulse rounded bg-zinc-800" />
                </div>

                <div className="h-7 w-20 animate-pulse rounded-lg bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-zinc-700" />

            <h3 className="mt-4 font-medium">
              No team members found
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Invite someone to start building your team.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.05,
                }}
                className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-zinc-900/50 sm:flex-row sm:items-center"
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5EA1FF]/10 font-medium text-[#5EA1FF]">
                  {member.name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                {/* User info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {member.name}
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                    <Mail className="h-3.5 w-3.5" />

                    <span className="truncate">
                      {member.email}
                    </span>
                  </div>
                </div>

                {/* Role */}
                <span
                  className={`w-fit rounded-lg border px-2.5 py-1 text-xs font-medium capitalize ${
                    roleStyles[member.role]
                  }`}
                >
                  {member.role}
                </span>

                {/* More */}
                <button
                  type="button"
                  className="hidden rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200 sm:block"
                  aria-label={`Actions for ${member.name}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              y: 10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1220] p-6 shadow-2xl"
          >
            {/* Modal Header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                    <UserPlus size={18} />
                  </div>

                  <h2 className="text-lg font-semibold text-white">
                    Invite team member
                  </h2>
                </div>

                <p className="text-sm text-zinc-400">
                  Send an invitation to join your workspace.
                </p>
              </div>

              <button
                type="button"
                onClick={closeInviteModal}
                disabled={isInviting}
                className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleInviteMember}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  />

                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(event) =>
                      setInviteEmail(
                        event.target.value,
                      )
                    }
                    placeholder="member@example.com"
                    disabled={isInviting}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 transition focus:border-[#5EA1FF]/50 focus:bg-white/[0.05]"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Role
                </label>

                <select
                  value={inviteRole}
                  onChange={(event) =>
                    setInviteRole(
                      event.target.value as InviteRole,
                    )
                  }
                  disabled={isInviting}
                  className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition focus:border-[#5EA1FF]/50"
                >
                  <option value="admin">
                    Admin
                  </option>

                  <option value="developer">
                    Developer
                  </option>

                  <option value="viewer">
                    Viewer
                  </option>
                </select>
              </div>

              {/* Error */}
              {inviteError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  {inviteError}
                </div>
              )}

              {/* Success */}
              {inviteSuccess && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
                  {inviteSuccess}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeInviteModal}
                  disabled={isInviting}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isInviting}
                  className="flex items-center gap-2 rounded-xl bg-[#5EA1FF] px-4 py-2.5 text-sm font-medium text-[#06101f] transition hover:bg-[#75afff] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isInviting && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {isInviting
                    ? "Sending..."
                    : "Send invitation"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Team;