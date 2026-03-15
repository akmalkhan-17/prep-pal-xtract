import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(248,180,98,0.25),_transparent_30%),linear-gradient(135deg,_#07111f,_#10243c_55%,_#0f172a)] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-between gap-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-200/80">
              AI Interview Platform
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Practice role-based and resume-based interviews in one focused
              workspace.
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/10"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-amber-300 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
            >
              Create Account
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur">
            <p className="max-w-2xl text-lg leading-8 text-slate-200">
              This app already includes secure auth, adaptive interview
              questions, resume parsing, audio transcription, and video-based
              analysis. Sign in to open your dashboard and start a guided mock
              interview session.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <FeatureCard
                title="Role Mode"
                description="Choose frontend, backend, fullstack, or mobile and get targeted technical questions."
              />
              <FeatureCard
                title="Resume Mode"
                description="Upload your resume and let the interview adapt to your actual project history."
              />
              <FeatureCard
                title="Recorded Session"
                description="Capture audio per answer and one end-to-end video for final scoring."
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-amber-200/20 bg-slate-950/70 p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-200/70">
              Interview Flow
            </p>
            <ol className="mt-6 space-y-4 text-sm text-slate-300">
              <li>1. Sign in with credentials or Google.</li>
              <li>2. Open the dashboard and choose a new interview setup.</li>
              <li>3. Upload a resume or select a role.</li>
              <li>4. Answer 3 adaptive questions with audio recording.</li>
              <li>5. Finish the session and review scores plus feedback.</li>
            </ol>

            <Link
              href="/sign-in"
              className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Go to Dashboard
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard(props: { title: string; description: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/35 p-5">
      <h2 className="text-lg font-semibold text-white">{props.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{props.description}</p>
    </article>
  );
}
