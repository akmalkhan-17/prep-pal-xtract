import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#222831] px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-between gap-12">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#00ADB5]">
              AI Interview Platform
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-[#EEEEEE] sm:text-6xl">
              Practice role-based and resume-based interviews in one focused
              workspace.
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-full border border-[#00ADB5] px-5 py-2 text-sm font-medium text-[#EEEEEE] transition hover:border-[#00ADB5] hover:bg-[#393E46]"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-[#00ADB5] px-5 py-2 text-sm font-semibold text-[#222831] transition hover:bg-[#00ADB5]/90"
            >
              Create Account
            </Link>
          </div>
        </header>

        <section className="grid gap-6">
          <div className="rounded-[2rem] border border-[#393E46] bg-[#2A2F38] p-8 shadow-lg backdrop-blur-sm">
            <p className="max-w-2xl text-lg leading-8 text-[#EEEEEE]">
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

            <Link
              href="/sign-in"
              className="mt-8 inline-flex rounded-full bg-[#00ADB5] px-5 py-3 text-sm font-semibold text-[#222831] shadow-md transition hover:bg-[#00ADB5]/90"
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
    <article className="rounded-3xl border border-[#393E46] bg-[#2A2F38] p-5 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-[#00ADB5]">{props.title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#EEEEEE]">{props.description}</p>
    </article>
  );
}
