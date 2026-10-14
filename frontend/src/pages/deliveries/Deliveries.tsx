
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  getDeliveries,
  replayDelivery,
} from "../../api/delivery.api";

import type {
  DeliveryRecord,
  DeliveryStatus,
} from "../../types/delivery";

const Deliveries = () => {
  const [searchParams] = useSearchParams();

  const status: DeliveryStatus =
    searchParams.get("status") === "failed"
      ? "failed"
      : "success";

  const [deliveries, setDeliveries] = useState<
    DeliveryRecord[]
  >([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replayingId, setReplayingId] = useState<
    string | null
  >(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Load deliveries
  useEffect(() => {
    let cancelled = false;

    const loadDeliveries = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getDeliveries(status, page);

        if (cancelled) return;

        setDeliveries(result.data);
        setTotalPages(
          Math.max(1, result.pagination.totalPages),
        );
      } catch {
        if (!cancelled) {
          setError(
            "Unable to load deliveries. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDeliveries();

    return () => {
      cancelled = true;
    };
  }, [status, page, refreshKey]);

  // Reset pagination when status changes
  useEffect(() => {
    setPage(1);
  }, [status]);

  // Replay failed delivery
  const handleReplay = async (deliveryId: string) => {
    try {
      setReplayingId(deliveryId);
      setError("");

      await replayDelivery(deliveryId);

      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error(
        "Failed to replay delivery:",
        error,
      );

      setError(
        "Unable to replay delivery. Please try again.",
      );
    } finally {
      setReplayingId(null);
    }
  };

  return (
    <div className="min-h-full bg-zinc-950 p-4 text-white sm:p-6 lg:p-8">
      {/* Header */}
      <div>
        <p className="text-sm text-blue-400">
          Monitoring
        </p>

        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          {status === "success"
            ? "Successful Deliveries"
            : "Failed Deliveries"}
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Review webhook delivery status and details.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      {/* Deliveries table */}
      <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b border-zinc-800 text-zinc-400">
            <tr>
              <th className="px-5 py-4 font-medium">
                Event
              </th>

              <th className="px-5 py-4 font-medium">
                Endpoint
              </th>

              <th className="px-5 py-4 font-medium">
                Status
              </th>

              <th className="px-5 py-4 font-medium">
                HTTP Status
              </th>

              <th className="px-5 py-4 font-medium">
                Attempts
              </th>

              <th className="px-5 py-4 font-medium">
                Created
              </th>

              <th className="px-5 py-4 font-medium">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800/70">
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-zinc-400"
                >
                  Loading deliveries...
                </td>
              </tr>
            ) : deliveries.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-zinc-400"
                >
                  No{" "}
                  {status === "success"
                    ? "successful"
                    : "failed"}{" "}
                  deliveries found.
                </td>
              </tr>
            ) : (
              deliveries.map((delivery) => (
                <tr
                  key={delivery._id}
                  className="transition-colors hover:bg-zinc-900/70"
                >
                  {/* Event */}
                  <td className="px-5 py-4">
                    <p className="font-medium text-zinc-200">
                      {delivery.eventId?.type ??
                        "Event unavailable"}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      ID: {delivery._id}
                    </p>

                    {status === "failed" &&
                      delivery.lastError && (
                        <p className="mt-2 max-w-xs break-words text-xs text-red-400">
                          {delivery.lastError}
                        </p>
                      )}
                  </td>

                  {/* Endpoint */}
                  <td className="px-5 py-4">
                    <p className="text-zinc-300">
                      {delivery.webhookEndpointId?.name ??
                        "Endpoint unavailable"}
                    </p>

                    <p className="mt-1 max-w-xs truncate text-xs text-zinc-500">
                      {delivery.webhookEndpointId?.url ??
                        "—"}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span
                      className={
                        status === "success"
                          ? "rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400"
                          : "rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-400"
                      }
                    >
                      {status === "success"
                        ? "Success"
                        : "Failed"}
                    </span>
                  </td>

                  {/* HTTP response */}
                  <td className="px-5 py-4 text-zinc-300">
                    {delivery.responseStatus ?? "—"}
                  </td>

                  {/* Attempts */}
                  <td className="px-5 py-4 text-zinc-300">
                    {delivery.attempts}
                  </td>

                  {/* Created date */}
                  <td className="whitespace-nowrap px-5 py-4 text-xs text-zinc-400">
                    {new Date(
                      delivery.createdAt,
                    ).toLocaleString()}
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4">
                    {status === "failed" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleReplay(delivery._id)
                        }
                        disabled={
                          replayingId === delivery._id
                        }
                        className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-sm text-blue-400 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {replayingId === delivery._id
                          ? "Retrying..."
                          : "Replay"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() =>
              setPage((current) => current - 1)
            }
            className="rounded-lg border border-zinc-800 px-4 py-2 text-sm transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() =>
              setPage((current) => current + 1)
            }
            className="rounded-lg border border-zinc-800 px-4 py-2 text-sm transition hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Deliveries;