"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { InterviewRecord } from "@/lib/interview-client-types";

type InterviewResponse = {
  success: boolean;
  interview?: InterviewRecord;
  message?: string;
};

export function ResultsPageClient(props: { interviewId: string }) {
  const [interview, setInterview] = useState<InterviewRecord | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadInterview() {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/interviews/${props.interviewId}`, {
          cache: "no-store",
        });

        const data = (await response.json()) as InterviewResponse;

        if (!response.ok || !data.success || !data.interview) {
          throw new Error(data.message || "Unable to load interview results.");
        }

        if (!cancelled) {
          setInterview(data.interview);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load interview results."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInterview();

    return () => {
      cancelled = true;
    };
  }, [props.interviewId]);

  if (isLoading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-sm text-slate-300">
        Loading interview results...
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="rounded-[2rem] border border-red-400/30 bg-red-500/10 p-8 text-sm text-red-100">
        {error || "Interview results were not available."}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-200/75">
            Final Score
          </p>
          <h2 className="mt-4 text-6xl font-semibold tracking-tight">
            {Math.round(interview.overallScore)}
            <span className="text-2xl text-slate-400">/100</span>
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {interview.interviewType === "role"
              ? `Role-based interview for ${interview.role}.`
              : "Resume-based interview."}{" "}
            Completed on {formatDate(interview.createdAt)}.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard/setup"
              className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
            >
              Start Another Interview
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Back to Dashboard
            </Link>
          </div>
        </article>

        <article className="rounded-[2rem] border border-emerald-300/20 bg-emerald-400/10 p-8">
          <h3 className="text-xl font-semibold">Score Breakdown</h3>
          <div className="mt-6 grid gap-4">
            <BreakdownRow
              label="Technical Skills"
              value={Math.round(interview.technicalSkillsScore)}
            />
            <BreakdownRow
              label="Soft Skills"
              value={Math.round(interview.softSkillsScore)}
            />
            <BreakdownRow
              label="Questions Answered"
              value={interview.questions.length}
            />
          </div>
        </article>
      </section>

      {interview.videoMetrics ? (
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6">
          <h3 className="text-2xl font-semibold">Video Analysis</h3>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Face Visibility"
              value={`${Math.round(interview.videoMetrics.faceVisibility)}%`}
            />
            <MetricCard
              label="Posture Score"
              value={`${Math.round(interview.videoMetrics.postureScore)}%`}
            />
            <MetricCard
              label="Gaze Score"
              value={`${Math.round(interview.videoMetrics.gazeScore)}%`}
            />
            <MetricCard
              label="Engagement Score"
              value={`${Math.round(interview.videoMetrics.engagementScore)}%`}
            />
            <MetricCard
              label="Total Frames"
              value={String(interview.videoMetrics.totalFrames)}
            />
            <MetricCard
              label="Frames with Face"
              value={String(interview.videoMetrics.framesWithFace)}
            />
          </div>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6">
        <h3 className="text-2xl font-semibold">Question Review</h3>
        <div className="mt-6 space-y-5">
          {interview.questions.map((question) => (
            <article
              key={`${question.order}-${question.question}`}
              className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200">
                  Question {question.order}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300">
                  {question.difficulty}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300">
                  Technical {Math.round(question.technicalScore || 0)}
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300">
                  Communication {Math.round(question.communicationScore || 0)}
                </span>
              </div>

              <h4 className="mt-4 text-lg font-semibold text-white">
                {question.question}
              </h4>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl bg-slate-950/40 p-4">
                  <p className="text-sm font-medium text-slate-200">Transcript</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {question.answer || "No transcript available"}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950/40 p-4">
                  <p className="text-sm font-medium text-slate-200">Feedback</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {question.feedback || "No feedback available"}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function BreakdownRow(props: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/35 px-4 py-3">
      <span className="text-sm text-emerald-50/80">{props.label}</span>
      <span className="text-lg font-semibold text-white">{props.value}</span>
    </div>
  );
}

function MetricCard(props: { label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-400">{props.label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{props.value}</p>
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
