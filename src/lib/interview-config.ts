export const INTERVIEW_ROLES = [
  "frontend",
  "backend",
  "fullstack",
  "mobile",
] as const;

export type InterviewRole = (typeof INTERVIEW_ROLES)[number];

export const INTERVIEW_STATUSES = ["in_progress", "completed"] as const;

export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export const QUESTION_DIFFICULTIES = [
  "introductory",
  "foundational",
  "intermediate",
  "advanced",
] as const;

export type QuestionDifficulty = (typeof QUESTION_DIFFICULTIES)[number];

export const ROLE_LABELS: Record<InterviewRole, string> = {
  frontend: "Frontend Engineer",
  backend: "Backend Engineer",
  fullstack: "Full Stack Engineer",
  mobile: "Mobile App Developer",
};

export const MAX_INTERVIEW_QUESTIONS = 3;

export const HARDER_SCORE_THRESHOLD = 75;
export const LOWER_SCORE_THRESHOLD = 45;

export const PYTHON_SERVICE_TIMEOUT_MS = 30_000;
export const PYTHON_VIDEO_TIMEOUT_MS = 120_000;

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}
