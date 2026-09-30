"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { APIError, apiFetch } from "@/lib/api";

type User = {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
};

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountOpen, setAccountOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const data = await apiFetch("/api/auth/me/");

        if (!mounted) return;

        setUser(data?.user || data || null);
      } catch (error) {
        if (!mounted) return;

        /*
         * 401 simply means the visitor is logged out.
         * It is an expected state, not an application error.
         */
        if (
          error instanceof APIError &&
          (error.status === 401 || error.status === 403)
        ) {
          setUser(null);
          return;
        }

        /*
         * The navbar should not break the rest of the
         * website if the account endpoint is unavailable.
         */
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (
      event: MouseEvent
    ) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(
          event.target as Node
        )
      ) {
        setAccountOpen(false);
      }
    };

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const handleLogout = async () => {
    if (!user) return;

    try {
      await apiFetch("/api/auth/logout/", {
        method: "POST",
      });
    } catch (error) {
      /*
       * Even if the server request fails, don't leave
       * the UI pretending the user is still signed in.
       */
      if (
        error instanceof APIError &&
        error.status !== 401 &&
        error.status !== 403
      ) {
        // Intentionally handled silently.
      }
    } finally {
      setUser(null);
      setAccountOpen(false);
      window.location.href = "/";
    }
  };

  const getInitial = () => {
    const username =
      user?.username?.trim() || "";

    const firstName =
      user?.first_name?.trim() || "";

    if (firstName) {
      return firstName
        .charAt(0)
        .toUpperCase();
    }

    if (username) {
      return username
        .charAt(0)
        .toUpperCase();
    }

    return "A";
  };

  const displayName =
    user?.username ||
    user?.first_name ||
    "Account";

  return (
    <nav className="fixed left-1/2 top-5 z-50 w-[calc(100%-32px)] max-w-6xl -translate-x-1/2">
      <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.06] px-3 py-3 shadow-2xl shadow-purple-950/20 backdrop-blur-2xl">
        {/* Logo */}
        <Link
          href="/"
          className="rounded-full px-3 py-1 text-xl font-semibold tracking-tight"
        >
          <span className="text-purple-400">
            α
          </span>
          <span className="text-white">
            lpha
          </span>
          <span className="text-purple-400">
            Bot
          </span>
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
            href="/cv"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            CV
          </Link>

          <a
            href="/#about"
            className="text-sm text-zinc-400 transition hover:text-white"
          >
            About
          </a>
        </div>

        {/* Account / Authentication */}
        <div
          ref={accountRef}
          className="relative flex items-center gap-2"
        >
          {loading ? (
            <div
              className="h-10 w-10 animate-pulse rounded-full border border-white/10 bg-white/[0.08]"
              aria-hidden="true"
            />
          ) : user ? (
            <>
              {/* Account avatar */}
              <button
                type="button"
                onClick={() =>
                  setAccountOpen(
                    (current) => !current
                  )
                }
                aria-label="Open account menu"
                aria-expanded={accountOpen}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-300/30 bg-purple-500/20 text-sm font-semibold text-purple-200 shadow-lg shadow-purple-950/20 transition hover:scale-105 hover:border-purple-300/50 hover:bg-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
              >
                {getInitial()}
              </button>

              {/* Account dropdown */}
              {accountOpen && (
                <div className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#111114]/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl">
                  {/* Account information */}
                  <div className="rounded-xl bg-white/[0.04] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-purple-300/30 bg-purple-500/20 text-sm font-semibold text-purple-200">
                        {getInitial()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {displayName}
                        </p>

                        {user?.email && (
                          <p className="truncate text-xs text-zinc-500">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account link */}
                  <button
                    type="button"
                    onClick={() =>
                      setAccountOpen(false)
                    }
                    className="mt-2 flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    Account
                  </button>

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                  >
                    Log out
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                href="/login"
                className="hidden rounded-full px-5 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white sm:block"
              >
                Login
              </Link>

              {/* Register */}
              <Link
                href="/register"
                className="rounded-full border border-purple-300/30 bg-purple-500/90 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-500 hover:shadow-purple-500/40"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}