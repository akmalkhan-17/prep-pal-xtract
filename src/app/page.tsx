import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-between gap-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-purple-600/70">
              AI Interview Platform
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-slate-800 sm:text-6xl">
              Practice role-based and resume-based interviews in one focused
              workspace.
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-full border border-purple-300 px-5 py-2 text-sm font-medium text-slate-700 transition hover:border-purple-400 hover:bg-white/40"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-gradient-to-r from-purple-300 to-pink-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:from-purple-400 hover:to-pink-300"
            >
              Create Account
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-[2rem] border border-purple-200/50 bg-white/60 p-8 shadow-lg shadow-purple-200/20 backdrop-blur-sm">
            <p className="max-w-2xl text-lg leading-8 text-slate-700">
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

          <div className="rounded-[2rem] border border-blue-200/50 bg-gradient-to-br from-blue-100/60 to-cyan-100/60 p-8 backdrop-blur-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-600/70">
              Interview Flow
            </p>
            <ol className="mt-6 space-y-4 text-sm text-slate-700">
              <li>1. Sign in with credentials or Google.</li>
              <li>2. Open the dashboard and choose a new interview setup.</li>
              <li>3. Upload a resume or select a role.</li>
              <li>4. Answer 3 adaptive questions with audio recording.</li>
              <li>5. Finish the session and review scores plus feedback.</li>
            </ol>

            <Link
              href="/sign-in"
              className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-md transition hover:bg-blue-50 hover:shadow-lg"
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
    <article className="rounded-3xl border border-purple-200/40 bg-gradient-to-br from-purple-50/80 to-pink-50/80 p-5 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-slate-700">{props.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{props.description}</p>
    </article>
  );
}
