import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/sign-out-button";

export async function DashboardShell(props: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-[#222831]">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <nav className="flex flex-col gap-4 rounded-[2rem] border border-[#393E46] bg-[#2A2F38] px-6 py-5 backdrop-blur shadow-lg md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#00ADB5]">
              AI Interview Platform
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#EEEEEE]">
              {props.title}
            </h1>
            <p className="mt-1 text-sm text-[#EEEEEE]/70">{props.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full px-4 py-2 text-sm text-[#EEEEEE] transition hover:bg-[#393E46]"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/setup"
              className="rounded-full px-4 py-2 text-sm text-[#EEEEEE] transition hover:bg-[#393E46]"
            >
              Setup Interview
            </Link>
            <div className="rounded-full border border-[#393E46] px-4 py-2 text-sm text-[#EEEEEE]">
              {session.user.username || session.user.email}
            </div>
            <SignOutButton />
          </div>
        </nav>

        <div className="py-8">{props.children}</div>
      </div>
    </div>
  );
}
