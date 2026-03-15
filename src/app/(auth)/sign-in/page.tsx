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
    <div className="min-h-screen bg-[#222831] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-[#393E46] bg-[#2A2F38] shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden bg-[#1F2328] p-10 lg:block">
            <p className="text-sm uppercase tracking-[0.3em] text-[#00ADB5]">
              Welcome Back
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#EEEEEE]">
              Continue your interview practice with a clean, guided flow.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-[#EEEEEE]">
              Sign in to access the dashboard, start a new interview, review
              previous attempts, and see your technical and communication scores.
            </p>
          </section>

          <section className="w-full p-6 sm:p-10">
            <h1 className="text-3xl font-semibold tracking-tight text-[#EEEEEE]">Sign In</h1>
            <p className="mt-2 text-sm text-[#EEEEEE]/70">
              Use your credentials or continue with Google.
            </p>

            <form onSubmit={handleCredentialsSignIn} className="mt-8 flex flex-col gap-4">
              <input
                type="text"
                placeholder="Email or Username"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="rounded-2xl border border-[#393E46] bg-[#1F2328] px-4 py-3 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-[#393E46] bg-[#1F2328] px-4 py-3 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50"
              />

              {error ? (
                <p className="text-sm text-red-400">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-[#00ADB5] px-4 py-3 font-semibold text-[#222831] transition hover:bg-[#00ADB5]/90 disabled:opacity-60"
              >
                {isSubmitting ? "Signing in..." : "Sign in with Credentials"}
              </button>
            </form>

            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="mt-4 w-full rounded-full border border-[#393E46] bg-[#1F2328] px-4 py-3 font-semibold text-[#EEEEEE] shadow-md transition hover:bg-[#2A2F38] hover:shadow-lg"
            >
              Sign in with Google
            </button>

            <p className="mt-6 text-sm text-[#EEEEEE]/70">
              Need an account?{" "}
              <Link href="/sign-up" className="font-semibold text-[#00ADB5] hover:text-[#00ADB5]/80">
                Create one here
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
