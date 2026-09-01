import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-6 pt-28">

      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[140px]" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-5xl text-center">

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/5 px-5 py-2 text-sm text-purple-300 backdrop-blur-xl">
          <span>✦</span>
          Your AI Workspace
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
          Think. Create. Build. With{" "}
          <span className="bg-gradient-to-r from-purple-300 via-purple-500 to-indigo-400 bg-clip-text text-transparent">
            αlphaBot.
          </span>
        </h1>

        {/* Description */}
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl">
          Your personal AI assistant for coding, writing, learning
          and getting things done.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">

          <Link
            href="/chat"
            className="rounded-2xl border border-purple-300/30 bg-purple-500 px-8 py-4 font-medium text-white shadow-xl shadow-purple-500/20 transition duration-300 hover:-translate-y-1 hover:bg-purple-400 hover:shadow-purple-500/40"
          >
            Start Chatting →
          </Link>

          <a
            href="#tools"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 font-medium text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.08]"
          >
            Explore Tools
          </a>

        </div>
      </div>

      {/* Decorative glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[220px] w-[80%] max-w-[900px] -translate-x-1/2 rounded-full bg-purple-600/[0.06] blur-[100px]" />

      {/* Subtle horizon line */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-[70%] max-w-[700px] -translate-x-1/2 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

    </section>
  );
}