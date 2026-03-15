export type DashboardStats = {
  success: boolean;
  totalInterviews: number;
  avgOverallScore: number;
  avgTechnicalScore: number;
  avgSoftSkillsScore: number;
  latestInterview: InterviewSummary | null;
  message?: string;
};

export type InterviewSummary = {
  _id: string;
  interviewType: "role" | "resume";
  role?: "frontend" | "backend" | "fullstack" | "mobile" | null;
  status: "in_progress" | "completed";
  softSkillsScore: number;
  technicalSkillsScore: number;
  overallScore: number;
  totalQuestions: number;
  answeredQuestions: number;
  createdAt: string;
};

export type InterviewsResponse = {
  success: boolean;
  total: number;
  interviews: InterviewSummary[];
  message?: string;
};

export type QuestionPayload = {
  id: string;
  text: string;
  order: number;
  difficulty: string;
};

export type InterviewQuestion = {
  _id?: string;
  question: string;
  order: number;
  difficulty: string;
  answer?: string | null;
  feedback?: string | null;
  technicalScore?: number | null;
  communicationScore?: number | null;
};

export type VideoMetrics = {
  faceVisibility: number;
  postureScore: number;
  gazeScore: number;
  engagementScore: number;
  totalFrames: number;
  framesWithFace: number;
};

export type InterviewRecord = {
  _id: string;
  interviewType: "role" | "resume";
  role?: "frontend" | "backend" | "fullstack" | "mobile" | null;
  resumeText?: string | null;
  status: "in_progress" | "completed";
  totalQuestions: number;
  videoMetrics?: VideoMetrics | null;
  softSkillsScore: number;
  technicalSkillsScore: number;
  overallScore: number;
  createdAt: string;
  questions: InterviewQuestion[];
};
