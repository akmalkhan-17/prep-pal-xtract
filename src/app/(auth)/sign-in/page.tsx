"use client";

import { useState } from "react";
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
    <div className="min-h-screen flex flex-col gap-6 items-center justify-center text-white px-4">
      <div className="w-full max-w-md bg-black/40 p-6 rounded-lg flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Sign In</h1>

        <form onSubmit={handleCredentialsSignIn} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Email or Username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            className="p-2 rounded bg-white text-black placeholder-gray-500 border border-gray-300"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="p-2 rounded bg-white text-black placeholder-gray-500 border border-gray-300"
          />

          {error ? (
            <p className="text-sm text-red-300">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 px-4 py-2 rounded disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign in with Credentials"}
          </button>
        </form>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="bg-white text-black px-4 py-2 rounded"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
