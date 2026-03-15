"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
      className="rounded-full border border-purple-300/50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-purple-400/70 hover:bg-purple-100/50"
    >
      Sign Out
    </button>
  );
}
