

import { useState } from "react";
import { KeyRound, Plus, Copy, Check, X } from "lucide-react";
import {
  createApiKey,
  getApiKeys,
  revokeApiKey,
} from "../../api/apiKey";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStoredAuth } from "../../lib/auth.storage";

const ApiKeys = () => {
  const auth = getStoredAuth();

const canManageApiKeys =
  auth?.role === "owner" || auth?.role === "admin";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // -----------------------------
  // Revoke API key state
  // -----------------------------
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // -----------------------------
  // React Query
  // -----------------------------
  const queryClient = useQueryClient();

  const {
    data: apiKeys = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["api-keys"],
    queryFn: getApiKeys,
  });

  // -----------------------------
  // Create API key
  // -----------------------------
  const handleCreateApiKey = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    try {
      setIsCreating(true);

      const response = await createApiKey({
        name: trimmedName,
      });

      // Show the secret key only once
      setCreatedApiKey(response.apiKey);

      // Refresh API keys list
      await queryClient.invalidateQueries({
        queryKey: ["api-keys"],
      });

      setName("");
    } catch (error) {
      console.error("Failed to create API key:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // -----------------------------
  // Open revoke modal
  // -----------------------------
  const handleOpenRevokeModal = (apiKey: {
    id: string;
    name: string;
  }) => {
    setSelectedApiKey(apiKey);
    setIsRevokeModalOpen(true);
  };

  // -----------------------------
  // Close revoke modal
  // -----------------------------
  const handleCloseRevokeModal = () => {
    if (isRevoking) {
      return;
    }

    setIsRevokeModalOpen(false);
    setSelectedApiKey(null);
  };

  // -----------------------------
  // Revoke API key
  // -----------------------------
  const handleRevokeApiKey = async () => {
    if (!selectedApiKey) {
      return;
    }

    try {
      setIsRevoking(true);

      await revokeApiKey(selectedApiKey.id);

      // Refresh API keys list
      await queryClient.invalidateQueries({
        queryKey: ["api-keys"],
      });

      // Close modal after successful revoke
      setIsRevokeModalOpen(false);
      setSelectedApiKey(null);
    } catch (error) {
      console.error("Failed to revoke API key:", error);
    } finally {
      setIsRevoking(false);
    }
  };

  // -----------------------------
  // Copy API key
  // -----------------------------
  const handleCopy = async () => {
    if (!createdApiKey) {
      return;
    }

    try {
      await navigator.clipboard.writeText(createdApiKey);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy API key:", error);
    }
  };

  // -----------------------------
  // Close create modal
  // -----------------------------
  const handleClose = () => {
    if (isCreating) {
      return;
    }

    setIsModalOpen(false);
    setCreatedApiKey(null);
    setName("");
    setCopied(false);
  };

  return (
    <div>
      {/* =========================
          Header
      ========================== */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-white">
            API Keys
          </h2>

          <p className="mt-1 text-sm text-zinc-400">
            Manage credentials used by your applications to
            communicate with TenantRelay.
          </p>
        </div>

        {canManageApiKeys &&(<button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
        >
          <Plus size={16} />
          Create API key
        </button>
        )}
      </div>
      

      {/* =========================
          API Keys List
      ========================== */}
      {isLoading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
          <p className="text-sm text-zinc-500">
            Loading API keys...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-10 text-center">
          <p className="text-sm text-red-400">
            Failed to load API keys.
          </p>
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
          <KeyRound
            size={22}
            className="mx-auto mb-4 text-zinc-500"
          />

          <h3 className="text-sm font-medium text-white">
            No API keys yet
          </h3>

          <p className="mt-1 text-sm text-zinc-500">
            Create an API key to allow your application to
            send events to TenantRelay.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/30">
          {apiKeys.map((apiKey) => (
            <div
              key={apiKey.id}
              className="flex items-center justify-between gap-4 border-b border-zinc-800 px-5 py-4 last:border-b-0"
            >
              {/* Left side */}
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900">
                  <KeyRound
                    size={17}
                    className="text-zinc-400"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {apiKey.name}
                  </p>

                  <code className="font-mono text-xs text-zinc-500">
                    {apiKey.prefix}
                  </code>
                </div>
              </div>

              {/* Right side */}
              <div className="flex shrink-0 items-center gap-5">
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`flex items-center gap-1.5 text-xs ${
                      apiKey.active
                        ? "text-emerald-400"
                        : "text-zinc-500"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        apiKey.active
                          ? "bg-emerald-400"
                          : "bg-zinc-500"
                      }`}
                    />

                    {apiKey.active ? "Active" : "Revoked"}
                  </span>

                  <span className="text-xs text-zinc-600">
                    {new Date(
                      apiKey.createdAt
                    ).toLocaleDateString()}
                  </span>
                </div>

                {/* Revoke button */}
                {canManageApiKeys && apiKey.active && (
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenRevokeModal({
                        id: apiKey.id,
                        name: apiKey.name,
                      })
                    }
                    className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================
          Create API Key Modal
      ========================== */}
      {canManageApiKeys && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            {/* Modal header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">
                  {createdApiKey
                    ? "API key created"
                    : "Create API key"}
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  {createdApiKey
                    ? "Copy your secret key now. It will not be shown again."
                    : "Create a credential for your application."}
                </p>
              </div>

              {!createdApiKey && (
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isCreating}
                  className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Create form */}
            {!createdApiKey ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  API key name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Production"
                  autoFocus
                  disabled={isCreating}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <p className="mt-2 text-xs text-zinc-600">
                  Use a name that helps you identify where this
                  key is being used.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isCreating}
                    className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateApiKey}
                    disabled={!name.trim() || isCreating}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCreating
                      ? "Creating..."
                      : "Create key"}
                  </button>
                </div>
              </div>
            ) : (
              /* Secret display */
              <div>
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-amber-400">
                    Secret API key
                  </p>

                  <div className="flex items-center gap-2">
                    <code className="min-w-0 flex-1 break-all rounded-md bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-300">
                      {createdApiKey}
                    </code>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex shrink-0 items-center gap-2 rounded-md border border-zinc-800 px-3 py-2 text-xs text-zinc-300 transition hover:bg-zinc-900"
                    >
                      {copied ? (
                        <>
                          <Check size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  Store this key securely. For security reasons,
                  TenantRelay will not show the full key again.
                </p>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================
          Revoke Confirmation Modal
      ========================== */}
      {canManageApiKeys && isRevokeModalOpen && selectedApiKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            {/* Modal header */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">
                  Revoke API key
                </h3>

                <p className="mt-2 text-sm text-zinc-400">
                  Are you sure you want to revoke{" "}
                  <span className="font-medium text-white">
                    {selectedApiKey.name}
                  </span>
                  ?
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseRevokeModal}
                disabled={isRevoking}
                className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Warning */}
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm leading-5 text-red-400">
                This action cannot be undone. Any application
                using this API key will no longer be able to
                authenticate.
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseRevokeModal}
                disabled={isRevoking}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRevokeApiKey}
                disabled={isRevoking}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRevoking ? "Revoking..." : "Revoke key"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeys;