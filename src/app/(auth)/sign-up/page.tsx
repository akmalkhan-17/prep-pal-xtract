"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
const [username, setUsername] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [message, setMessage] = useState("");
const [error, setError] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
const router = useRouter();

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = (await res.json()) as { success?: boolean; message?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Could not create your account.");
      }

      setMessage(data.message || "Account created successfully.");
      router.push("/sign-in");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create your account."
      );
    } finally {
      setIsSubmitting(false);
    }
};

return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_28%),linear-gradient(180deg,_#08111f,_#0f172a)] px-4 py-10 text-white">
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
    <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-200/75">Create Account</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Get started with interview practice</h1>
        <p className="mt-2 text-sm text-slate-300">
          Sign up to access the dashboard, start interview sessions, and track your scores.
        </p>

        <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mt-6 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white placeholder:text-slate-500"
        />

        <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white placeholder:text-slate-500"
        />

        <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-white placeholder:text-slate-500"
        />

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}

        <button
          disabled={isSubmitting}
          className="mt-6 w-full rounded-full bg-amber-300 p-3 font-semibold text-slate-950 transition hover:bg-amber-200 disabled:opacity-60"
        >
        {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>

        <p className="mt-5 text-sm text-slate-300">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-amber-200">
            Sign in
          </Link>
        </p>
    </form>
    </div></div>
);
}
