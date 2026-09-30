export default function CVEmptyState() {
  return (
    <div className="flex min-h-[650px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025] p-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-3xl text-purple-300">
          α
        </div>

        <h2 className="text-xl font-semibold text-white">
          Your CV workspace
        </h2>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Generate your CV and AlphaBot will create,
          analyse and tailor it for your target role.
        </p>

        <div className="mx-auto mt-8 max-w-sm space-y-2 text-left">
          <FeatureRow text="AI-generated professional CV" />
          <FeatureRow text="ATS compatibility score" />
          <FeatureRow text="Role-specific analysis" />
          <FeatureRow text="Targeted improvements" />
        </div>
      </div>
    </div>
  );
}

function FeatureRow({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-xs text-purple-300">
        ✓
      </span>

      <span className="text-xs text-zinc-500">
        {text}
      </span>
    </div>
  );
}