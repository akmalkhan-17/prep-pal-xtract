import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import {
  countAnsweredQuestions,
  generateInterviewQuestion,
  getPendingQuestion,
  serializeQuestion,
} from "@/lib/interview-engine";
import { MAX_INTERVIEW_QUESTIONS } from "@/lib/interview-config";
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

    const { interviewId } = await request.json();

    if (!interviewId) {
      return Response.json(
        { success: false, message: "Interview ID is required" },
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

    if (interview.status === "completed") {
      return Response.json(
        {
          success: true,
          isInterviewComplete: true,
        },
        { status: 200 }
      );
    }

    const pendingQuestion = getPendingQuestion(interview);

    if (pendingQuestion) {
      return Response.json(
        {
          success: true,
          isInterviewComplete: false,
          question: serializeQuestion(pendingQuestion),
        },
        { status: 200 }
      );
    }

    const answeredQuestions = countAnsweredQuestions(interview);
    const totalQuestions = interview.totalQuestions || MAX_INTERVIEW_QUESTIONS;

    if (answeredQuestions >= totalQuestions) {
      return Response.json(
        {
          success: true,
          isInterviewComplete: true,
        },
        { status: 200 }
      );
    }

    const generatedQuestion = await generateInterviewQuestion(interview);

    if (!generatedQuestion.question) {
      return Response.json(
        { success: false, message: "Failed to generate interview question" },
        { status: 500 }
      );
    }

    interview.questions = interview.questions || [];
    interview.questions.push({
      question: generatedQuestion.question,
      order: generatedQuestion.order,
      difficulty: generatedQuestion.difficulty,
    });

    await user.save();

    const savedQuestion = interview.questions[interview.questions.length - 1];

    return Response.json(
      {
        success: true,
        isInterviewComplete: false,
        question: serializeQuestion(savedQuestion),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/interview/question:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return Response.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
