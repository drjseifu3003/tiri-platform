"use client";

import { PhoneInput } from "@/components/ui/phone-input";
import { useSession } from "@/lib/session-context";
import { Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function LoginView() {
  const { status, error, login, clearError, isAuthenticated } = useSession();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  if (isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "var(--background)" }}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Redirecting...</p>
      </main>
    );
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(122, 26, 83, 0.1), transparent 40%), radial-gradient(circle at bottom right, rgba(91, 168, 184, 0.08), transparent 45%), var(--background)",
      }}
    >
      <div className="flex w-full items-center justify-center">
        <section className="grid w-full min-h-screen overflow-hidden border bg-white shadow-sm lg:grid-cols-[1.1fr_1fr]" style={{ borderColor: "var(--border-subtle)" }}>
          <div
            className="relative hidden p-10 text-white lg:flex lg:items-center lg:justify-center"
            style={{
              background: "linear-gradient(145deg, var(--primary) 0%, var(--primary-light) 72%, var(--secondary) 100%)",
            }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 50%)" }} />

            <div className="relative z-10 w-full max-w-xl">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Kebkab logo" className="h-9 w-9 rounded-md object-contain" />
                <p className="text-2xl font-semibold tracking-tight">Kebkab Events</p>
              </div>

              <h1 className="mt-14 text-5xl font-semibold leading-[1.1] tracking-tight">
                Orthodox Event
                <br />
                Planning
              </h1>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-white p-6 sm:p-8 lg:p-10">
            <div className="mx-auto flex w-full max-w-xl flex-col gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-tertiary)" }}>Welcome Back</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight" style={{ color: "var(--primary)" }}>Sign in to Kebkab</h2>
              </div>

              {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <label className="flex flex-col gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  Phone Number
                  <PhoneInput
                    value={phone}
                    onChange={(value) => setPhone(value ?? "")}
                    defaultCountry="ET"
                    className="w-full"
                    placeholder="+2519XXXXXXXX"
                    required
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                  Password
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="ui-input pr-10"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-secondary)" }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="ui-button-primary mt-2 py-2.5 disabled:opacity-50"
                >
                  {status === "loading" ? "Signing in..." : "Sign in"}
                </button>

                <p className="pt-1 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Protected by enterprise-grade security
                </p>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
