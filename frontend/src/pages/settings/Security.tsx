import { useState, type FormEvent } from "react";
import {
  KeyRound,
  Smartphone,
  Monitor,
  LogOut,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";
import { updatePassword } from "../../api/auth.api";

const Security = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handlePasswordSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setNotice("");
    setError("");

    if (currentPassword.length === 0 || newPassword.length === 0) {
      setError("Please enter both passwords.");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      setError("New password must be between 8 and 72 characters.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must differ from current password.");
      return;
    }

    try {
      setIsUpdating(true);

      const result = await updatePassword({
        currentPassword,
        newPassword,
      });

      setNotice(result.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setShowPassword(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Unable to update password. Please try again.";

      setError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div>
        <h2 className="text-lg font-medium">Security</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Manage your account security and sign-in preferences.
        </p>
      </div>

      {notice && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300"
        >
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            className="ml-auto"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Change password */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/10 p-2.5 text-blue-300">
            <KeyRound size={20} />
          </div>
          <div>
            <h3 className="font-medium">Change password</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Update your account password.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="current-password"
              className="mb-2 block text-sm text-zinc-300"
            >
              Current password
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
              placeholder="Enter current password"
              disabled={isUpdating}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm outline-none transition focus:border-[#5EA1FF] disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="new-password"
              className="mb-2 block text-sm text-zinc-300"
            >
              New password
            </label>

            <div className="relative">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                maxLength={72}
                required
                placeholder="Enter new password"
                disabled={isUpdating}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 pr-11 text-sm outline-none transition focus:border-[#5EA1FF] disabled:opacity-60"
              />

              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((previous) => !previous)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              Use 8–72 characters.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating && (
                <LoaderCircle size={16} className="animate-spin" />
              )}
              {isUpdating ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </section>

      {/* Two-factor authentication: demo only */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-300">
            <Smartphone size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-medium">Two-factor authentication</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Add an extra layer of protection to your account.
            </p>
            <p className="mt-2 text-xs text-amber-300">
              Demo only — no real 2FA is enabled.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={twoFactor}
            aria-label="Toggle demo two-factor authentication"
            onClick={() => {
              setTwoFactor((previous) => !previous);
              setNotice("Demo only: this toggle does not enable real 2FA.");
              setError("");
            }}
            className={`relative h-6 w-11 shrink-0 rounded-full transition ${
              twoFactor ? "bg-[#5EA1FF]" : "bg-zinc-700"
            }`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                twoFactor ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </section>

      {/* Active sessions: demo only */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-violet-500/10 p-2.5 text-violet-300">
            <Monitor size={20} />
          </div>
          <div>
            <h3 className="font-medium">Active sessions</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Devices currently signed in to your account.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 sm:flex-row sm:items-center">
          <Monitor size={20} className="text-zinc-400" />
          <div className="flex-1">
            <p className="text-sm font-medium">Current browser</p>
            <p className="mt-1 text-xs text-zinc-500">
              Windows · Chrome · Sample session
            </p>
          </div>
          <span className="w-fit rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
            Current
          </span>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setNotice("Demo only: session management is not connected.");
              setError("");
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3.5 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            <LogOut size={16} />
            Sign out other sessions
          </button>
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-zinc-800 p-4">
        <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#5EA1FF]" />
        <p className="text-sm leading-6 text-zinc-400">
          Password updates are connected to the backend. Two-factor
          authentication and session management are still UI previews.
        </p>
      </div>
    </div>
  );
};

export default Security;