"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const roles = [
  { value: "frontend", label: "Frontend Engineer" },
  { value: "backend", label: "Backend Engineer" },
  { value: "fullstack", label: "Full Stack Engineer" },
  { value: "mobile", label: "Mobile App Developer" },
] as const;

type SetupMode = "resume" | "role";

type ResumeResponse = {
  success: boolean;
  filename: string;
  resumeText: string;
  wordCount: number;
  characterCount: number;
  message?: string;
};

type StartInterviewResponse = {
  success: boolean;
  interviewId?: string;
  message?: string;
};

export function SetupPageClient() {
  const router = useRouter();
  const [mode, setMode] = useState<SetupMode>("resume");
  const [selectedRole, setSelectedRole] =
    useState<(typeof roles)[number]["value"]>("backend");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreview, setResumePreview] = useState<ResumeResponse | null>(null);
  const [error, setError] = useState("");
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  async function handleParseResume() {
    if (!resumeFile) {
      setError("Choose a resume file before continuing.");
      return;
    }

    setError("");
    setIsParsingResume(true);
    setResumePreview(null);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      const response = await fetch("/api/interview/resume/parse", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as ResumeResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Resume parsing failed");
      }

      setResumePreview(data);
    } catch (parseError) {
      setError(
        parseError instanceof Error
          ? parseError.message
          : "Unable to parse the resume."
      );
    } finally {
      setIsParsingResume(false);
    }
  }

  async function handleStartInterview() {
    setError("");
    setIsStarting(true);

    try {
      const payload =
        mode === "role"
          ? { interviewType: "role", role: selectedRole }
          : { interviewType: "resume", resumeText: resumePreview?.resumeText };

      if (mode === "resume" && !resumePreview?.resumeText) {
        throw new Error("Parse the resume first so the backend has resume text.");
      }

      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as StartInterviewResponse;

      if (!response.ok || !data.success || !data.interviewId) {
        throw new Error(data.message || "Unable to start interview");
      }

      router.push(`/dashboard/interview/${data.interviewId}`);
    } catch (startError) {
      setError(
        startError instanceof Error
          ? startError.message
          : "Unable to start the interview."
      );
    } finally {
      setIsStarting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="space-y-5">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-200/75">
            Choose Your Path
          </p>
          <div className="mt-5 grid gap-4">
            <ModeCard
              active={mode === "resume"}
              title="Upload Resume"
              description="Post your resume to the Python service, extract the text, and generate questions from your background."
              onClick={() => setMode("resume")}
            />
            <ModeCard
              active={mode === "role"}
              title="Choose Role"
              description="Skip file upload and start a role-targeted interview based on the supported backend roles."
              onClick={() => setMode("role")}
            />
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6">
          <h2 className="text-xl font-semibold">How this setup maps to backend</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            <li>Resume upload goes to `/api/interview/resume/parse` first.</li>
            <li>
              Role mode posts <code>{'interviewType: "role"'}</code> and a valid
              role.
            </li>
            <li>
              Resume mode posts <code>{'interviewType: "resume"'}</code> and
              parsed text.
            </li>
            <li>Both modes create one interview record before questions begin.</li>
          </ul>
        </article>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-6">
        {mode === "resume" ? (
          <div>
            <h2 className="text-2xl font-semibold">Resume-based setup</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Upload a resume file and let the backend prepare interview context
              from the extracted text.
            </p>

            <label className="mt-6 block rounded-3xl border border-dashed border-white/15 bg-white/5 p-5">
              <span className="text-sm font-medium text-white">Resume file</span>
              <input
                type="file"
                accept=".pdf,.txt,.doc,.docx,image/*"
                onChange={(event) => {
                  setResumePreview(null);
                  setResumeFile(event.target.files?.[0] || null);
                }}
                className="mt-3 block w-full text-sm text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-amber-300 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleParseResume}
                disabled={isParsingResume}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isParsingResume ? "Parsing Resume..." : "Parse Resume"}
              </button>
              <button
                type="button"
                onClick={handleStartInterview}
                disabled={!resumePreview || isStarting}
                className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStarting ? "Starting..." : "Start Interview"}
              </button>
            </div>

            {resumePreview ? (
              <article className="mt-6 rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-5">
                <div className="flex flex-wrap gap-3 text-sm text-emerald-50">
                  <span>File: {resumePreview.filename}</span>
                  <span>Words: {resumePreview.wordCount}</span>
                  <span>Characters: {resumePreview.characterCount}</span>
                </div>
                <div className="mt-4 max-h-72 overflow-auto rounded-2xl bg-slate-950/45 p-4 text-sm leading-6 text-slate-200">
                  {resumePreview.resumeText}
                </div>
              </article>
            ) : null}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold">Role-based setup</h2>
            <p className="mt-2 text-sm leading-7 text-slate-300">
              Pick one of the backend-supported roles and start immediately.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`rounded-3xl border p-5 text-left transition ${
                    selectedRole === role.value
                      ? "border-amber-300 bg-amber-300/15"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <p className="text-lg font-semibold text-white">{role.label}</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Backend role key: {role.value}
                  </p>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleStartInterview}
              disabled={isStarting}
              className="mt-6 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isStarting ? "Starting..." : "Start Interview"}
            </button>
          </div>
        )}

        {error ? (
          <div className="mt-5 rounded-3xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ModeCard(props: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`rounded-[1.75rem] border p-5 text-left transition ${
        props.active
          ? "border-amber-300 bg-amber-300/10"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}
    >
      <h3 className="text-lg font-semibold text-white">{props.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{props.description}</p>
    </button>
  );
}
