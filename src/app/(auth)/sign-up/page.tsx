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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 px-4 py-10">
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
    <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-[2rem] border border-purple-200/50 bg-white/70 p-8 shadow-lg shadow-purple-200/20">
        <p className="text-sm uppercase tracking-[0.3em] text-purple-600/70">Create Account</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800">Get started with interview practice</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign up to access the dashboard, start interview sessions, and track your scores.
        </p>

        <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mt-6 w-full rounded-2xl border border-purple-200/50 bg-white/80 p-3 text-slate-800 placeholder:text-slate-400"
        />

        <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-4 w-full rounded-2xl border border-purple-200/50 bg-white/80 p-3 text-slate-800 placeholder:text-slate-400"
        />

        <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-4 w-full rounded-2xl border border-purple-200/50 bg-white/80 p-3 text-slate-800 placeholder:text-slate-400"
        />

        {error ? <p className="mt-4 text-sm text-rose-500">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-green-600">{message}</p> : null}

        <button
          disabled={isSubmitting}
          className="mt-6 w-full rounded-full bg-gradient-to-r from-purple-300 to-pink-200 p-3 font-semibold text-slate-700 transition hover:from-purple-400 hover:to-pink-300 disabled:opacity-60"
        >
        {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>

        <p className="mt-5 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-purple-600 hover:text-purple-700">
            Sign in
          </Link>
        </p>
    </form>
    </div></div>
);
}
