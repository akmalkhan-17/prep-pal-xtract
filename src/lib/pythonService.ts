import {
  PYTHON_SERVICE_TIMEOUT_MS,
  PYTHON_VIDEO_TIMEOUT_MS,
} from "@/lib/interview-config";

const PYTHON_SERVICE_URL = (
  process.env.PYTHON_SERVICE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

type ResumeParseResponse = {
  success: boolean;
  filename: string;
  extractedText?: string;
  resumeText?: string;
  wordCount: number;
  characterCount?: number;
};

type AudioTranscriptionResponse = {
  success: boolean;
  filename: string;
  transcript: string;
  language: string;
};

type VideoAnalysisResponse = {
  success: boolean;
  filename: string;
  analysis: {
    success: boolean;
    faceVisibility: number;
    postureScore: number;
    gazeScore: number;
    engagementScore: number;
    totalFrames: number;
    framesWithFace: number;
  };
};

export class PythonServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 502) {
    super(message);
    this.name = "PythonServiceError";
    this.statusCode = statusCode;
  }
}

async function postFileToPython<T>(
  path: string,
  file: File,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const formData = new FormData();

  formData.append("file", file, file.name);

  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}${path}`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | { detail?: string; message?: string }
      | null;

    if (!response.ok) {
      const message =
        payload?.detail || payload?.message || "Python service request failed";
      const statusCode = response.status >= 500 ? 502 : response.status;
      throw new PythonServiceError(message, statusCode);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof PythonServiceError) {
      throw error;
    }

    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Python service request timed out"
        : "Python service is unavailable";

    throw new PythonServiceError(message, 502);
  } finally {
    clearTimeout(timeout);
  }
}

export async function parseResume(file: File) {
  const response = await postFileToPython<ResumeParseResponse>(
    "/api/analyze/resume",
    file,
    PYTHON_SERVICE_TIMEOUT_MS
  );

  const resumeText = response.resumeText ?? response.extractedText ?? "";

  return {
    success: response.success,
    filename: response.filename,
    resumeText,
    wordCount: response.wordCount,
    characterCount: response.characterCount ?? resumeText.length,
  };
}

export async function transcribeAudio(file: File) {
  return postFileToPython<AudioTranscriptionResponse>(
    "/api/analyze/audio",
    file,
    PYTHON_SERVICE_TIMEOUT_MS
  );
}

export async function analyzeVideo(file: File) {
  return postFileToPython<VideoAnalysisResponse>(
    "/api/analyze/video",
    file,
    PYTHON_VIDEO_TIMEOUT_MS
  );
}
