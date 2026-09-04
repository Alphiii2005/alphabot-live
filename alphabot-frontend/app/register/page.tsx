"use client";

import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [lockedOpen, setLockedOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isExpanded = lockedOpen || hovered;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-6 pt-24 text-white">
      <div className="relative z-10 w-[450px] max-w-[calc(100vw-32px)]">
        {/* Register Card */}
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onClick={() => setLockedOpen(true)}
          className={`group relative w-full cursor-pointer overflow-hidden border-4 border-[#09090b] bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 transition-all duration-500 ${
            isExpanded
              ? "h-[680px] -translate-y-1 rotate-x-[2deg] rotate-y-[-2deg] shadow-[12px_12px_0_#050505,20px_20px_0_rgba(124,58,237,0.18),0_0_40px_rgba(124,58,237,0.15)]"
              : "h-[110px] shadow-[8px_8px_0_#050505,16px_16px_0_rgba(124,58,237,0.12)] hover:-translate-y-1"
          }`}
        >
          {/* Shine */}
          <div
            className={`pointer-events-none absolute inset-y-0 -left-full z-30 w-[60%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 ${
              isExpanded ? "left-[140%]" : ""
            }`}
          />

          {/* Corner Triangle */}
          <div
            className={`absolute right-[-4px] top-[-4px] z-40 h-14 w-14 transition-all duration-500 [clip-path:polygon(0_0,100%_0,100%_100%)] ${
              isExpanded ? "bg-[#DDD6FE]" : "bg-[#09090b]"
            }`}
          />

          {/* Decorative Line */}
          <div
            className={`absolute left-7 top-7 h-[3px] transition-all duration-500 ${
              isExpanded ? "w-16 bg-white/50" : "w-12 bg-white/30"
            }`}
          />

          {/* Collapsed Content */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
              isExpanded
                ? "pointer-events-none -translate-y-10 scale-75 opacity-0"
                : "opacity-100"
            }`}
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-4">
                <span className="text-6xl font-semibold text-white">
                  α
                </span>

                <span className="text-2xl font-extrabold uppercase tracking-[0.14em] text-white">
                  Register
                </span>
              </div>

              <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-white/50">
                Create workspace
              </p>
            </div>
          </div>

          {/* Expanded Content */}
          <div
            className={`relative flex h-full flex-col justify-center px-12 py-10 transition-all duration-500 ${
              isExpanded
                ? "translate-y-0 scale-100 opacity-100"
                : "pointer-events-none translate-y-10 scale-90 opacity-0"
            }`}
          >
            {/* Header */}
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-white/20 bg-[#09090b]/20 text-3xl font-semibold text-white shadow-[4px_4px_0_rgba(0,0,0,0.35)]">
                α
              </div>

              <h1 className="text-2xl font-extrabold uppercase tracking-[0.08em]">
                Create account
              </h1>

              <p className="mt-2 text-sm text-white/55">
                Build your AlphaBot workspace
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={(event) => event.preventDefault()}
              className="space-y-4"
            >
              {/* Username */}
              <div>
                <label
                  htmlFor="register-username"
                  className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-white/70"
                >
                  Username
                </label>

                <input
                  id="register-username"
                  type="text"
                  placeholder="alphin"
                  required
                  onClick={(event) => event.stopPropagation()}
                  className="w-full border-2 border-[#09090b] bg-[#f5f5f5] px-4 py-3.5 text-sm font-bold text-[#09090b] shadow-[5px_5px_0_#09090b] outline-none placeholder:text-zinc-400 focus:bg-white"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="register-email"
                  className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-white/70"
                >
                  Email
                </label>

                <input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  onClick={(event) => event.stopPropagation()}
                  className="w-full border-2 border-[#09090b] bg-[#f5f5f5] px-4 py-3.5 text-sm font-bold text-[#09090b] shadow-[5px_5px_0_#09090b] outline-none placeholder:text-zinc-400 focus:bg-white"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="register-password"
                  className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-white/70"
                >
                  Password
                </label>

                <input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  required
                  onClick={(event) => event.stopPropagation()}
                  className="w-full border-2 border-[#09090b] bg-[#f5f5f5] px-4 py-3.5 text-sm font-bold text-[#09090b] shadow-[5px_5px_0_#09090b] outline-none placeholder:text-zinc-400 focus:bg-white"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="register-confirm"
                  className="mb-2 block text-xs font-extrabold uppercase tracking-[0.1em] text-white/70"
                >
                  Confirm password
                </label>

                <input
                  id="register-confirm"
                  type="password"
                  placeholder="••••••••"
                  required
                  onClick={(event) => event.stopPropagation()}
                  className="w-full border-2 border-[#09090b] bg-[#f5f5f5] px-4 py-3.5 text-sm font-bold text-[#09090b] shadow-[5px_5px_0_#09090b] outline-none placeholder:text-zinc-400 focus:bg-white"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                onClick={(event) => event.stopPropagation()}
                className="mt-2 w-full border-2 border-[#09090b] bg-[#09090b] px-4 py-3.5 text-sm font-extrabold uppercase tracking-[0.08em] text-white shadow-[5px_5px_0_rgba(255,255,255,0.25)] transition hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                Create AlphaBot
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-xs text-white/55">
                Already have an account?{" "}
                <Link
                  href="/login"
                  onClick={(event) => event.stopPropagation()}
                  className="font-extrabold text-white underline underline-offset-2 transition hover:text-purple-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-zinc-600 transition hover:text-zinc-300"
          >
            ← Back
          </Link>
        </div>
      </div>
    </main>
  );
}