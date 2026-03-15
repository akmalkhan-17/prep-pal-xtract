"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  DashboardStats,
  InterviewsResponse,
  InterviewSummary,
} from "@/lib/interview-client-types";

const emptyStats: DashboardStats = {
  success: true,
  totalInterviews: 0,
  avgOverallScore: 0,
  avgTechnicalScore: 0,
  avgSoftSkillsScore: 0,
  latestInterview: null,
};

export function DashboardPageClient() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [interviews, setInterviews] = useState<InterviewSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError("");

        const [statsResponse, interviewsResponse] = await Promise.all([
          fetch("/api/dashboard/stats", { cache: "no-store" }),
          fetch("/api/interviews", { cache: "no-store" }),
        ]);

        const statsData = (await statsResponse.json()) as DashboardStats;
        const interviewsData = (await interviewsResponse.json()) as InterviewsResponse;

        if (!statsResponse.ok) {
          throw new Error(statsData.message || "Failed to load dashboard stats");
        }

        if (!interviewsResponse.ok) {
          throw new Error(interviewsData.message || "Failed to load interviews");
        }

        if (!cancelled) {
          setStats(statsData);
          setInterviews(interviewsData.interviews || []);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Something went wrong while loading the dashboard."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-[2rem] border border-[#393E46] bg-[#2A2F38] p-8 shadow-lg">
          <p className="text-sm uppercase tracking-[0.3em] text-[#00ADB5]">
            Interview Command Center
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-[#EEEEEE]">
            Run a focused mock interview and get structured feedback on both
            technical depth and communication.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#EEEEEE]/70">
            Start with a role or upload your resume. The backend will generate
            3 adaptive questions, evaluate each transcribed answer, and score
            your video engagement when the session ends.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard/setup"
              className="rounded-full bg-[#00ADB5] px-5 py-3 text-sm font-semibold text-[#222831] transition hover:bg-[#00ADB5]/90"
            >
              Set Up Interview Now
            </Link>
            <Link
              href="#history"
              className="rounded-full border border-[#393E46] px-5 py-3 text-sm font-medium text-[#EEEEEE] transition hover:bg-[#393E46]"
            >
              View History
            </Link>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[#393E46] bg-[#2A2F38] p-8 backdrop-blur-sm">
          <p className="text-sm uppercase tracking-[0.28em] text-[#00ADB5]">
            Latest Session
          </p>
          {stats.latestInterview ? (
            <div className="mt-6 space-y-3">
              <p className="text-4xl font-semibold text-[#EEEEEE]">
                {Math.round(stats.latestInterview.overallScore)}
                <span className="ml-2 text-lg text-[#00ADB5]/70">/100</span>
              </p>
              <p className="text-sm text-[#EEEEEE]/80">
                {formatInterviewLabel(stats.latestInterview)}
              </p>
              <p className="text-sm text-[#EEEEEE]/70">
                Status: {stats.latestInterview.status.replace("_", " ")}
              </p>
            </div>
          ) : (
            <p className="mt-6 text-sm leading-7 text-[#EEEEEE]/70">
              No interview has been completed yet. Your first session will show
              up here.
            </p>
          )}
        </article>
      </section>

      {error ? (
        <div className="rounded-3xl border border-red-500/50 bg-red-500/10 px-5 py-4 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Total Interviews"
          value={isLoading ? "..." : String(stats.totalInterviews)}
        />
        <StatCard
          label="Average Overall"
          value={isLoading ? "..." : scoreValue(stats.avgOverallScore)}
        />
        <StatCard
          label="Average Technical"
          value={isLoading ? "..." : scoreValue(stats.avgTechnicalScore)}
        />
        <StatCard
          label="Average Soft Skills"
          value={isLoading ? "..." : scoreValue(stats.avgSoftSkillsScore)}
        />
      </section>

      <section
        id="history"
        className="rounded-[2rem] border border-[#393E46] bg-[#2A2F38] p-6 shadow-lg"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-[#00ADB5]">
              Interview History
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[#EEEEEE]">Recent attempts</h3>
          </div>

          <Link
            href="/dashboard/setup"
            className="rounded-full border border-[#393E46] px-4 py-2 text-sm text-[#EEEEEE] transition hover:bg-[#393E46]"
          >
            New Interview
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <div className="rounded-3xl border border-[#393E46] bg-[#1F2328] p-5 text-sm text-[#EEEEEE]/70">
              Loading interview history...
            </div>
          ) : interviews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#393E46] bg-[#1F2328] p-8 text-sm text-[#EEEEEE]/70">
              No interview records yet. Start one from the setup page.
            </div>
          ) : (
            interviews.map((interview) => (
              <article
                key={interview._id}
                className="grid gap-4 rounded-3xl border border-[#393E46] bg-[#1F2328] p-5 lg:grid-cols-[1.5fr_1fr_auto]"
              >
                <div>
                  <p className="text-lg font-semibold text-[#EEEEEE]">
                    {formatInterviewLabel(interview)}
                  </p>
                  <p className="mt-1 text-sm text-[#EEEEEE]/70">
                    {formatDate(interview.createdAt)} | {interview.answeredQuestions}/
                    {interview.totalQuestions} answered
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-[#EEEEEE]">
                  <Badge>{interview.status.replace("_", " ")}</Badge>
                  <Badge>Overall {Math.round(interview.overallScore)}</Badge>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={
                      interview.status === "completed"
                        ? `/dashboard/results/${interview._id}`
                        : `/dashboard/interview/${interview._id}`
                    }
                    className="rounded-full bg-[#00ADB5] px-4 py-2 text-sm font-semibold text-[#222831] transition hover:bg-[#00ADB5]/90"
                  >
                    {interview.status === "completed" ? "View Results" : "Resume"}
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard(props: { label: string; value: string }) {
  return (
    <article className="rounded-[1.75rem] border border-[#393E46] bg-[#2A2F38] p-5 shadow-md">
      <p className="text-sm text-[#EEEEEE]/70">{props.label}</p>
      <p className="mt-3 text-3xl font-semibold text-[#EEEEEE]">{props.value}</p>
    </article>
  );
}

function Badge(props: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#393E46] bg-[#1F2328] px-3 py-1 text-[#EEEEEE]/80">
      {props.children}
    </span>
  );
}

function scoreValue(value: number) {
  return `${Math.round(value)}/100`;
}

function formatInterviewLabel(interview: InterviewSummary) {
  if (interview.interviewType === "role") {
    return `${interview.role || "role"} interview`;
  }

  return "resume interview";
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
