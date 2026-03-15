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
    <div className="min-h-screen bg-[#222831] px-4 py-10">
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
    <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-[2rem] border border-[#393E46] bg-[#2A2F38] p-8 shadow-lg">
        <p className="text-sm uppercase tracking-[0.3em] text-[#00ADB5]">Create Account</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#EEEEEE]">Get started with interview practice</h1>
        <p className="mt-2 text-sm text-[#EEEEEE]/70">
          Sign up to access the dashboard, start interview sessions, and track your scores.
        </p>

        <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mt-6 w-full rounded-2xl border border-[#393E46] bg-[#1F2328] p-3 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50"
        />

        <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-4 w-full rounded-2xl border border-[#393E46] bg-[#1F2328] p-3 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50"
        />

        <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-4 w-full rounded-2xl border border-[#393E46] bg-[#1F2328] p-3 text-[#EEEEEE] placeholder:text-[#EEEEEE]/50"
        />

        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-green-400">{message}</p> : null}

        <button
          disabled={isSubmitting}
          className="mt-6 w-full rounded-full bg-[#00ADB5] p-3 font-semibold text-[#222831] transition hover:bg-[#00ADB5]/90 disabled:opacity-60"
        >
        {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>

        <p className="mt-5 text-sm text-[#EEEEEE]/70">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-[#00ADB5] hover:text-[#00ADB5]/80">
            Sign in
          </Link>
        </p>
    </form>
    </div></div>
);
}
