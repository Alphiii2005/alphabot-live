"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { APIError, apiFetch } from "@/lib/api";

type VerificationState =
  | "verifying"
  | "success"
  | "error";

export default function VerifyEmailPage() {
  const [state, setState] =
    useState<VerificationState>("verifying");

  const [message, setMessage] = useState(
    "Verifying your email..."
  );

  useEffect(() => {
    const token = new URLSearchParams(
      window.location.search
    ).get("token");

    if (!token) {
      setState("error");
      setMessage(
        "No verification token was provided. Please use the verification link from your email."
      );
      return;
    }

    const verifyEmail = async () => {
      try {
        const data = await apiFetch(
          "/api/auth/verify/",
          {
            method: "POST",
            body: JSON.stringify({ token }),
          }
        );

        setState("success");
        setMessage(
          data?.message ||
            "Your email has been verified successfully."
        );
      } catch (error) {
        setState("error");

        if (error instanceof APIError) {
          setMessage(
            error.message ||
              "We couldn't verify your email. The link may have expired or already been used."
          );
          return;
        }

        setMessage(
          error instanceof Error
            ? error.message
            : "We couldn't verify your email. Please try again."
        );
      }
    };

    verifyEmail();
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-6 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-[140px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-purple-950/20 backdrop-blur-xl sm:p-10">
          {/* Logo */}
          <div
            className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl font-semibold ${
              state === "success"
                ? "border-green-400/20 bg-green-500/10 text-green-300"
                : state === "error"
                  ? "border-red-400/20 bg-red-500/10 text-red-300"
                  : "border-purple-400/20 bg-purple-500/10 text-purple-400"
            }`}
          >
            {state === "success"
              ? "✓"
              : state === "error"
                ? "!"
                : "α"}
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-semibold sm:text-3xl">
            {state === "success"
              ? "Email verified"
              : state === "error"
                ? "Verification failed"
                : "Verify your email"}
          </h1>

          {/* Message */}
          <p
            className="mt-4 leading-7 text-zinc-400"
            role="status"
            aria-live="polite"
          >
            {message}
          </p>

          {/* Loading */}
          {state === "verifying" && (
            <div
              className="mx-auto mt-7 h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-purple-400"
              aria-label="Verifying email"
            />
          )}

          {/* Success */}
          {state === "success" && (
            <Link
              href="/login"
              className="mt-8 inline-flex rounded-xl bg-purple-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-400"
            >
              Go to Login →
            </Link>
          )}

          {/* Error */}
          {state === "error" && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <Link
                href="/login"
                className="inline-flex rounded-xl bg-purple-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-400"
              >
                Go to Login
              </Link>

              <Link
                href="/register"
                className="text-sm text-zinc-500 transition hover:text-white"
              >
                Create a new account
              </Link>
            </div>
          )}
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-zinc-600 transition hover:text-zinc-300"
          >
            ← Back to AlphaBot
          </Link>
        </div>
      </div>
    </main>
  );
}