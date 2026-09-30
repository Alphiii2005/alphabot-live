import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden px-6 pt-28">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-[38%] h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/[0.08] blur-[140px]" />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
        {/* Badge */}
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-400 backdrop-blur-xl">
          <span className="text-purple-300">✦</span>
          αlphaBot Workspace
        </div>

        {/* Heading */}
        <h1 className="mx-auto max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl md:text-7xl lg:text-[82px]">
          Work through ideas.
          <br />
          <span className="bg-gradient-to-r from-purple-300 via-purple-500 to-indigo-400 bg-clip-text text-transparent">
            Build what comes next.
          </span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
          αlphaBot gives you a focused place to chat with AI, work through
          problems and create a professional CV tailored to the role you're
          targeting.
        </p>

        {/* Actions */}
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/chat"
            className="group inline-flex items-center justify-center gap-2 rounded-xl border border-purple-300/30 bg-purple-500 px-7 py-3.5 font-medium text-white shadow-lg shadow-purple-500/20 transition duration-300 hover:-translate-y-0.5 hover:bg-purple-400 hover:shadow-purple-500/30"
          >
            Try AI Chat
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </Link>

          <Link
            href="/cv"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-7 py-3.5 font-medium text-zinc-200 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white/[0.08]"
          >
            Create a CV
          </Link>
        </div>

        {/* Product preview */}
        <div className="relative mx-auto mt-20 max-w-4xl">
          <div className="pointer-events-none absolute inset-x-10 -bottom-10 h-32 rounded-full bg-purple-600/10 blur-[80px]" />

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111114] shadow-2xl shadow-black/40">
            {/* Window bar */}
            <div className="flex h-10 items-center border-b border-white/10 px-4">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              </div>

              <div className="mx-auto rounded-md border border-white/5 bg-white/[0.03] px-12 py-1 text-[10px] text-zinc-600">
                αlphabot
              </div>

              <div className="w-10" />
            </div>

            {/* Preview */}
            <div className="grid min-h-[230px] grid-cols-[130px_1fr] text-left">
              {/* Sidebar */}
              <div className="border-r border-white/10 p-4">
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/15 text-[9px] font-semibold text-purple-300">
                    α
                  </div>
                  <span className="text-[11px] font-medium text-zinc-300">
                    αlphaBot
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="rounded-lg bg-white/[0.06] px-3 py-2 text-[10px] text-zinc-300">
                    Chat
                  </div>
                  <div className="px-3 py-2 text-[10px] text-zinc-600">
                    CV Creator
                  </div>
                </div>
              </div>

              {/* Chat preview */}
              <div className="flex flex-col p-5 sm:p-7">
                <div className="mb-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-purple-400">
                    AI Chat
                  </p>

                  <p className="mt-2 text-sm font-medium text-zinc-200 sm:text-base">
                    What are you working on?
                  </p>
                </div>

                <div className="ml-auto max-w-[75%] rounded-xl rounded-br-sm border border-purple-400/10 bg-purple-500/10 px-4 py-3 text-[10px] leading-5 text-zinc-300 sm:text-xs">
                  I need help structuring my project and figuring out what to
                  build first.
                </div>

                <div className="mt-3 max-w-[78%] rounded-xl rounded-bl-sm border border-white/10 bg-white/[0.03] px-4 py-3 text-[10px] leading-5 text-zinc-500 sm:text-xs">
                  Let's break it down into the core features, the data you
                  need and a sensible first step.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Small product statement */}
        <p className="mt-7 text-xs text-zinc-600">
          Chat with AI · Create your CV · Improve your next application
        </p>
      </div>

      {/* Bottom glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-[70%] max-w-[800px] -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
    </section>
  );
}