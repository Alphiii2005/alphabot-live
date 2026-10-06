"use client";

import Link from "next/link";
import { useState } from "react";
import { APIError, apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const [lockedOpen, setLockedOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isExpanded = lockedOpen || hovered;

  async function handleRegister(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);

    const username = String(
      formData.get("username") || ""
    ).trim();

    const email = String(
      formData.get("email") || ""
    ).trim();

    const password = String(
      formData.get("password") || ""
    );

    const confirm = String(
      formData.get("confirm") || ""
    );

    if (!username || !email || !password || !confirm) {
      setError(
        "Please complete all the fields before creating your account."
      );
      return;
    }

    if (password !== confirm) {
      setError("Your passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Your password must be at least 8 characters long."
      );
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/api/auth/register/", {
        method: "POST",
        body: JSON.stringify({
          username,
          email,
          password,
          confirm_password: confirm,
        }),
      });

      setSuccess(
        "Account created! We've sent a verification email to your inbox. Please verify your email before logging in."
      );
    } catch (error) {
      if (error instanceof APIError) {
        const backendErrors =
          error.data?.errors ||
          error.data?.field_errors;

        if (
          backendErrors &&
          typeof backendErrors === "object"
        ) {
          const firstError = Object.values(
            backendErrors
          )[0];

          if (Array.isArray(firstError)) {
            setError(String(firstError[0]));
          } else {
            setError(String(firstError));
          }
        } else {
          setError(
            error.message ||
              "We couldn't create your account. Please check your details and try again."
          );
        }
      } else {
        setError(
          error instanceof Error
            ? error.message
            : "We couldn't create your account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

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
              ? "h-[760px] -translate-y-1 rotate-x-[2deg] rotate-y-[-2deg] shadow-[12px_12px_0_#050505,20px_20px_0_rgba(124,58,237,0.18),0_0_40px_rgba(124,58,237,0.15)]"
              : "h-[110px] shadow-[8px_8px_0_#050505,16px_16px_0_rgba(124,58,237,0.12)] hover:-translate-y-1"
          }`}
        >
          {/* Shine */}
          <div
            className={`pointer-events-none absolute inset-y-0 -left-full z-30 w-[60%] skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 ${
              isExpanded
                ? "left-[140%]"
                : ""
            }`}
          />

          {/* Corner Triangle */}
          <div
            className={`absolute right-[-4px] top-[-4px] z-40 h-14 w-14 transition-all duration-500 [clip-path:polygon(0_0,100%_0,100%_100%)] ${
              isExpanded
                ? "bg-[#DDD6FE]"
                : "bg-[#09090b]"
            }`}
          />

          {/* Decorative Line */}
          <div
            className={`absolute left-7 top-7 h-[3px] transition-all duration-500 ${
              isExpanded
                ? "w-16 bg-white/50"
                : "w-12 bg-white/30"
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

            {/* Feedback */}
            {(error || success) && (
              <div
                role="status"
                aria-live="polite"
                className={`mb-5 border-2 px-4 py-3 text-sm font-medium ${
                  error
                    ? "border-red-950/40 bg-red-950/25 text-red-100"
                    : "border-green-950/40 bg-green-950/25 text-green-100"
                }`}
              >
                {error || success}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleRegister}
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
                  name="username"
                  type="text"
                  placeholder="alphin"
                  autoComplete="username"
                  required
                  disabled={loading}
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  className="w-full border-2 border-[#09090b] bg-[#f5f5f5] px-4 py-3.5 text-sm font-bold text-[#09090b] shadow-[5px_5px_0_#09090b] outline-none placeholder:text-zinc-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
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
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  className="w-full border-2 border-[#09090b] bg-[#f5f5f5] px-4 py-3.5 text-sm font-bold text-[#09090b] shadow-[5px_5px_0_#09090b] outline-none placeholder:text-zinc-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
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
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  className="w-full border-2 border-[#09090b] bg-[#f5f5f5] px-4 py-3.5 text-sm font-bold text-[#09090b] shadow-[5px_5px_0_#09090b] outline-none placeholder:text-zinc-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
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
                  name="confirm"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                  className="w-full border-2 border-[#09090b] bg-[#f5f5f5] px-4 py-3.5 text-sm font-bold text-[#09090b] shadow-[5px_5px_0_#09090b] outline-none placeholder:text-zinc-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                onClick={(event) =>
                  event.stopPropagation()
                }
                className="mt-2 w-full border-2 border-[#09090b] bg-[#09090b] px-4 py-3.5 text-sm font-extrabold uppercase tracking-[0.08em] text-white shadow-[5px_5px_0_rgba(255,255,255,0.25)] transition hover:translate-x-[1px] hover:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating..."
                  : "Create AlphaBot"}
              </button>
            </form>

            {/* Verification message */}
            <div className="mt-5 text-center">
              <p className="text-[11px] leading-5 text-white/45">
                After creating your account, we'll send
                you a verification link by email.
              </p>
            </div>

            {/* Login Link */}
            <div className="mt-5 text-center">
              <p className="text-xs text-white/55">
                Already have an account?{" "}
                <Link
                  href="/login"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
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