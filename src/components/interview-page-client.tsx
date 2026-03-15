"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { useRouter } from "next/navigation";
import type { QuestionPayload } from "@/lib/interview-client-types";

type QuestionResponse = {
  success: boolean;
  isInterviewComplete?: boolean;
  question?: QuestionPayload;
  message?: string;
};

type AnswerResponse = {
  success: boolean;
  transcript: string;
  technicalScore: number;
  communicationScore: number;
  feedback: string;
  hasNextQuestion: boolean;
  message?: string;
};

type EndResponse = {
  success: boolean;
  message?: string;
};

type LatestAnswer = {
  transcript: string;
  technicalScore: number;
  communicationScore: number;
  feedback: string;
};

const audioMimeCandidates = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
];

const videoMimeCandidates = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

export function InterviewPageClient(props: { interviewId: string }) {
  const router = useRouter();
  const [question, setQuestion] = useState<QuestionPayload | null>(null);
  const [latestAnswer, setLatestAnswer] = useState<LatestAnswer | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Loading interview...");
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(true);
  const [isAnswering, setIsAnswering] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isEndingInterview, setIsEndingInterview] = useState(false);
  const [permissionsReady, setPermissionsReady] = useState(false);

  const previewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);
  const loadingQuestionRef = useRef(false);

  const loadQuestion = useCallback(async () => {
    if (loadingQuestionRef.current) return;
    loadingQuestionRef.current = true;
    try {
      setIsFetchingQuestion(true);
      setError("");
      setStatus("Fetching your next interview question...");

      const response = await fetch("/api/interview/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ interviewId: props.interviewId }),
      });

      const data = (await response.json()) as QuestionResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load the interview question.");
      }

      if (data.isInterviewComplete) {
        router.replace(`/dashboard/results/${props.interviewId}`);
        return;
      }

      if (!data.question) {
        throw new Error("Question payload was empty.");
      }

      setQuestion(data.question);
      setLatestAnswer(null);
      setStatus(
        `Question ${data.question.order} ready. Start answering when you are set.`
      );
    } catch (questionError) {
      setError(
        questionError instanceof Error
          ? questionError.message
          : "Unable to load the interview question."
      );
      setStatus("We could not load the question.");
    } finally {
      setIsFetchingQuestion(false);
      loadingQuestionRef.current = false;
    }
  }, [props.interviewId, router]);

  useEffect(() => {
    void loadQuestion();

    return () => {
      stopTracks(mediaStreamRef, previewRef);
    };
  }, [loadQuestion]);

  async function ensureMediaReady() {
    if (mediaStreamRef.current) {
      return mediaStreamRef.current;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    mediaStreamRef.current = stream;
    setPermissionsReady(true);

    if (previewRef.current) {
      previewRef.current.srcObject = stream;
      await previewRef.current.play().catch(() => undefined);
    }

    return stream;
  }

  async function startAnswering() {
    if (!question) {
      return;
    }

    try {
      setError("");
      setLatestAnswer(null);
      setStatus("Requesting camera and microphone access...");

      const stream = await ensureMediaReady();

      if (!videoRecorderRef.current) {
        const videoRecorder = new MediaRecorder(stream, {
          mimeType: pickMimeType(videoMimeCandidates),
        });

        videoChunksRef.current = [];
        videoRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            videoChunksRef.current.push(event.data);
          }
        };
        videoRecorderRef.current = videoRecorder;
        videoRecorder.start(1000);
      }

      const audioStream = new MediaStream(stream.getAudioTracks());
      const audioRecorder = new MediaRecorder(audioStream, {
        mimeType: pickMimeType(audioMimeCandidates),
      });

      audioChunksRef.current = [];
      audioRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      audioRecorderRef.current = audioRecorder;
      audioRecorder.start(500);

      setIsAnswering(true);
      setStatus(`Recording answer for question ${question.order}...`);
    } catch (mediaError) {
      setError(
        mediaError instanceof Error
          ? mediaError.message
          : "Unable to access microphone and camera."
      );
      setStatus("Permissions are required to continue.");
    }
  }

  async function submitCurrentAnswer() {
    if (!question || !audioRecorderRef.current) {
      setError("Start answering before moving to the next question.");
      return;
    }

    try {
      setIsSubmittingAnswer(true);
      setError("");
      setStatus("Stopping audio recording and uploading your answer...");

      const audioBlob = await stopRecorder(audioRecorderRef.current, audioChunksRef);
      audioRecorderRef.current = null;

      const formData = new FormData();
      formData.append("interviewId", props.interviewId);
      formData.append("questionId", question.id);
      formData.append("audio", blobToFile(audioBlob, `question-${question.order}.webm`));

      const response = await fetch("/api/interview/answer", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as AnswerResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to submit this answer.");
      }

      setLatestAnswer({
        transcript: data.transcript,
        technicalScore: data.technicalScore,
        communicationScore: data.communicationScore,
        feedback: data.feedback,
      });

      setIsAnswering(false);

      if (data.hasNextQuestion) {
        setStatus("Answer saved. Generating your next question...");
        await loadQuestion();
      } else {
        setQuestion(null);
        setStatus(
          "All questions are answered. End the interview to upload the final video and calculate results."
        );
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit the answer."
      );
      setStatus("The answer was not submitted.");
    } finally {
      setIsSubmittingAnswer(false);
    }
  }

  async function endInterview() {
    try {
      setIsEndingInterview(true);
      setError("");
      setStatus("Finalizing your interview...");

      if (audioRecorderRef.current && audioRecorderRef.current.state !== "inactive") {
        await stopRecorder(audioRecorderRef.current, audioChunksRef);
        audioRecorderRef.current = null;
      }

      let videoBlob: Blob;

      if (videoRecorderRef.current) {
        videoBlob = await stopRecorder(videoRecorderRef.current, videoChunksRef);
        videoRecorderRef.current = null;
      } else {
        // No video was recorded — create a minimal empty blob
        videoBlob = new Blob([], { type: "video/webm" });
      }

      const formData = new FormData();
      formData.append("interviewId", props.interviewId);
      formData.append("video", blobToFile(videoBlob, "interview-session.webm"));

      const response = await fetch("/api/interview/end", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as EndResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to end the interview.");
      }

      stopTracks(mediaStreamRef, previewRef);
      router.replace(`/dashboard/results/${props.interviewId}`);
    } catch (endError) {
      setError(
        endError instanceof Error
          ? endError.message
          : "Unable to end the interview."
      );
      setStatus("The interview is still open.");
    } finally {
      setIsEndingInterview(false);
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-6">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-amber-300/15 px-3 py-1 text-sm text-amber-100">
              3-question adaptive interview
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-300">
              {permissionsReady ? "Camera and mic ready" : "Permissions pending"}
            </span>
          </div>

          <h2 className="mt-5 text-3xl font-semibold tracking-tight">
            {question
              ? `Question ${question.order}`
              : "Interview questions completed"}
          </h2>
          <p className="mt-3 text-sm uppercase tracking-[0.28em] text-slate-400">
            {question?.difficulty || "Ready for final review"}
          </p>
          <div className="mt-6 rounded-[1.75rem] bg-slate-950/45 p-6 text-lg leading-8 text-slate-100">
            {question?.text ||
              "You have finished all generated questions. Use End Interview to upload the recorded video and see your results."}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startAnswering}
              disabled={isFetchingQuestion || isAnswering || !question || isEndingInterview}
              className="rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAnswering ? "Recording..." : "Start Answering"}
            </button>
            <button
              type="button"
              onClick={submitCurrentAnswer}
              disabled={!isAnswering || isSubmittingAnswer || isEndingInterview}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmittingAnswer ? "Submitting..." : "Next Question"}
            </button>
            <button
              type="button"
              onClick={endInterview}
              disabled={isEndingInterview || isSubmittingAnswer}
              className="rounded-full border border-red-300/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEndingInterview ? "Ending Interview..." : "End Interview"}
            </button>
          </div>

          <p className="mt-5 text-sm text-slate-300">{status}</p>
          {error ? (
            <div className="mt-4 rounded-3xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}
        </article>

        {latestAnswer ? (
          <article className="rounded-[2rem] border border-emerald-300/15 bg-emerald-400/10 p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <ScoreCard
                label="Technical Score"
                value={`${latestAnswer.technicalScore}/100`}
              />
              <ScoreCard
                label="Communication Score"
                value={`${latestAnswer.communicationScore}/100`}
              />
            </div>

            <div className="mt-5">
              <h3 className="text-lg font-semibold text-white">Transcript</h3>
              <p className="mt-2 text-sm leading-7 text-emerald-50/90">
                {latestAnswer.transcript}
              </p>
            </div>

            <div className="mt-5">
              <h3 className="text-lg font-semibold text-white">Feedback</h3>
              <p className="mt-2 text-sm leading-7 text-emerald-50/90">
                {latestAnswer.feedback}
              </p>
            </div>
          </article>
        ) : null}
      </section>

      <section className="space-y-6">
        <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/55">
          <div className="border-b border-white/10 px-6 py-4">
            <h3 className="text-lg font-semibold">Live Preview</h3>
            <p className="mt-1 text-sm text-slate-300">
              Video records from your first answer until you end the interview.
            </p>
          </div>
          <div className="aspect-video bg-black">
            <video ref={previewRef} muted playsInline className="h-full w-full object-cover" />
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Flow Summary</h3>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            <li>Start Answering requests camera and microphone permissions.</li>
            <li>Audio is captured only for the active question.</li>
            <li>Next Question uploads audio and asks the backend for the next prompt.</li>
            <li>End Interview uploads one final video for posture, gaze, and engagement scoring.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}

function ScoreCard(props: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-4">
      <p className="text-sm text-emerald-50/75">{props.label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{props.value}</p>
    </div>
  );
}

function pickMimeType(candidates: string[]) {
  const supported = candidates.find((value) => MediaRecorder.isTypeSupported(value));
  return supported || undefined;
}

function blobToFile(blob: Blob, name: string) {
  return new File([blob], name, {
    type: blob.type || "application/octet-stream",
    lastModified: Date.now(),
  });
}

function stopRecorder(
  recorder: MediaRecorder,
  chunksRef: MutableRefObject<Blob[]>
) {
  return new Promise<Blob>((resolve, reject) => {
    const complete = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      chunksRef.current = [];
      resolve(blob);
    };

    recorder.onstop = complete;
    recorder.onerror = () => {
      reject(new Error("Media recording failed."));
    };

    if (recorder.state === "inactive") {
      complete();
      return;
    }

    recorder.stop();
  });
}

function stopTracks(
  mediaStreamRef: MutableRefObject<MediaStream | null>,
  previewRef: MutableRefObject<HTMLVideoElement | null>
) {
  const stream = mediaStreamRef.current;
  if (!stream) {
    return;
  }

  stream.getTracks().forEach((track) => track.stop());
  mediaStreamRef.current = null;

  if (previewRef.current) {
    previewRef.current.srcObject = null;
  }
}
