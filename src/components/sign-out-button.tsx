"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/sign-in" })}
      className="rounded-full border border-[#393E46] px-4 py-2 text-sm font-medium text-[#EEEEEE] transition hover:border-[#00ADB5] hover:bg-[#393E46]"
    >
      Sign Out
    </button>
  );
}
