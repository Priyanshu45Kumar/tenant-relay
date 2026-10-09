import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import axios from "axios";

import { acceptTeamInvitation } from "../../api/team.api";
import { getStoredAuth } from "../../lib/auth.storage";

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleAcceptInvitation = async () => {
    if (!token) {
      setError("Invitation token is missing.");
      return;
    }

    const auth = getStoredAuth();

    // User is not logged in.
    // Send them to registration while preserving the invitation token.
    if (!auth?.accessToken) {
      navigate(
        `/register?invitationToken=${encodeURIComponent(token)}`,
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      await acceptTeamInvitation({
        token,
      });

      setSuccess(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Unable to accept invitation.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo / Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#5EA1FF]/20 bg-[#5EA1FF]/10">
              <ShieldCheck className="h-7 w-7 text-[#5EA1FF]" />
            </div>
          </div>

          {!token ? (
            <>
              <div className="mb-5 flex justify-center">
                <XCircle className="h-12 w-12 text-red-400" />
              </div>

              <h1 className="text-center text-2xl font-semibold">
                Invalid invitation
              </h1>

              <p className="mt-2 text-center text-sm text-zinc-400">
                This invitation link is missing a valid token.
              </p>

              <Link
                to="/dashboard"
                className="mt-6 block rounded-xl bg-[#5EA1FF] px-4 py-3 text-center text-sm font-medium text-[#06101f] transition hover:bg-[#75afff]"
              >
                Go to dashboard
              </Link>
            </>
          ) : success ? (
            <>
              <div className="mb-5 flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              </div>

              <h1 className="text-center text-2xl font-semibold">
                Invitation accepted
              </h1>

              <p className="mt-2 text-center text-sm text-zinc-400">
                You are now a member of the workspace.
              </p>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="mt-6 w-full rounded-xl bg-[#5EA1FF] px-4 py-3 text-sm font-medium text-[#06101f] transition hover:bg-[#75afff]"
              >
                Go to dashboard
              </button>
            </>
          ) : (
            <>
              <h1 className="text-center text-2xl font-semibold">
                Join workspace
              </h1>

              <p className="mt-2 text-center text-sm leading-6 text-zinc-400">
                You have been invited to join a TenantRelay
                workspace.
              </p>

              {error && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleAcceptInvitation}
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5EA1FF] px-4 py-3 text-sm font-medium text-[#06101f] transition hover:bg-[#75afff] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  "Accept invitation"
                )}
              </button>

              <p className="mt-5 text-center text-xs text-zinc-500">
                If you don't have a TenantRelay account, you'll
                be asked to create one first.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AcceptInvite;