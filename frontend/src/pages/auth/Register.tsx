import { useState, type FormEvent } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

import { requestRegistrationOtp } from "../../api/register.api";

const Register = () => {
  const [searchParams] = useSearchParams();

  const invitationToken = searchParams.get("invitationToken");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tenantName, setTenantName] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const isInvitationRegistration = Boolean(invitationToken);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await requestRegistrationOtp({
        name,
        email,
        password,
        tenantName,
        ...(invitationToken
          ? { invitationToken }
          : {}),
      });

      navigate("/verify-otp", {
        state: {
          email,
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("Status:", error.response?.status);
        console.log("Backend response:", error.response?.data);

        setError(
          error.response?.data?.message ||
            "Unable to start registration.",
        );
      } else {
        console.error("Registration failed:", error);
        setError("Unable to start registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold tracking-tight">
            {isInvitationRegistration
              ? "Join your workspace"
              : "Create your account"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {isInvitationRegistration
              ? "Complete your account setup to join the workspace."
              : "Create your TenantRelay workspace and get started."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Full name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-white/5"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-white/5"
            />
          </div>

          {/* Workspace */}
          <div>
            <label
              htmlFor="tenantName"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Workspace name
            </label>

            <input
              id="tenantName"
              type="text"
              placeholder={
                isInvitationRegistration
                  ? "Workspace from invitation"
                  : "My Company"
              }
              value={tenantName}
              onChange={(event) =>
                setTenantName(event.target.value)
              }
              required
              disabled={isInvitationRegistration}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            />

            {isInvitationRegistration && (
              <p className="mt-2 text-xs text-zinc-500">
                Your workspace is determined by the invitation.
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-white/5"
            />

            <p className="mt-2 text-xs text-zinc-500">
              At least 8 characters with uppercase, lowercase,
              and a number.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{
              scale: loading ? 1 : 1.01,
            }}
            whileTap={{
              scale: loading ? 1 : 0.98,
            }}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Sending verification code..."
              : "Continue"}
          </motion.button>
        </form>

        {/* Login */}
        <p className="mt-8 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-white transition hover:text-zinc-300"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;