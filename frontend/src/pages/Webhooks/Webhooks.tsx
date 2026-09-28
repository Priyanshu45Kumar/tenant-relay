

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import axios from "axios";

import {
  createWebhook,
  getWebhookEndpoints,
  deactivateWebhook
} from "../../api/webhook.api";

import type { WebhookEndpoint } from "../../types/webhook";

const Webhooks = () => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetchingWebhooks, setFetchingWebhooks] = useState(false);

  const [error, setError] = useState("");
  const [fetchError, setFetchError] = useState("");

  const [webhook, setWebhook] = useState<WebhookEndpoint | null>(null);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  /*
   * Fetch all webhook endpoints
   * when the page loads.
   */
  useEffect(() => {
    const fetchWebhooks = async () => {
      setFetchingWebhooks(true);
      setFetchError("");

      try {
        const response = await getWebhookEndpoints();

        setWebhooks(response.data);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setFetchError(
            error.response?.data?.message ||
              "Unable to fetch webhook endpoints.",
          );
        } else {
          setFetchError("Unable to fetch webhook endpoints.");
        }
      } finally {
        setFetchingWebhooks(false);
      }
    };

    fetchWebhooks();
  }, []);

  /*
   * Create a new webhook endpoint.
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    setError("");
    setWebhook(null);
    setLoading(true);

    try {
      const response = await createWebhook({
        name,
        url,
      });

      const createdWebhook = response.data;

      // Show newly created webhook details
      setWebhook(createdWebhook);

      // Add newly created webhook to the list immediately
      setWebhooks((currentWebhooks) => [
        createdWebhook,
        ...currentWebhooks,
      ]);

      // Clear form
      setName("");
      setUrl("");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Unable to create webhook endpoint.",
        );
      } else {
        setError("Unable to create webhook endpoint.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string): Promise<void> => {
  const confirmed = window.confirm(
    "Are you sure you want to revoke this webhook endpoint?",
  );

  if (!confirmed) {
    return;
  }

  setRevokingId(id);

  try {
    await deactivateWebhook(id);

    setWebhooks((currentWebhooks) =>
      currentWebhooks.map((webhook) =>
        webhook.id === id
          ? { ...webhook, active: false }
          : webhook,
      ),
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      setFetchError(
        error.response?.data?.message ||
          "Unable to revoke webhook endpoint.",
      );
    } else {
      setFetchError("Unable to revoke webhook endpoint.");
    }
  } finally {
    setRevokingId(null);
  }
};

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-blue-400">
          Workspace
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Webhooks
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Create and manage the endpoints where TenantRelay
          delivers your events.
        </p>
      </div>

      {/* Create webhook */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl shadow-black/10"
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Create webhook endpoint
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Add the URL where TenantRelay should deliver webhook
            events.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label
              htmlFor="webhook-name"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Endpoint name
            </label>

            <input
              id="webhook-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Payment Webhook"
              required
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* URL */}
          <div>
            <label
              htmlFor="webhook-url"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Endpoint URL
            </label>

            <input
              id="webhook-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://api.example.com/webhooks"
              required
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
            />

            <p className="mt-2 text-xs text-zinc-600">
              TenantRelay will send webhook events to this URL.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating endpoint..."
              : "Create endpoint"}
          </motion.button>
        </form>
      </motion.div>

      {/* Success */}
      {webhook && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6"
        >
          <div className="mb-5">
            <p className="text-sm font-medium text-emerald-400">
              Endpoint created
            </p>

            <h2 className="mt-1 text-lg font-semibold text-white">
              {webhook.name}
            </h2>
          </div>

          <div className="space-y-4">
            {/* URL */}
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-600">
                Endpoint URL
              </p>

              <p className="break-all font-mono text-sm text-zinc-300">
                {webhook.url}
              </p>
            </div>

            {/* Secret */}
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-600">
                Signing secret
              </p>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                <p className="break-all font-mono text-xs text-zinc-400">
                  {webhook.secret}
                </p>
              </div>

              <p className="mt-2 text-xs text-amber-500/80">
                Save this secret. It will be used later to verify
                webhook signatures.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Existing Webhooks */}
      <div className="mt-10">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            Your webhook endpoints
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Manage the endpoints connected to your workspace.
          </p>
        </div>

        {/* Loading */}
        {fetchingWebhooks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
          >
            <p className="text-sm text-zinc-500">
              Loading webhook endpoints...
            </p>
          </motion.div>
        )}

        {/* Fetch Error */}
        {!fetchingWebhooks && fetchError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6"
          >
            <p className="text-sm text-red-400">
              {fetchError}
            </p>
          </motion.div>
        )}

        {/* Empty State */}
        {!fetchingWebhooks &&
          !fetchError &&
          webhooks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
            >
              <p className="text-sm text-zinc-500">
                No webhook endpoints found.
              </p>
            </motion.div>
          )}

        {/* Webhook List */}
        {!fetchingWebhooks &&
          !fetchError &&
          webhooks.length > 0 && (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <motion.div
                  key={webhook.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-zinc-700"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Webhook information */}
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-white">
                        {webhook.name}
                      </h3>

                      <p className="mt-2 break-all font-mono text-sm text-zinc-400">
                        {webhook.url}
                      </p>

                      <p className="mt-3 text-xs text-zinc-600">
                        Created{" "}
                        {new Date(
                          webhook.createdAt,
                        ).toLocaleString()}
                      </p>
                    </div>

                    {/* Status */}
                    <span
                      className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        webhook.active
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {webhook.active ? "Active" : "Inactive"}
                    </span>
                    {webhook.active && (
    <button
      type="button"
      onClick={() => handleRevoke(webhook.id)}
      disabled={revokingId === webhook.id}
      className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {revokingId === webhook.id ? "Revoking..." : "Revoke"}
    </button>
  )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default Webhooks;