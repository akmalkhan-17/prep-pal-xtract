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
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <nav className="flex flex-col gap-4 rounded-[2rem] border border-purple-200/50 bg-white/70 px-6 py-5 backdrop-blur shadow-lg shadow-purple-200/20 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-purple-600/70">
              AI Interview Platform
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-800">
              {props.title}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{props.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full px-4 py-2 text-sm text-slate-700 transition hover:bg-purple-100/50"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/setup"
              className="rounded-full px-4 py-2 text-sm text-slate-700 transition hover:bg-purple-100/50"
            >
              Setup Interview
            </Link>
            <div className="rounded-full border border-purple-200/50 px-4 py-2 text-sm text-slate-700">
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
