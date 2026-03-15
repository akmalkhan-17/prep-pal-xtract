import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import {
  calculateInterviewScores,
  countAnsweredQuestions,
  getPendingQuestion,
} from "@/lib/interview-engine";
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

    // Attempt video analysis — skip gracefully if video is empty or invalid
    let videoAnalysisResult = null;
    if (video.size > 0) {
      try {
        const videoAnalysis = await analyzeVideo(video);
        videoAnalysisResult = videoAnalysis.analysis;
      } catch {
        // Video analysis failed — continue with null metrics
      }
    }

    // Remove any pending unanswered question before calculating scores
    const pendingQuestion = getPendingQuestion(interview);
    const filteredQuestionIds = (interview.questions ?? [])
      .filter((q) =>
        pendingQuestion ? q._id?.toString() !== pendingQuestion._id?.toString() : true
      )
      .map((q) => q._id);

    // Calculate scores based on answered questions only
    const interviewForScoring = {
      ...interview.toObject(),
      questions: (interview.questions ?? []).filter((q) =>
        pendingQuestion ? q._id?.toString() !== pendingQuestion._id?.toString() : true
      ),
      videoMetrics: videoAnalysisResult,
    };
    const scores = calculateInterviewScores(interviewForScoring);

    // Use atomic update to avoid VersionError
    const updateFields: Record<string, unknown> = {
      "interviews.$.videoMetrics": videoAnalysisResult,
      "interviews.$.technicalSkillsScore": scores.technicalSkillsScore,
      "interviews.$.softSkillsScore": scores.softSkillsScore,
      "interviews.$.overallScore": scores.overallScore,
      "interviews.$.status": "completed",
    };

    // If there's a pending unanswered question, remove it by setting the filtered questions
    if (pendingQuestion) {
      updateFields["interviews.$.questions"] = (interview.questions ?? []).filter(
        (q) => q._id?.toString() !== pendingQuestion._id?.toString()
      );
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: session.user.id, "interviews._id": interviewId },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        { success: false, message: "Failed to finalize interview" },
        { status: 500 }
      );
    }

    const finalInterview = updatedUser.interviews.id(interviewId);

    return Response.json(
      {
        success: true,
        overallScore: finalInterview?.overallScore ?? scores.overallScore,
        technicalSkillsScore: finalInterview?.technicalSkillsScore ?? scores.technicalSkillsScore,
        softSkillsScore: finalInterview?.softSkillsScore ?? scores.softSkillsScore,
        videoMetrics: videoAnalysisResult,
        questions: finalInterview?.questions ?? [],
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
