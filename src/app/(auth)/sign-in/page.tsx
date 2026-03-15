"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCredentialsSignIn = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      identifier,
      password,
      callbackUrl: "/",
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid credentials or unverified account.");
      return;
    }

    if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_28%),linear-gradient(180deg,_#08111f,_#0f172a)] px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/30 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden bg-[linear-gradient(180deg,_rgba(251,191,36,0.2),_rgba(15,23,42,0.2)),linear-gradient(135deg,_#0f172a,_#1e293b)] p-10 lg:block">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-200/75">
              Welcome Back
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              Continue your interview practice with a clean, guided flow.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-200">
              Sign in to access the dashboard, start a new interview, review
              previous attempts, and see your technical and communication scores.
            </p>
          </section>

          <section className="w-full p-6 sm:p-10">
            <h1 className="text-3xl font-semibold tracking-tight">Sign In</h1>
            <p className="mt-2 text-sm text-slate-300">
              Use your credentials or continue with Google.
            </p>

            <form onSubmit={handleCredentialsSignIn} className="mt-8 flex flex-col gap-4">
              <input
                type="text"
                placeholder="Email or Username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white placeholder:text-slate-500"
              />

              {error ? (
                <p className="text-sm text-red-300">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-amber-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-200 disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign in with Credentials"}
              </button>
            </form>

            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="mt-4 w-full rounded-full bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Sign in with Google
            </button>

            <p className="mt-6 text-sm text-slate-300">
              Need an account?{" "}
              <Link href="/sign-up" className="font-semibold text-amber-200">
                Create one here
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
