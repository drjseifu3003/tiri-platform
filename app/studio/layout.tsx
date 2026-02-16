"use client";

import { useSession } from "@/lib/session-context";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const { status, session, logout } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  const navigation = useMemo(
    () => [
      { label: "Overview", href: "/studio/dashboard" },
      { label: "Events", href: "/studio/events" },
      { label: "Templates", href: "/studio/templates" },
      { label: "Guests", href: "/studio/guests" },
      { label: "Media", href: "/studio/media" },
      { label: "Settings", href: "/studio/settings/account" },
    ],
    []
  );

  const titleByPath = useMemo(
    () => ({
      "/studio/dashboard": "Overview",
      "/studio/events": "Events",
      "/studio/guests": "Guests",
      "/studio/templates": "Templates",
      "/studio/media": "Media",
      "/studio/settings/account": "Settings",
      "/studio/settings/notifications": "Settings",
      "/studio/settings/team": "Settings",
    }),
    []
  );

  const currentTitle = titleByPath[pathname as keyof typeof titleByPath] ?? "Studio";

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;

      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }

      if (accountRef.current && !accountRef.current.contains(target)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  if (status === "idle" || status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-6">
        <p className="text-sm text-zinc-600">Preparing your studio...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    router.replace("/");
    return null;
  }

  async function handleLogout() {
    setAccountOpen(false);
    await logout();
    router.replace("/");
  }

  function NavIcon({ label, active }: { label: string; active: boolean }) {
    const iconClass = active ? "text-white" : "text-zinc-500";

    if (label === "Overview") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-4 w-4 ${iconClass}`} aria-hidden>
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
      );
    }

    if (label === "Events") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-4 w-4 ${iconClass}`} aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 10h18" />
        </svg>
      );
    }

    if (label === "Guests") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-4 w-4 ${iconClass}`} aria-hidden>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 19a6 6 0 0 1 12 0" />
          <circle cx="17" cy="9" r="2" />
        </svg>
      );
    }

    if (label === "Templates") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-4 w-4 ${iconClass}`} aria-hidden>
          <path d="M4 6h16v12H4z" />
          <path d="M4 10h16M9 6v12" />
        </svg>
      );
    }

    if (label === "Media") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-4 w-4 ${iconClass}`} aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="M21 15l-5-4-6 6-3-3-4 4" />
        </svg>
      );
    }

    if (label === "Settings") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-4 w-4 ${iconClass}`} aria-hidden>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.1a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.1a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.1a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.1a1 1 0 0 0-.9.6z" />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-4 w-4 ${iconClass}`} aria-hidden>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.1a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.1a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.1a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.1a1 1 0 0 0-.9.6z" />
      </svg>
    );
  }

  return (
    <main className="h-screen w-full overflow-hidden bg-transparent">
      <div className="grid h-full w-full lg:grid-cols-[240px_1fr]">
        <aside className="sticky top-0 flex h-screen flex-col border-r border-zinc-200 bg-white/90 px-3 py-4 backdrop-blur">
          <div className="flex items-center gap-2 px-2 pb-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-r from-cyan-400 to-violet-400 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                <path d="M12 3v18M3 12h18" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-700">{session?.studio?.name ?? "Studio"}</p>
            </div>
          </div>

          <nav className="mt-1 flex flex-col gap-1 px-1">
            {navigation.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                    active
                      ? "bg-gradient-to-r from-cyan-400 to-violet-400 text-white shadow-sm"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <NavIcon label={item.label} active={active} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-zinc-200 px-3 pt-4 text-xs text-zinc-500">Studio Operations</div>
        </aside>

        <section className="h-screen overflow-y-auto bg-transparent">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-cyan-400 to-violet-400 px-3 py-1.5 text-xs font-medium text-white"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden>
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                </svg>
                {currentTitle}
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600"
              >
                Studio Overview
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen((value) => !value);
                    setAccountOpen(false);
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 transition hover:bg-cyan-100"
                  aria-label="Open notifications"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
                    <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                    <path d="M10 17a2 2 0 0 0 4 0" />
                  </svg>
                </button>

                {notificationsOpen ? (
                  <div className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg">
                    <p className="text-sm font-semibold text-violet-700">Notifications</p>
                    <div className="mt-2 space-y-2">
                      <p className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                        Guest check-in activity is up for recent events.
                      </p>
                      <p className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 text-xs text-zinc-600">
                        Two event pages are still in draft and ready for review.
                      </p>
                    </div>
                    <Link
                      href="/studio/settings/notifications"
                      className="mt-3 inline-flex text-xs font-medium text-cyan-700"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      Manage notifications
                    </Link>
                  </div>
                ) : null}
              </div>

              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen((value) => !value);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 py-1 pl-1 pr-2 text-violet-700 transition hover:bg-violet-100"
                  aria-label="Open account menu"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-200 text-xs font-semibold text-violet-700">
                    {(session?.studio?.name ?? "S").slice(0, 1).toUpperCase()}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {accountOpen ? (
                  <div className="absolute right-0 z-30 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg">
                    <p className="text-sm font-semibold text-violet-700">Studio Account</p>
                    <p className="mt-1 text-xs text-zinc-500">{session?.studio?.name ?? "Studio"}</p>

                    <div className="mt-3 space-y-2 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                      <p className="text-xs text-zinc-500">Phone</p>
                      <p className="text-sm font-medium text-zinc-700">{session?.user.phone}</p>
                      <p className="text-xs text-zinc-500">Role</p>
                      <p className="text-sm font-medium text-zinc-700">{session?.user.role}</p>
                    </div>

                    <Link
                      href="/studio/settings/account"
                      className="mt-3 inline-flex rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-700"
                      onClick={() => setAccountOpen(false)}
                    >
                      Account settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-2 inline-flex w-full justify-center rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-medium text-violet-700"
                    >
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <div className="px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5">{children}</div>
        </section>
      </div>
    </main>
  );
}
