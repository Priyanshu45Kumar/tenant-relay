

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import axios from "axios";

import { createWebhook } from "../../api/webhook.api";
import type { WebhookEndpoint } from "../../types/webhook";

const Webhooks = () => {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [webhook, setWebhook] = useState<WebhookEndpoint | null>(null);

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

      setWebhook(response.data);

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
          Create an endpoint where TenantRelay can deliver your events.
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
            Add the URL where TenantRelay should deliver webhook events.
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
            {loading ? "Creating endpoint..." : "Create endpoint"}
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
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-600">
                Endpoint URL
              </p>

              <p className="break-all font-mono text-sm text-zinc-300">
                {webhook.url}
              </p>
            </div>

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
                Save this secret. It will be used later to verify webhook
                signatures.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Webhooks;

