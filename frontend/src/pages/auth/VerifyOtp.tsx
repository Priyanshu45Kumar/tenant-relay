import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

import { verifyRegistrationOtp } from "../../api/register.api";
import { saveAuth } from "../../lib/auth.storage";

interface LocationState {
  email?: string;
}

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationState | null;
  const email = state?.email ?? "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setError("");

    if (otp.length !== 6) {
      setError("OTP must contain exactly 6 digits.");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyRegistrationOtp({
        email,
        otp,
      });

      saveAuth(response.data);

      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Unable to verify OTP. Please try again.",
        );
      } else {
        setError("Unable to verify OTP. Please try again.");
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
        <div className="mb-8">
          <h2 className="text-3xl font-semibold tracking-tight">
            Verify your email
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Enter the 6-digit verification code sent to{" "}
            <span className="text-zinc-200">{email}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="otp"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Verification code
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(event) => {
                const value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);

                setOtp(value);
              }}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 text-center text-xl tracking-[0.5em] text-white outline-none transition placeholder:text-zinc-700 focus:border-zinc-500 focus:ring-2 focus:ring-white/5"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading || otp.length !== 6}
            whileHover={{
              scale: loading || otp.length !== 6 ? 1 : 1.01,
            }}
            whileTap={{
              scale: loading || otp.length !== 6 ? 1 : 0.98,
            }}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify email"}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Wrong email?{" "}
          <Link
            to="/register"
            className="font-medium text-white transition hover:text-zinc-300"
          >
            Go back
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;