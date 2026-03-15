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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-purple-200/50 bg-white/70 shadow-2xl shadow-purple-200/30 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden bg-gradient-to-br from-purple-200/60 to-pink-100/60 p-10 lg:block">
            <p className="text-sm uppercase tracking-[0.3em] text-purple-600/70">
              Welcome Back
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-800">
              Continue your interview practice with a clean, guided flow.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-700">
              Sign in to access the dashboard, start a new interview, review
              previous attempts, and see your technical and communication scores.
            </p>
          </section>

          <section className="w-full p-6 sm:p-10">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-800">Sign In</h1>
            <p className="mt-2 text-sm text-slate-600">
              Use your credentials or continue with Google.
            </p>

            <form onSubmit={handleCredentialsSignIn} className="mt-8 flex flex-col gap-4">
              <input
                type="text"
                placeholder="Email or Username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="rounded-2xl border border-purple-200/50 bg-white/80 px-4 py-3 text-slate-800 placeholder:text-slate-400"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-purple-200/50 bg-white/80 px-4 py-3 text-slate-800 placeholder:text-slate-400"
              />

              {error ? (
                <p className="text-sm text-rose-500">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-gradient-to-r from-purple-300 to-pink-200 px-4 py-3 font-semibold text-slate-700 transition hover:from-purple-400 hover:to-pink-300 disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign in with Credentials"}
              </button>
            </form>

            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="mt-4 w-full rounded-full bg-white px-4 py-3 font-semibold text-slate-700 shadow-md transition hover:bg-slate-50 hover:shadow-lg"
            >
              Sign in with Google
            </button>

            <p className="mt-6 text-sm text-slate-600">
              Need an account?{" "}
              <Link href="/sign-up" className="font-semibold text-purple-600 hover:text-purple-700">
                Create one here
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
