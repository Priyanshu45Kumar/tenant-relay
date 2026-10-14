

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Radio,
  RefreshCw,
  Webhook,
  X,
  XCircle,
} from "lucide-react";

import {
  getEvents,
  getDeliveryStats,
} from "../../api/event.api";
import { getWebhookEndpoints } from "../../api/webhook.api";

import type { Event, DeliveryStats } from "../../types/event";
import type { WebhookEndpoint } from "../../types/webhook";

const Dashboard = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);

  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats>({
    successful: 0,
    failed: 0,
    pending: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          eventsResponse,
          webhooksResponse,
          deliveryResponse,
        ] = await Promise.all([
          getEvents(),
          getWebhookEndpoints(),
          getDeliveryStats(),
        ]);

        if (cancelled) return;

        setEvents(eventsResponse.data);
        setWebhooks(webhooksResponse.data);
        setDeliveryStats(deliveryResponse.data);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to fetch dashboard data:", err);
        setError("Unable to load dashboard data. Please try again.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      cancelled = true;
    };
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
      value: events.length.toLocaleString(),
      description: "Events received",
      icon: Activity,
      color: "blue",
      clickable: false,
    },
    {
      title: "Active Webhooks",
      value: activeWebhooks.toLocaleString(),
      description: "Currently active endpoints",
      icon: Webhook,
      color: "blue",
      clickable: false,
    },
    {
      title: "Successful Deliveries",
      value: deliveryStats.successful.toLocaleString(),
      description: "Successfully delivered",
      icon: CheckCircle2,
      color: "emerald",
      clickable: true,
      status: "success",
    },
    {
      title: "Failed Deliveries",
      value: deliveryStats.failed.toLocaleString(),
      description: "Require attention",
      icon: XCircle,
      color: "rose",
      clickable: true,
      status: "failed",
    },
  ];

  const handleStatClick = (status?: string) => {
    if (!status) return;
    navigate(`/deliveries?status=${status}`);
  };

  const formatDate = (date: string | Date) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return parsedDate.toLocaleString();
  };

  const getPayloadPreview = (payload: unknown) => {
    try {
      const serialized = JSON.stringify(payload);
      if (!serialized) return "No payload";
      return serialized.length > 110
        ? `${serialized.slice(0, 110)}…`
        : serialized;
    } catch {
      return "Payload preview unavailable";
    }
  };

  return (
    <div className="min-h-full text-white">
      {/* Dashboard header */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5EA1FF]" />
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5EA1FF]">
              Workspace overview
            </p>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Monitor your webhook infrastructure, event activity, and delivery
            outcomes from one place.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.08] bg-[#0D1320] px-3 py-2">
          <Radio className="h-3.5 w-3.5 text-[#5EA1FF]" />
          <span className="font-mono text-[11px] tracking-wide text-slate-400">
            WORKSPACE OVERVIEW
          </span>
        </div>
      </motion.section>

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-col gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
            <div>
              <p className="text-sm font-medium text-rose-300">
                Dashboard data unavailable
              </p>
              <p className="mt-1 text-xs leading-5 text-rose-300/70">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-rose-400/20 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-400/10"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </motion.div>
      )}

      {/* Stats cards */}
      <section
        aria-label="Workspace statistics"
        className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          const iconColor =
            stat.color === "emerald"
              ? "text-emerald-400"
              : stat.color === "rose"
                ? "text-rose-400"
                : "text-[#5EA1FF]";

          const iconBackground =
            stat.color === "emerald"
              ? "border-emerald-400/15 bg-emerald-400/[0.08]"
              : stat.color === "rose"
                ? "border-rose-400/15 bg-rose-400/[0.08]"
                : "border-[#5EA1FF]/15 bg-[#5EA1FF]/[0.08]";

          const isClickable = stat.clickable;

          return (
            <motion.div
              key={stat.title}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onClick={
                isClickable
                  ? () => handleStatClick(stat.status)
                  : undefined
              }
              onKeyDown={
                isClickable
                  ? (event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        handleStatClick(stat.status);
                      }
                    }
                  : undefined
              }
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.35,
                delay: index * 0.07,
              }}
              className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0D1320]/80 p-5 backdrop-blur-xl transition-all duration-300 ${
                isClickable
                  ? "cursor-pointer hover:-translate-y-1 hover:border-[#5EA1FF]/35 hover:bg-[#111A2A] hover:shadow-lg hover:shadow-blue-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EA1FF]"
                  : "hover:border-white/[0.12]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border ${iconBackground}`}
                >
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>

                {isClickable && (
                  <ArrowUpRight className="h-4 w-4 text-slate-600 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#5EA1FF]" />
                )}
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-slate-400">
                  {stat.title}
                </p>

                {loading ? (
                  <div className="mt-3 h-9 w-24 animate-pulse rounded-md bg-white/[0.07]" />
                ) : (
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </p>
                )}

                <p className="mt-2 text-xs text-slate-500">
                  {stat.description}
                </p>
              </div>

              {isClickable && (
                <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <span className="text-xs text-slate-500 transition-colors group-hover:text-[#5EA1FF]">
                    View deliveries
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-600 transition-colors group-hover:text-[#5EA1FF]" />
                </div>
              )}
            </motion.div>
          );
        })}
      </section>

      {/* Main dashboard panels */}
      <section className="mt-6 grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent events */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0D1320]/70 backdrop-blur-xl xl:col-span-2"
        >
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Recent Events
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Latest events received by your workspace
              </p>
            </div>

            <span className="shrink-0 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5 font-mono text-[10px] text-slate-400">
              {loading ? "LOADING" : `${recentEvents.length} EVENTS`}
            </span>
          </div>

          {loading ? (
            <div className="divide-y divide-white/[0.05]">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-5 py-5 sm:px-6"
                >
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-white/[0.06]" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3 w-32 animate-pulse rounded bg-white/[0.07]" />
                    <div className="h-2.5 w-48 max-w-full animate-pulse rounded bg-white/[0.05]" />
                    <div className="h-2 w-28 animate-pulse rounded bg-white/[0.04]" />
                  </div>

                  <div className="hidden space-y-2 sm:block">
                    <div className="ml-auto h-2.5 w-20 animate-pulse rounded bg-white/[0.06]" />
                    <div className="ml-auto h-2 w-14 animate-pulse rounded bg-white/[0.04]" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentEvents.length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center px-6 py-10">
              <div className="max-w-sm text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
                  <Activity className="h-6 w-6 text-slate-500" />
                </div>

                <h3 className="mt-4 text-sm font-medium text-slate-200">
                  No events yet
                </h3>

                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Once your application sends events to TenantRelay, they
                  will appear here for monitoring.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {recentEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  className="group flex w-full min-w-0 items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#5EA1FF] sm:px-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#5EA1FF]/15 bg-[#5EA1FF]/[0.07]">
                    <Activity className="h-4 w-4 text-[#5EA1FF]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-200 transition-colors group-hover:text-white">
                        {event.type}
                      </p>

                      <span className="shrink-0 rounded border border-white/[0.08] px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-slate-500">
                        EVENT
                      </span>
                    </div>

                    <p className="mt-1 truncate font-mono text-[11px] text-slate-500">
                      {getPayloadPreview(event.payload)}
                    </p>

                    <p className="mt-1 truncate font-mono text-[10px] text-slate-600">
                      ID: {event.id}
                    </p>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-[11px] font-medium text-slate-400">
                      Received
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      {formatDate(event.createdAt)}
                    </p>
                  </div>

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-700 transition-colors group-hover:text-[#5EA1FF]" />
                </button>
              ))}
            </div>
          )}

          {!loading && recentEvents.length > 0 && (
            <div className="border-t border-white/[0.05] px-5 py-3 sm:px-6">
              <p className="text-[11px] text-slate-600">
                Select an event to inspect its complete payload.
              </p>
            </div>
          )}
        </motion.div>

        {/* Webhook activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.28 }}
          className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0D1320]/70 backdrop-blur-xl"
        >
          <div className="border-b border-white/[0.07] px-5 py-4 sm:px-6">
            <h2 className="text-sm font-semibold text-white">
              Webhook Activity
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Current endpoint and queue overview
            </p>
          </div>

          <div className="space-y-3 p-4 sm:p-5">
            {/* Active endpoints */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/10 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.07]">
                  <Webhook className="h-4 w-4 text-emerald-400" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">
                    Active endpoints
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Enabled webhooks
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="h-6 w-8 animate-pulse rounded bg-white/[0.07]" />
              ) : (
                <span className="font-mono text-xl font-semibold text-emerald-400">
                  {activeWebhooks}
                </span>
              )}
            </div>

            {/* Revoked endpoints */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/10 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03]">
                  <XCircle className="h-4 w-4 text-slate-400" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">
                    Inactive endpoints
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Disabled webhooks
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="h-6 w-8 animate-pulse rounded bg-white/[0.07]" />
              ) : (
                <span className="font-mono text-xl font-semibold text-slate-300">
                  {revokedWebhooks}
                </span>
              )}
            </div>

            {/* Pending deliveries */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/10 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/10 bg-amber-400/[0.07]">
                  <Clock3 className="h-4 w-4 text-amber-400" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">
                    Pending deliveries
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Awaiting an outcome
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="h-6 w-8 animate-pulse rounded bg-white/[0.07]" />
              ) : (
                <span className="font-mono text-xl font-semibold text-amber-400">
                  {deliveryStats.pending}
                </span>
              )}
            </div>

            <div className="rounded-xl border border-[#5EA1FF]/10 bg-[#5EA1FF]/[0.035] p-4">
              <div className="flex items-start gap-3">
                <Activity className="mt-0.5 h-4 w-4 shrink-0 text-[#5EA1FF]" />

                <div>
                  <p className="text-xs font-medium text-slate-300">
                    Delivery monitoring
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Use the delivery views to inspect failed attempts and
                    replay eligible deliveries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Event details modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0B101B] shadow-2xl shadow-black/50"
          >
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-5 sm:px-6">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5EA1FF]">
                  Event inspection
                </p>

                <h2
                  id="event-modal-title"
                  className="mt-2 break-words text-lg font-semibold text-white"
                >
                  {selectedEvent.type}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Inspect the event metadata and received payload.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                aria-label="Close event details"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] text-slate-400 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EA1FF]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Event metadata */}
            <div className="grid gap-3 border-b border-white/[0.07] px-5 py-4 sm:grid-cols-2 sm:px-6">
              <div className="min-w-0 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Event ID
                </p>
                <p className="mt-2 break-all font-mono text-xs leading-5 text-slate-300">
                  {selectedEvent.id}
                </p>
              </div>

              <div className="min-w-0 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Created at
                </p>
                <p className="mt-2 break-words text-xs leading-5 text-slate-300">
                  {formatDate(selectedEvent.createdAt)}
                </p>
              </div>
            </div>

            {/* Payload */}
            <div className="px-5 py-5 sm:px-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-slate-200">
                    Payload
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Event data received by TenantRelay
                  </p>
                </div>

                <span className="rounded-md border border-white/[0.07] px-2 py-1 font-mono text-[10px] text-slate-500">
                  JSON
                </span>
              </div>

              <pre className="max-h-[42vh] overflow-auto rounded-xl border border-white/[0.07] bg-black/30 p-4 font-mono text-xs leading-6 text-slate-300">
                {JSON.stringify(selectedEvent.payload, null, 2) ??
                  "No payload available"}
              </pre>
            </div>

            <div className="flex justify-end border-t border-white/[0.07] px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5EA1FF]"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
