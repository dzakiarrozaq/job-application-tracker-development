"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser, type RegisterState } from "../actions";

import { signIn } from "next-auth/react";

const initialState: RegisterState = {};

export function RegisterForm({ oauth }: { oauth: { google: boolean; github: boolean } }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerUser, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/login?registered=1");
    }
  }, [state.success, router]);

  return (
    <div>
      <div className="mb-8">
        <Link href="/" className="text-sm font-bold tracking-tight" style={{ color: "var(--color-text)" }}>
          <span
            className="mr-2 inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--color-accent)" }}
          />
          Job Tracker
        </Link>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--color-text)" }}>
        Buat akun
      </h1>
      <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Mulai kelola lamaranmu hari ini, gratis.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Nama Lengkap
          </label>
          <input
            name="name"
            type="text"
            required
            className="input"
            placeholder="Nama kamu"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            className="input"
            placeholder="kamu@email.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Kata Sandi
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="input"
            placeholder="Minimal 6 karakter"
          />
        </div>

        {state.error ? (
          <p className="text-sm text-red-500">{state.error}</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full"
        >
          {pending ? "Memproses..." : "Buat akun"}
        </button>
      </form>

      {(oauth.google || oauth.github) && (
        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-3 text-xs" style={{ color: "var(--color-text-placeholder)" }}>
            <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
            atau
            <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
          </div>
          {oauth.google && (
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="flex w-full items-center justify-center gap-3 rounded-md bg-[#4285F4] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3367D6]"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              Daftar dengan Google
            </button>
          )}
          {oauth.github && (
            <button
              type="button"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="btn-secondary w-full"
            >
              Daftar dengan GitHub
            </button>
          )}
        </div>
      )}

      <p className="mt-8 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-medium underline underline-offset-2"
          style={{ color: "var(--color-text)" }}
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}
