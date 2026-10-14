import { useEffect, useState, type FormEvent } from "react";
import axios from "axios";
import {
  getCurrentWorkspace,
  updateWorkspace,
} from "../../api/workspace.api";

const GeneralSettings = () => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadWorkspace = async () => {
      try {
        setLoading(true);
        setError("");

        const workspace = await getCurrentWorkspace();

        if (!cancelled) {
          setName(workspace.name);
          setSlug(workspace.slug);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Unable to load workspace settings. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const normalizedSlug = slug.trim().toLowerCase();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setError("Workspace name must be between 2 and 100 characters.");
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
      setError(
        "Slug must contain lowercase letters, numbers, and single hyphens only.",
      );
      return;
    }

    try {
      setSaving(true);

      const response = await updateWorkspace({
        name: trimmedName,
        slug: normalizedSlug,
      });

      setName(response.data.name);
      setSlug(response.data.slug);
      setSuccess("Workspace settings saved successfully.");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message;

        if (status === 409) {
          setError("This workspace slug is already taken. Try another one.");
        } else if (status === 400) {
          setError(message || "Please check your workspace details.");
        } else if (status === 401 || status === 403) {
          setError("You are not authorized to update this workspace.");
        } else if (status === 404) {
          setError("Workspace not found. Please refresh and try again.");
        } else {
          setError(message || "Unable to save settings. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-white">General</h2>

        <p className="mt-1 text-sm text-zinc-400">
          Manage your workspace information.
        </p>
      </div>

      {loading ? (
        <div className="space-y-5 animate-pulse">
          <div>
            <div className="mb-2 h-4 w-32 rounded bg-zinc-800" />
            <div className="h-10 rounded-lg bg-zinc-800/70" />
          </div>

          <div>
            <div className="mb-2 h-4 w-28 rounded bg-zinc-800" />
            <div className="h-10 rounded-lg bg-zinc-800/70" />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label
              htmlFor="workspace-name"
              className="mb-2 block text-sm text-zinc-300"
            >
              Workspace name
            </label>

            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
                setSuccess("");
              }}
              maxLength={100}
              required
              disabled={saving}
              autoComplete="organization"
              placeholder="TenantRelay Workspace"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#5EA1FF] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="workspace-slug"
              className="mb-2 block text-sm text-zinc-300"
            >
              Workspace slug
            </label>

            <input
              id="workspace-slug"
              type="text"
              value={slug}
              onChange={(event) => {
                setSlug(event.target.value.toLowerCase());
                setError("");
                setSuccess("");
              }}
              maxLength={100}
              required
              disabled={saving}
              autoComplete="off"
              spellCheck={false}
              placeholder="workspace-slug"
              aria-describedby="workspace-slug-help"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#5EA1FF] disabled:cursor-not-allowed disabled:opacity-60"
            />

            <p
              id="workspace-slug-help"
              className="mt-2 text-xs text-zinc-500"
            >
              Use lowercase letters, numbers, and single hyphens.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-300"
            >
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-950" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default GeneralSettings;