type CVResultToolbarProps = {
  targetRole: string;
  isEditing: boolean;
  downloading: boolean;
  onStartEditing: () => void;
  onDownload: () => void;
  onCancelEditing: () => void;
  onSaveEditing: () => void;
};

export default function CVResultToolbar({
  targetRole,
  isEditing,
  downloading,
  onStartEditing,
  onDownload,
  onCancelEditing,
  onSaveEditing,
}: CVResultToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-white">
            Generated CV
          </p>

          <span className="rounded-full border border-purple-400/15 bg-purple-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-purple-300">
            {targetRole}
          </span>
        </div>

        <p className="mt-1 text-xs text-zinc-500">
          Review, edit and download your finished CV.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {!isEditing && (
          <>
            <button
              type="button"
              onClick={onStartEditing}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              Edit CV
            </button>

            <button
              type="button"
              onClick={onDownload}
              disabled={downloading}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {downloading ? "Creating PDF..." : "Download PDF"}
            </button>
          </>
        )}

        {isEditing && (
          <>
            <button
              type="button"
              onClick={onCancelEditing}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onSaveEditing}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Save changes
            </button>
          </>
        )}
      </div>
    </div>
  );
}