import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import {
  countAnsweredQuestions,
  evaluateInterviewAnswer,
} from "@/lib/interview-engine";
import { MAX_INTERVIEW_QUESTIONS } from "@/lib/interview-config";
import {
  PythonServiceError,
  transcribeAudio,
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
    const questionId = formData.get("questionId");
    const audio = formData.get("audio");

    if (
      typeof interviewId !== "string" ||
      typeof questionId !== "string" ||
      !(audio instanceof File)
    ) {
      return Response.json(
        {
          success: false,
          message: "Interview ID, Question ID and audio are required",
        },
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

    const questionDoc = interview.questions?.find(
      (question) => question._id?.toString() === questionId
    );

    if (!questionDoc) {
      return Response.json(
        { success: false, message: "Question not found" },
        { status: 404 }
      );
    }

    if (questionDoc.answer?.trim()) {
      return Response.json(
        { success: false, message: "This question already has a saved answer" },
        { status: 400 }
      );
    }

    const transcription = await transcribeAudio(audio);
    const transcript = transcription.transcript.trim() || "[No answer detected]";
    const evaluation = await evaluateInterviewAnswer({
      interview,
      question: questionDoc,
      transcript,
    });

    // Use atomic $set on the specific array element to avoid VersionError
    const updatedUser = await UserModel.findOneAndUpdate(
      {
        _id: session.user.id,
        "interviews._id": interviewId,
      },
      {
        $set: {
          "interviews.$[iv].questions.$[q].answer": transcript,
          "interviews.$[iv].questions.$[q].technicalScore": evaluation.technicalScore,
          "interviews.$[iv].questions.$[q].communicationScore": evaluation.communicationScore,
          "interviews.$[iv].questions.$[q].feedback": evaluation.feedback,
        },
      },
      {
        arrayFilters: [
          { "iv._id": interviewId },
          { "q._id": questionId },
        ],
        new: true,
      }
    );

    if (!updatedUser) {
      return Response.json(
        { success: false, message: "Failed to save the answer" },
        { status: 500 }
      );
    }

    const updatedInterview = updatedUser.interviews.id(interviewId);
    const answeredQuestions = countAnsweredQuestions(updatedInterview!);
    const totalQuestions = updatedInterview?.totalQuestions || MAX_INTERVIEW_QUESTIONS;

    return Response.json(
      {
        success: true,
        transcript,
        technicalScore: evaluation.technicalScore,
        communicationScore: evaluation.communicationScore,
        feedback: evaluation.feedback,
        hasNextQuestion: answeredQuestions < totalQuestions,
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

    console.error("Error in /api/interview/answer:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return Response.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
