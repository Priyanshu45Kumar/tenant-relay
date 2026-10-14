import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Archive,
  ArrowRightLeft,
  CheckCircle2,
  LockKeyhole,
  Trash2,
  X,
} from "lucide-react";

type DangerAction = "archive" | "delete";

const DangerZone = () => {
  const [modal, setModal] = useState<DangerAction | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [notice, setNotice] = useState("");

  const closeModal = () => {
    setModal(null);
    setConfirmation("");
  };

  const handleConfirm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!modal) return;

    const expected = modal === "delete" ? "DELETE" : "ARCHIVE";

    if (confirmation !== expected) return;

    setNotice(
      modal === "delete"
        ? "Demo only: workspace deletion is not connected."
        : "Demo only: workspace archiving is not connected.",
    );

    closeModal();
  };

  return (
    <div className="space-y-6 text-white">
      <div>
        <h2 className="text-lg font-medium">Danger Zone</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Manage sensitive actions for your workspace.
        </p>
      </div>

      {notice && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200"
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

      <section className="rounded-xl border border-rose-500/30 bg-rose-500/[0.04] p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-rose-300">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-medium text-rose-200">
              Sensitive actions
            </h3>
            <p className="mt-1 text-sm leading-6 text-zinc-400">
              These actions may affect workspace ownership, access, or data.
            </p>
          </div>
        </div>

        {/* Transfer ownership */}
        <div className="flex flex-col gap-4 border-b border-zinc-800 py-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h4 className="text-sm font-medium">Transfer ownership</h4>
            <p className="mt-1 text-sm leading-6 text-zinc-400">
              Transfer workspace ownership to another member.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setNotice("Demo only: ownership transfer is not connected.")
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 px-3.5 py-2.5 text-sm text-zinc-200 transition hover:border-zinc-500"
          >
            <ArrowRightLeft size={16} />
            Transfer ownership
          </button>
        </div>

        {/* Archive */}
        <div className="flex flex-col gap-4 border-b border-zinc-800 py-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h4 className="text-sm font-medium">Archive workspace</h4>
            <p className="mt-1 text-sm leading-6 text-zinc-400">
              Archive this workspace in a future implementation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmation("");
              setModal("archive");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-500/30 px-3.5 py-2.5 text-sm text-amber-200 transition hover:bg-amber-500/10"
          >
            <Archive size={16} />
            Archive workspace
          </button>
        </div>

        {/* Delete */}
        <div className="flex flex-col gap-4 pt-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-rose-200">
              Delete workspace
            </h4>
            <p className="mt-1 text-sm leading-6 text-zinc-400">
              Permanently deleting a workspace could remove access to its data.
              This preview does not delete anything.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setConfirmation("");
              setModal("delete");
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-200 transition hover:bg-rose-500/20"
          >
            <Trash2 size={16} />
            Delete workspace
          </button>
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-xl border border-zinc-800 p-4">
        <LockKeyhole size={19} className="mt-0.5 shrink-0 text-zinc-400" />
        <p className="text-sm leading-6 text-zinc-400">
          This is a demo interface. No ownership, archive, or deletion operation
          changes your actual workspace.
        </p>
      </div>

      {/* Confirmation modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="danger-modal-title"
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0D111B] p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 text-rose-300">
                  {modal === "delete" ? (
                    <Trash2 size={20} />
                  ) : (
                    <Archive size={20} />
                  )}
                </div>
                <h3 id="danger-modal-title" className="font-semibold">
                  {modal === "delete"
                    ? "Delete workspace?"
                    : "Archive workspace?"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close dialog"
                className="text-zinc-500 transition hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <p className="mb-5 text-sm leading-6 text-zinc-400">
              {modal === "delete"
                ? "Type DELETE to preview the confirmation flow. No data will be deleted."
                : "Type ARCHIVE to preview the confirmation flow. No data will be archived."}
            </p>

            <form onSubmit={handleConfirm} className="space-y-4">
              <label
                htmlFor="danger-confirmation"
                className="block text-sm text-zinc-300"
              >
                Type{" "}
                <span className="font-mono font-semibold text-rose-300">
                  {modal === "delete" ? "DELETE" : "ARCHIVE"}
                </span>{" "}
                to confirm
              </label>

              <input
                id="danger-confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="off"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm outline-none focus:border-rose-500"
                placeholder={modal === "delete" ? "DELETE" : "ARCHIVE"}
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    confirmation !==
                    (modal === "delete" ? "DELETE" : "ARCHIVE")
                  }
                  className="rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Confirm demo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DangerZone;