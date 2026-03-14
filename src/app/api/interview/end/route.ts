import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import {
  calculateInterviewScores,
  countAnsweredQuestions,
  getPendingQuestion,
} from "@/lib/interview-engine";
import { MAX_INTERVIEW_QUESTIONS } from "@/lib/interview-config";
import {
  analyzeVideo,
  PythonServiceError,
} from "@/lib/pythonService";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const interviewId = formData.get("interviewId");
    const video = formData.get("video");

    if (typeof interviewId !== "string" || !(video instanceof File)) {
      return Response.json(
        { success: false, message: "Interview ID and video are required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(session.user.id);

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const interview = user.interviews.id(interviewId);

    if (!interview) {
      return Response.json(
        { success: false, message: "Interview not found" },
        { status: 404 }
      );
    }

    const questions = interview.questions ?? [];
    const totalQuestions = interview.totalQuestions || MAX_INTERVIEW_QUESTIONS;
    const answeredQuestions = countAnsweredQuestions(interview);
    const pendingQuestion = getPendingQuestion(interview);

    if (
      questions.length === 0 ||
      answeredQuestions < totalQuestions ||
      pendingQuestion
    ) {
      return Response.json(
        {
          success: false,
          message: "Interview must have 3 answered questions before ending",
        },
        { status: 400 }
      );
    }

    const videoAnalysis = await analyzeVideo(video);
    interview.videoMetrics = videoAnalysis.analysis;

    const scores = calculateInterviewScores(interview);
    interview.technicalSkillsScore = scores.technicalSkillsScore;
    interview.softSkillsScore = scores.softSkillsScore;
    interview.overallScore = scores.overallScore;
    interview.status = "completed";

    await user.save();

    return Response.json(
      {
        success: true,
        overallScore: interview.overallScore,
        technicalSkillsScore: interview.technicalSkillsScore,
        softSkillsScore: interview.softSkillsScore,
        videoMetrics: interview.videoMetrics,
        questions,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof PythonServiceError) {
      return Response.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Error in /api/interview/end:", error);

    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
