type CVHeaderProps = {
  quota: {
    used: number;
    remaining: number;
    limit: number;
  };
  quotaLoading: boolean;
};

export default function CVHeader({
  quota,
  quotaLoading,
}: CVHeaderProps) {
  return (
    <header className="mb-12 pt-6 sm:pt-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-purple-400/70" />

            <span className="text-xs font-medium uppercase tracking-[0.22em] text-purple-300">
              AlphaBot CV Builder
            </span>
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold leading-[1.04] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
            Build a CV for the role
            <br />

            <span className="bg-gradient-to-r from-purple-300 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              you actually want.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
            Tell AlphaBot what you have done and where you want
            to go. It creates your CV, analyses it for ATS
            compatibility and shows you exactly what could be
            improved.
          </p>
        </div>

        {/* Quota */}
        <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4 lg:min-w-[190px]">
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-600">
            Daily AI usage
          </p>

          {quotaLoading ? (
            <p className="mt-2 text-sm text-zinc-400">
              Loading...
            </p>
          ) : (
            <>
              <p className="mt-2 text-lg font-medium text-white">
                {quota.remaining}

                <span className="text-zinc-600">
                  {" "}
                  / {quota.limit}
                </span>
              </p>

              <p className="mt-1 text-xs text-zinc-600">
                requests remaining
              </p>
            </>
          )}
        </div>
      </div>
    </header>
  );
}