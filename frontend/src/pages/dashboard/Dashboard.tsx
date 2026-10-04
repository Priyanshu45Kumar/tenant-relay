import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Radio,
  Webhook,
  XCircle,
} from "lucide-react";

import { getEvents } from "../../api/event.api";
import { getWebhookEndpoints } from "../../api/webhook.api";
import type { Event } from "../../types/event";
import type { WebhookEndpoint } from "../../types/webhook";

const Dashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(
  null,
);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [eventsResponse, webhooksResponse] =
          await Promise.all([
            getEvents(),
            getWebhookEndpoints(),
          ]);

        setEvents(eventsResponse.data);
        setWebhooks(webhooksResponse.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);

        setError(
          "Unable to load dashboard data. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activeWebhooks = webhooks.filter(
    (webhook) => webhook.active,
  ).length;

  const revokedWebhooks = webhooks.filter(
    (webhook) => !webhook.active,
  ).length;

  const recentEvents = events.slice(0, 5);

  const stats = [
    {
      title: "Total Events",
      value: loading ? "--" : events.length.toString(),
      description: "Events received",
      icon: Activity,
    },
    {
      title: "Active Webhooks",
      value: loading ? "--" : activeWebhooks.toString(),
      description: "Currently active",
      icon: Webhook,
    },
    {
      title: "Successful Deliveries",
      value: "--",
      description: "Delivery tracking coming soon",
      icon: CheckCircle2,
    },
    {
      title: "Failed Deliveries",
      value: "--",
      description: "Delivery tracking coming soon",
      icon: XCircle,
    },
  ];

  return (
    <div className="min-h-full bg-zinc-950 p-8 text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-400">
              Overview
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              TenantRelay Dashboard
            </h1>

            <p className="mt-2 text-zinc-400">
              Monitor your webhook infrastructure and event activity.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-400 md:flex">
            <Radio className="h-3.5 w-3.5 text-emerald-400" />

            <span className="font-mono">
              SYSTEM OPERATIONAL
            </span>
          </div>
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.08,
              }}
              className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition-all duration-200 hover:border-blue-500/30 hover:bg-zinc-900/70"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
                  <Icon className="h-5 w-5 text-blue-400" />
                </div>

                <ArrowUpRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-blue-400" />
              </div>

              <div className="mt-5">
                <p className="text-sm text-zinc-400">
                  {stat.title}
                </p>

                <p className="mt-1 text-3xl font-semibold tracking-tight">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main content */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Recent Events */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.35,
          }}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm xl:col-span-2"
        >
          <div className="flex items-center justify-between border-b border-zinc-800/80 px-5 py-4">
            <div>
              <h2 className="font-medium text-white">
                Recent Events
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Latest events received by TenantRelay
              </p>
            </div>

            <button className="text-xs font-medium text-blue-400 transition-colors hover:text-blue-300">
              View all
            </button>
          </div>

          {loading ? (
  <div className="space-y-0">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="flex items-center justify-between border-b border-zinc-800/70 px-5 py-4 last:border-0"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-800" />

          <div className="space-y-2">
            <div className="h-3 w-28 animate-pulse rounded bg-zinc-800" />
            <div className="h-2 w-40 animate-pulse rounded bg-zinc-800" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="ml-auto h-2 w-16 animate-pulse rounded bg-zinc-800" />
          <div className="ml-auto h-2 w-24 animate-pulse rounded bg-zinc-800" />
        </div>
      </div>
    ))}
  </div>
) : recentEvents.length === 0 ? (
  <div className="flex min-h-[220px] items-center justify-center px-5">
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950">
        <Activity className="h-5 w-5 text-zinc-500" />
      </div>

      <h3 className="mt-4 text-sm font-medium text-zinc-300">
        No events yet
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-500">
        Events from your application will appear here
        once TenantRelay starts receiving them.
      </p>
    </div>
  </div>
) : (
  <div className="divide-y divide-zinc-800/70">
    {recentEvents.map((event) => {
      const payloadPreview = JSON.stringify(event.payload);

      return (
        <button
  key={event.id}
  type="button"
  onClick={() => setSelectedEvent(event)}
  className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-zinc-900/70"
>
          {/* Event information */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/10 bg-blue-500/10">
              <Activity className="h-4 w-4 text-blue-400" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-zinc-200">
                  {event.type}
                </p>

                <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-0.5 font-mono text-[10px] text-zinc-500">
                  EVENT
                </span>
              </div>

              <p className="mt-1 max-w-[420px] truncate font-mono text-[11px] text-zinc-600">
                {payloadPreview}
              </p>

              <p className="mt-1 font-mono text-[10px] text-zinc-700">
                {event.id}
              </p>
            </div>
          </div>

          {/* Time */}
          <div className="shrink-0 text-right">
            <p className="text-xs font-medium text-emerald-400">
              Received
            </p>

            <p className="mt-1 text-[11px] text-zinc-500">
              {new Date(event.createdAt).toLocaleString()}
            </p>
          </div>
        </button>
      );
    })}
  </div>
)}
        </motion.div>

        {/* Webhook Activity */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.42,
          }}
          className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm"
        >
          <div className="border-b border-zinc-800/80 px-5 py-4">
            <h2 className="font-medium text-white">
              Webhook Activity
            </h2>

            <p className="mt-1 text-xs text-zinc-500">
              Current endpoint status
            </p>
          </div>

          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Webhook className="h-4 w-4 text-emerald-400" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Active endpoints
                  </p>

                  <p className="text-xs text-zinc-500">
                    Ready to receive events
                  </p>
                </div>
              </div>

              <span className="font-mono text-lg font-semibold text-emerald-400">
                {loading ? "--" : activeWebhooks}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800/60">
                  <XCircle className="h-4 w-4 text-zinc-500" />
                </div>

                <div>
                  <p className="text-sm font-medium">
                    Revoked endpoints
                  </p>

                  <p className="text-xs text-zinc-500">
                    Currently inactive
                  </p>
                </div>
              </div>

              <span className="font-mono text-lg font-semibold text-zinc-400">
                {loading ? "--" : revokedWebhooks}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
      {selectedEvent && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    onClick={() => setSelectedEvent(null)}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(event) => event.stopPropagation()}
      className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
            Event Details
          </p>

          <h2 className="mt-1 text-lg font-semibold text-white">
            {selectedEvent.type}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setSelectedEvent(null)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Event Metadata */}
      <div className="grid gap-3 border-b border-zinc-800 px-6 py-5 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">
            Event ID
          </p>

          <p className="mt-1 break-all font-mono text-xs text-zinc-300">
            {selectedEvent.id}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
          <p className="text-[11px] uppercase tracking-wide text-zinc-500">
            Created At
          </p>

          <p className="mt-1 text-xs text-zinc-300">
            {new Date(
              selectedEvent.createdAt,
            ).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payload */}
      <div className="px-6 py-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-200">
              Payload
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Raw event payload received by TenantRelay
            </p>
          </div>
        </div>

        <pre className="max-h-80 overflow-auto rounded-xl border border-zinc-800 bg-black/40 p-4 font-mono text-xs leading-6 text-zinc-300">
          {JSON.stringify(
            selectedEvent.payload,
            null,
            2,
          )}
        </pre>
      </div>
    </motion.div>
  </div>
)}
    </div>
  );
};

export default Dashboard;