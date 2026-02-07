// src/app/sign-in/page.tsx
"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
return (
    <div className="min-h-screen flex flex-col gap-4 items-center justify-center text-white">
    <h1>Sign In Page</h1>

    <button
        onClick={() => signIn("google")}
        className="bg-white text-black px-4 py-2 rounded"
    >
        Sign in with Google
    </button>

    <button
        onClick={() =>
        signIn("credentials", {
            identifier: "test@gmail.com",
            password: "password",
            callbackUrl: "/dashboard",
        })
        }
        className="bg-blue-500 px-4 py-2 rounded"
    >
        Sign in with Credentials
    </button>
    </div>
);
}