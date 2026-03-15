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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_transparent_26%),linear-gradient(180deg,_#07111f_0%,_#0b1221_100%)] text-white">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <nav className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 px-6 py-5 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-amber-200/80">
              AI Interview Platform
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {props.title}
            </h1>
            <p className="mt-1 text-sm text-slate-300">{props.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-full px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/setup"
              className="rounded-full px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              Setup Interview
            </Link>
            <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
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
