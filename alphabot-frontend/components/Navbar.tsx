"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed left-1/2 top-5 z-50 w-[calc(100%-32px)] max-w-6xl -translate-x-1/2">
      <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.06] px-3 py-3 shadow-2xl shadow-purple-950/20 backdrop-blur-2xl">

        {/* Logo */}
        <Link
          href="/"
          className="rounded-full px-3 py-1 text-xl font-semibold tracking-tight"
        >
          <span className="text-purple-400">α</span>
          <span className="text-white">lpha</span>
          <span className="text-purple-400">Bot</span>
        </Link>

        {/* Main navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/chat"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Chat
          </Link>

          <Link
            href="/coder"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            Coder
          </Link>

          <a
            href="#about"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            About
          </a>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full px-5 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white sm:block"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-full border border-purple-300/30 bg-purple-500/90 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500 hover:shadow-purple-500/40"
          >
            Get Started
          </Link>
        </div>

      </div>
    </nav>
  );
}