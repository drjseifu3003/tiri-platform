"use client";

import { useSession } from "@/lib/session-context";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LoginView() {
  const { status, session, error, login, logout, clearError, isAuthenticated } = useSession();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/studio/dashboard");
    }
  }, [isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();

    try {
      await login({ phone, password });
      setPassword("");
    } catch {
      // handled by session state
    }
  }

  async function handleLogout() {
    clearError();

    try {
      await logout();
    } catch {
      // handled by session state
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 py-6"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(122, 26, 83, 0.12), transparent 45%), radial-gradient(circle at bottom right, rgba(91, 168, 184, 0.12), transparent 45%), var(--background)",
      }}
    >
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-2xl border bg-white md:grid-cols-2" style={{ borderColor: "var(--border-subtle)" }}>
          <div
            className="flex flex-col justify-center gap-6 p-8 text-white md:p-10"
            style={{
              background: "linear-gradient(145deg, var(--primary) 0%, var(--primary-light) 72%, var(--secondary) 100%)",
            }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-white/80">Kebkab events</p>
            <h1 className="text-3xl font-semibold leading-tight">Elevate every celebration with the Kebkab studio suite.</h1>
            <p className="text-sm text-white/85">
              Coordinate invitations, guests, and media delivery from one elegant control center.
            </p>
            <div className="rounded-xl border border-white/35 bg-white/15 p-4 text-sm backdrop-blur-sm">
              <p>
                Studio: <span className="font-medium">{session?.studio?.name ?? "Your Studio"}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-5 bg-white p-8 md:p-10">
            <div>
              <h2 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>Studio Login</h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Sign in to your Kebkab workspace</p>
            </div>

            {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

            {!isAuthenticated ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1 text-sm text-zinc-700">
                  Phone
                  <input
                    type="text"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="rounded-lg border px-3 py-2.5 outline-none focus:ring-2"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", boxShadow: "none", ['--tw-ring-color' as string]: "var(--primary-lighter)" }}
                    autoComplete="username"
                    placeholder="+12025550101"
                    required
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-zinc-700">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="rounded-lg border px-3 py-2.5 outline-none focus:ring-2"
                    style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)", boxShadow: "none", ['--tw-ring-color' as string]: "var(--primary-lighter)" }}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)" }}
                >
                  {status === "loading" ? "Signing in..." : "Enter Dashboard"}
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border p-4 text-sm" style={{ borderColor: "var(--border-subtle)", background: "var(--surface-muted)", color: "var(--text-secondary)" }}>
                  <p>
                    User: <span className="font-medium" style={{ color: "var(--primary)" }}>{session?.user.phone}</span>
                  </p>
                  <p>
                    Role: <span className="font-medium" style={{ color: "var(--secondary)" }}>{session?.user.role}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={status === "loading"}
                  className="rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-50"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--primary)" }}
                >
                  {status === "loading" ? "Working..." : "Sign out"}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
