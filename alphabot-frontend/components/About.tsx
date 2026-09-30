export default function About() {
  return (
    <section
      id="about"
      className="relative px-6 py-32"
    >
      <div className="mx-auto max-w-6xl">

        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">

          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            AI for the things{" "}
            <span className="bg-gradient-to-r from-purple-300 via-purple-500 to-indigo-400 bg-clip-text text-transparent">
              you're working on.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Use AlphaBot to work through ideas, get help when you're stuck,
            and create a CV tailored to the opportunity you're targeting.
          </p>

        </div>

        {/* Feature cards */}
        <div className="mt-20 grid gap-6 md:grid-cols-2">

          {/* Chat */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition duration-300 hover:border-purple-400/30 hover:bg-white/[0.05]">

            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl transition duration-500 group-hover:bg-purple-500/20" />

            <div className="relative">

              <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-sm font-semibold text-purple-300">
                •••
              </div>

              <p className="mb-2 text-sm font-medium text-purple-300">
                AI Chat
              </p>

              <h3 className="text-2xl font-semibold text-white">
                A place to work things out.
              </h3>

              <p className="mt-4 leading-7 text-zinc-400">
                Ask questions, explore ideas, rewrite text, work through
                problems or get help with code. Start with what you have and
                let the conversation take it from there.
              </p>

              {/* Mini chat preview */}
              <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">

                <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-purple-500/15 px-4 py-3 text-sm text-zinc-200">
                  I'm stuck on how to structure this project.
                </div>

                <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-zinc-400">
                  Let's break it down into the main features, the data you
                  need and what you can build first.
                </div>

              </div>

            </div>
          </div>

          {/* CV */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition duration-300 hover:border-indigo-400/30 hover:bg-white/[0.05]">

            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl transition duration-500 group-hover:bg-indigo-500/20" />

            <div className="relative">

              <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/20 bg-indigo-500/10 text-sm font-semibold text-indigo-300">
                CV
              </div>

              <p className="mb-2 text-sm font-medium text-indigo-300">
                CV Creator
              </p>

              <h3 className="text-2xl font-semibold text-white">
                Prepare for the role you're after.
              </h3>

              <p className="mt-4 leading-7 text-zinc-400">
                Add your experience, skills and education. AlphaBot creates a
                professional CV, checks it against your target role and gives
                you suggestions to improve it.
              </p>

              {/* Mini CV preview */}
              <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <div className="h-3 w-28 rounded-full bg-white/20" />
                    <div className="mt-2 h-2 w-20 rounded-full bg-white/10" />
                  </div>

                  <div className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-300">
                    ATS Score
                  </div>

                </div>

                <div className="mt-6 space-y-3">
                  <div className="h-2 w-full rounded-full bg-white/10" />
                  <div className="h-2 w-[92%] rounded-full bg-white/10" />
                  <div className="h-2 w-[76%] rounded-full bg-white/10" />
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500">
                    Skills
                  </span>

                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500">
                    Experience
                  </span>

                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500">
                    Projects
                  </span>

                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Workflow */}
        <div className="mt-20">

          <p className="text-center text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
            How it works
          </p>

          <div className="mx-auto mt-8 flex max-w-3xl flex-col md:flex-row md:items-center">

            {/* Step 1 */}
            <div className="flex items-center gap-4 md:flex-1">

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm text-zinc-300">
                01
              </span>

              <span className="text-sm text-zinc-400">
                Bring what you're working on
              </span>

            </div>

            {/* Connector */}
            <div className="ml-5 h-8 w-px bg-white/10 md:ml-0 md:h-px md:w-auto md:flex-1" />

            {/* Step 2 */}
            <div className="flex items-center gap-4 md:flex-1">

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm text-zinc-300">
                02
              </span>

              <span className="text-sm text-zinc-400">
                Work through it with AI
              </span>

            </div>

            {/* Connector */}
            <div className="ml-5 h-8 w-px bg-white/10 md:ml-0 md:h-px md:w-auto md:flex-1" />

            {/* Step 3 */}
            <div className="flex items-center gap-4 md:flex-1">

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm text-zinc-300">
                03
              </span>

              <span className="text-sm text-zinc-400">
                Leave with something useful
              </span>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}