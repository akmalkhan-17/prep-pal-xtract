import type { Interview, InterviewQuestion } from "@/model/User";
import { generateJsonWithGroq } from "@/lib/groq";
import {
  clampScore,
  HARDER_SCORE_THRESHOLD,
  LOWER_SCORE_THRESHOLD,
  MAX_INTERVIEW_QUESTIONS,
  QUESTION_DIFFICULTIES,
  ROLE_LABELS,
  type QuestionDifficulty,
} from "@/lib/interview-config";

function getInterviewContext(interview: Interview) {
  if (interview.interviewType === "role") {
    const role = interview.role ? ROLE_LABELS[interview.role] : "Software Engineer";
    return `Interview mode: role-based\nTarget role: ${role}`;
  }

  return `Interview mode: resume-based\nResume text:\n${(interview.resumeText || "").slice(0, 6000)}`;
}

function getDifficultyIndex(difficulty?: QuestionDifficulty) {
  const normalized =
    difficulty === "introductory" || !difficulty ? "foundational" : difficulty;

  return QUESTION_DIFFICULTIES.indexOf(normalized);
}

export function countAnsweredQuestions(interview: Interview) {
  return (interview.questions || []).filter((question) =>
    Boolean(question.answer?.trim())
  ).length;
}

export function getPendingQuestion(interview: Interview) {
  return (interview.questions || []).find((question) => !question.answer?.trim());
}

export function serializeQuestion(question: InterviewQuestion) {
  return {
    id: question._id?.toString() || "",
    text: question.question,
    order: question.order,
    difficulty: question.difficulty,
  };
}

function getLastAnsweredQuestion(interview: Interview) {
  const answeredQuestions = (interview.questions || []).filter((question) =>
    Boolean(question.answer?.trim())
  );

  return answeredQuestions[answeredQuestions.length - 1];
}

export function getNextDifficulty(interview: Interview): QuestionDifficulty {
  const lastAnswered = getLastAnsweredQuestion(interview);

  if (!lastAnswered) {
    return "introductory";
  }

  const currentIndex = Math.max(getDifficultyIndex(lastAnswered.difficulty), 1);
  const lastScore = lastAnswered.technicalScore ?? 0;

  if (lastScore >= HARDER_SCORE_THRESHOLD) {
    return QUESTION_DIFFICULTIES[Math.min(currentIndex + 1, QUESTION_DIFFICULTIES.length - 1)];
  }

  if (lastScore < LOWER_SCORE_THRESHOLD) {
    return QUESTION_DIFFICULTIES[Math.max(currentIndex - 1, 1)];
  }

  return QUESTION_DIFFICULTIES[currentIndex];
}

export async function generateInterviewQuestion(interview: Interview) {
  const answeredQuestions = (interview.questions || []).filter((question) =>
    Boolean(question.answer?.trim())
  );
  const nextOrder = answeredQuestions.length + 1;
  const targetDifficulty = getNextDifficulty(interview);
  const priorContext =
    answeredQuestions.length === 0
      ? "No prior questions have been answered yet."
      : answeredQuestions
          .map(
            (question) =>
              `Question ${question.order} (${question.difficulty}, technical score ${question.technicalScore ?? 0}/100): ${question.question}\nAnswer: ${question.answer}`
          )
          .join("\n\n");

  const parsed = await generateJsonWithGroq<{
    question?: string;
    difficulty?: QuestionDifficulty;
  }>({
    systemInstruction:
      "You are a professional technical interviewer. Generate exactly one concise interview question at the requested difficulty. Return only valid JSON.",
    userPrompt: `
${getInterviewContext(interview)}

Question number: ${nextOrder} of ${MAX_INTERVIEW_QUESTIONS}
Target difficulty: ${targetDifficulty}

Rules:
- Question 1 must be introductory, conversational, and grounded in the role or resume.
- Questions 2 and 3 must adapt to prior answers and increase or decrease depth based on previous performance.
- Ask exactly one question.
- Do not include commentary or rubric.

Previous interview context:
${priorContext}

Return JSON with this exact shape:
{
  "question": "string",
  "difficulty": "${targetDifficulty}"
}
    `.trim(),
    temperature: 0.7,
    maxOutputTokens: 250,
  });

  return {
    question: (parsed.question || "").trim(),
    difficulty: targetDifficulty,
    order: nextOrder,
  };
}

export async function evaluateInterviewAnswer(params: {
  interview: Interview;
  question: InterviewQuestion;
  transcript: string;
}) {
  const { interview, question, transcript } = params;

  const parsed = await generateJsonWithGroq<{
    technicalScore?: number;
    communicationScore?: number;
    feedback?: string;
  }>({
    systemInstruction:
      "You are an expert interview evaluator. Score the answer using only the provided transcript. Return only valid JSON.",
    userPrompt: `
${getInterviewContext(interview)}

Current question (${question.difficulty}):
${question.question}

Transcript:
${transcript}

Score the answer on a 0-100 scale.
- technicalScore: correctness, depth, relevance, problem solving
- communicationScore: clarity, structure, confidence, conciseness
- feedback: max 2 sentences, actionable and supportive

Return JSON with this exact shape:
{
  "technicalScore": 0,
  "communicationScore": 0,
  "feedback": "string"
}
    `.trim(),
    temperature: 0.4,
    maxOutputTokens: 300,
  });

  return {
    technicalScore: clampScore(parsed.technicalScore ?? 0),
    communicationScore: clampScore(parsed.communicationScore ?? 0),
    feedback: (parsed.feedback || "Solid effort. Keep refining the depth and clarity of the answer.").trim(),
  };
}

function averageScore(scores: Array<number | null | undefined>) {
  const validScores = scores.filter((score): score is number => typeof score === "number");

  if (validScores.length === 0) {
    return 0;
  }

  return validScores.reduce((total, score) => total + score, 0) / validScores.length;
}

export function calculateInterviewScores(interview: Interview) {
  const questions = interview.questions || [];
  const videoEngagementScore = interview.videoMetrics?.engagementScore || 0;
  const technicalSkillsScore = averageScore(
    questions.map((question) => question.technicalScore)
  );
  const communicationTranscriptScore = averageScore(
    questions.map((question) => question.communicationScore)
  );
  const softSkillsScore = Math.round(
    0.6 * communicationTranscriptScore + 0.4 * videoEngagementScore
  );
  const overallScore = Math.round(
    0.7 * technicalSkillsScore + 0.3 * softSkillsScore
  );

  return {
    technicalSkillsScore: clampScore(technicalSkillsScore),
    communicationTranscriptScore: clampScore(communicationTranscriptScore),
    softSkillsScore: clampScore(softSkillsScore),
    overallScore: clampScore(overallScore),
  };
}
