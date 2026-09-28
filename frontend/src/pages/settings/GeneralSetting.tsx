
const GeneralSettings = () => {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-white">
          General
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Manage your workspace information.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm text-zinc-300">
            Workspace name
          </label>

          <input
            type="text"
            placeholder="TenantRelay Workspace"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-300">
            Workspace slug
          </label>

          <input
            type="text"
            placeholder="workspace-slug"
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 text-sm text-zinc-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
