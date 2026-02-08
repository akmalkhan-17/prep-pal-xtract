"use client";

import { useState } from "react";

export default function SignUpPage() {
const [username, setUsername] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/sign-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    alert(data.message);
};

return (
    <div className="min-h-screen flex items-center justify-center text-white">
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80 bg-black/40 p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Sign Up</h1>

        <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="p-2 rounded bg-white text-black placeholder-gray-500 border border-gray-300"
        />

        <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 rounded bg-white text-black placeholder-gray-500 border border-gray-300"
        />

        <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 rounded bg-white text-black placeholder-gray-500 border border-gray-300"
        />

        <button className="bg-blue-500 p-2 rounded">
        Create Account
        </button>
    </form>
    </div>
);
}