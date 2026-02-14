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
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-violet-50 px-6 py-6">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-2xl border border-violet-100 bg-white md:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 bg-gradient-to-br from-cyan-400 to-violet-400 p-8 text-white md:p-10">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-50">Wedding Atelier</p>
            <h1 className="text-3xl font-semibold leading-tight">Craft unforgettable ceremonies with refined control.</h1>
            <p className="text-sm text-cyan-50">
              Coordinate invitations, guest journeys, and media delivery from a premium studio experience.
            </p>
            <div className="rounded-xl border border-white/40 bg-white/20 p-4 text-sm backdrop-blur-sm">
              <p>
                Studio: <span className="font-medium">{session?.studio?.name ?? "Your Studio"}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-5 bg-white p-8 md:p-10">
            <div>
              <h2 className="text-2xl font-semibold text-violet-700">Studio Login</h2>
              <p className="mt-1 text-sm text-zinc-600">Enter your private wedding operations suite</p>
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
                    className="rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-700 outline-none ring-cyan-300 focus:ring-2"
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
                    className="rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-700 outline-none ring-violet-300 focus:ring-2"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="rounded-lg bg-gradient-to-r from-cyan-400 to-violet-400 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {status === "loading" ? "Signing in..." : "Enter Dashboard"}
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
                  <p>
                    User: <span className="font-medium text-cyan-700">{session?.user.phone}</span>
                  </p>
                  <p>
                    Role: <span className="font-medium text-violet-700">{session?.user.role}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={status === "loading"}
                  className="rounded-lg border border-violet-200 px-4 py-2.5 text-sm font-medium text-violet-700 disabled:opacity-50"
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
