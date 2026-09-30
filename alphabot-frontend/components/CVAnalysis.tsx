type CVAnalysisProps = {
  score: number | null;
  analysis: string;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  missingInformation: string[];
  jobDescription: string;
};

export default function CVAnalysis({
  score,
  analysis,
  strengths,
  improvements,
  missingKeywords,
  missingInformation,
  jobDescription,
}: CVAnalysisProps) {
  const scoreLabel =
    score === null
      ? ""
      : score >= 85
      ? "Strong match"
      : score >= 70
      ? "Good foundation"
      : score >= 50
      ? "Needs improvement"
      : "Needs work";

  return (
    <div className="space-y-5">
      {/* Score */}
      {score !== null && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-sm font-medium text-white">
                ATS compatibility
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                AI analysis for your target role
                {jobDescription
                  ? " and the supplied job description."
                  : "."}
              </p>
            </div>

            <div className="text-right">
              <p className="text-3xl font-semibold tracking-tight text-white">
                {score}
                <span className="text-sm text-zinc-600">
                  /100
                </span>
              </p>

              <p className="mt-1 text-xs text-purple-300">
                {scoreLabel}
              </p>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700"
              style={{
                width: `${Math.min(
                  Math.max(score, 0),
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Analysis */}
      {analysis && (
        <AnalysisCard
          title="AI analysis"
          text={analysis}
        />
      )}

      {/* Strengths */}
      {strengths.length > 0 && (
        <AnalysisList
          title="What's working"
          items={strengths}
          variant="positive"
        />
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <AnalysisList
          title="What to improve"
          items={improvements}
          variant="purple"
        />
      )}

      {/* Missing keywords */}
      {missingKeywords.length > 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Missing keywords
            </h2>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
              Relevant terms AlphaBot identified for this
              target role.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {missingKeywords.map((keyword, index) => (
              <span
                key={`${keyword}-${index}`}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing information */}
      {missingInformation.length > 0 && (
        <AnalysisList
          title="Information you could add"
          items={missingInformation}
          variant="neutral"
        />
      )}
    </div>
  );
}

function AnalysisCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
      <h2 className="text-sm font-semibold text-white">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-zinc-400">
        {text}
      </p>
    </div>
  );
}

function AnalysisList({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "positive" | "purple" | "neutral";
}) {
  const iconClass =
    variant === "positive"
      ? "bg-emerald-500/10 text-emerald-300"
      : variant === "purple"
      ? "bg-purple-500/10 text-purple-300"
      : "bg-white/[0.06] text-zinc-400";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
      <h2 className="text-sm font-semibold text-white">
        {title}
      </h2>

      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3"
          >
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${iconClass}`}
            >
              {variant === "positive"
                ? "✓"
                : variant === "purple"
                ? "!"
                : "•"}
            </span>

            <p className="text-sm leading-5 text-zinc-400">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}