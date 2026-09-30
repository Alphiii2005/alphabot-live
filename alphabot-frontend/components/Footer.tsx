export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#09090b]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10 text-sm font-semibold text-purple-300">
                α
              </div>

              <span className="text-lg font-semibold text-white">
                αlphaBot
              </span>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500">
              A focused AI workspace for working through ideas, getting help
              with problems, and creating a professional CV.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-medium text-white">Product</h3>

            <div className="mt-4 flex flex-col gap-3 text-sm">
              <a
                href="/chat"
                className="text-zinc-500 transition hover:text-white"
              >
                AI Chat
              </a>

              <a
                href="/cv"
                className="text-zinc-500 transition hover:text-white"
              >
                CV Creator
              </a>

              <a
                href="#about"
                className="text-zinc-500 transition hover:text-white"
              >
                About
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AlphaBot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}