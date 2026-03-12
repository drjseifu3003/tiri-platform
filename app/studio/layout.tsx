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
      { label: "Media", href: "/studio/media" },
      { label: "Data Insight", href: "/studio/insights" },
      { label: "Settings", href: "/studio/settings/account" },
    ],
    []
  );

  const titleByPath = useMemo(
    () => ({
      "/studio/dashboard": "Overview",
      "/studio/events": "Events",
      "/studio/guests": "Guests",
      "/studio/media": "Media",
      "/studio/insights": "Data Insight",
      "/studio/insights/anniversary": "Data Insight",
      "/studio/settings/account": "Settings",
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
      <main className="flex min-h-screen items-center justify-center px-6" style={{ background: "var(--background)" }}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Preparing your studio...</p>
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
    const iconClass = active ? "text-white" : "text-[var(--text-secondary)]";

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

    if (label === "Data Insight") {
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`h-4 w-4 ${iconClass}`} aria-hidden>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M8 15l3-3 3 2 4-5" />
          <circle cx="8" cy="15" r="1" fill="currentColor" stroke="none" />
          <circle cx="11" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="14" cy="14" r="1" fill="currentColor" stroke="none" />
          <circle cx="18" cy="9" r="1" fill="currentColor" stroke="none" />
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
    <main
      className="h-screen w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at top right, rgba(122, 26, 83, 0.07), transparent 45%), radial-gradient(circle at bottom left, rgba(91, 168, 184, 0.06), transparent 45%), var(--background)",
      }}
    >
      <div className="grid h-full w-full lg:grid-cols-[240px_1fr]">
        <aside
          className="sticky top-0 flex h-screen flex-col border-r px-3 py-4 backdrop-blur"
          style={{
            borderColor: "var(--border-subtle)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, var(--surface-muted) 100%)",
          }}
        >
          <div className="flex items-center gap-2 px-2 pb-4">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg text-xs font-semibold">
              {session?.studio?.logoUrl ? (
                <img
                  src={session.studio.logoUrl}
                  alt={`${session?.studio?.name ?? "Studio"} logo`}
                  className="h-full w-full object-cover"
                />
              ) : (
                (session?.studio?.name ?? "S").slice(0, 1).toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight" style={{ color: "var(--primary)" }}>{session?.studio?.name ?? "Studio"}</p>
            </div>
          </div>

          <nav className="mt-1 flex flex-col gap-1.5 px-1">
            {navigation.map((item) => {
              let active = pathname === item.href;
              // Special case for Events: highlight if viewing events or event details
              if (item.label === "Events") {
                active = pathname.startsWith("/studio/events");
              }
              if (item.label === "Data Insight") {
                active = pathname.startsWith("/studio/insights");
              }
              // Keep Settings selected across all settings sub-pages (account, notifications, team, etc.)
              if (item.label === "Settings") {
                active = pathname.startsWith("/studio/settings");
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "font-semibold" : "hover:bg-[var(--surface-muted)]"}`}
                  style={
                    active
                      ? {
                          color: "var(--surface)",
                          background: "var(--primary)",
                        }
                      : {
                          color: "var(--text-secondary)",
                          background: "transparent",
                        }
                  }
                >
                  <NavIcon label={item.label} active={active} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="h-screen overflow-y-auto bg-transparent">
          <header
            className="sticky top-0 z-20 flex items-center justify-between border-b px-4 py-3 backdrop-blur sm:px-6"
            style={{
              borderColor: "var(--border-subtle)",
              background: "linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.9) 100%)",
              boxShadow: "0 2px 12px rgba(42, 42, 42, 0.04)",
            }}
          >
            <div>
              <h1 className="text-sm font-semibold tracking-tight" style={{ color: "var(--primary)" }}>{currentTitle}</h1>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{session?.studio?.name ?? "Studio"}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen((value) => !value);
                    setAccountOpen(false);
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition hover:opacity-80"
                  style={{ background: "var(--primary-lighter)", borderColor: "var(--border-subtle)", color: "var(--primary)" }}
                  aria-label="Open notifications"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
                    <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                    <path d="M10 17a2 2 0 0 0 4 0" />
                  </svg>
                </button>

                {notificationsOpen ? (
                  <div className="absolute right-0 z-30 mt-2 w-72 rounded-xl border bg-white p-3 shadow-lg" style={{ borderColor: "var(--border-subtle)" }}>
                    <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>Notifications</p>
                    <p className="mt-2 rounded-lg border px-3 py-2 text-xs" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                      No notifications for now.
                    </p>
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
                  className="flex items-center gap-2 rounded-full border py-1 pl-1 pr-2 transition hover:opacity-80"
                  style={{ background: "var(--secondary-lighter)", borderColor: "var(--border-subtle)", color: "var(--secondary)" }}
                  aria-label="Open account menu"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold" style={{ background: "var(--secondary-light)", color: "var(--secondary)" }}>
                    {(session?.studio?.name ?? "S").slice(0, 1).toUpperCase()}
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {accountOpen ? (
                  <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-2xl border bg-white shadow-xl" style={{ borderColor: "var(--border-subtle)" }}>
                    <div className="flex items-center gap-3 border-b px-4 py-4" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)" }}>
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold" style={{ background: "var(--primary)", color: "var(--surface)" }}>
                        {(session?.user.role ?? "U").slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold" style={{ color: "var(--text-primary)" }}>{session?.user.role}</p>
                        <p className="truncate text-xs" style={{ color: "var(--text-secondary)" }}>{session?.user.phone}</p>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        href="/studio/settings/account"
                        className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-[var(--surface-muted)]"
                        onClick={() => setAccountOpen(false)}
                      >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
                            <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
                            <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.1a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.1a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2h.1a1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.1a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.1a1 1 0 0 0-.9.6z" />
                          </svg>
                        </span>
                        <span>
                          <span className="block text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Settings</span>
                          <span className="block text-xs" style={{ color: "var(--text-secondary)" }}>Manage account details</span>
                        </span>
                      </Link>
                    </div>

                    <div className="border-t p-2" style={{ borderColor: "var(--border-subtle)" }}>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-red-50"
                        style={{ color: "var(--error)" }}
                      >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "var(--error-light)" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden>
                            <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
                            <path d="M16 17l5-5-5-5" />
                            <path d="M21 12H9" />
                          </svg>
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">Log Out</span>
                          <span className="block text-xs">Sign out of account</span>
                        </span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <div className="px-2 pb-3 pt-2 sm:px-3 sm:pb-4 sm:pt-3">
            <div className="w-full">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
