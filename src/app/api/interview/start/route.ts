import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import { MAX_INTERVIEW_QUESTIONS } from "@/lib/interview-config";
import UserModel from "@/model/User";
import { interviewSetupSchema } from "@/schemas/interviewSetupSchema";
import mongoose from "mongoose";

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

    if (!mongoose.Types.ObjectId.isValid(session.user.id)) {
      return Response.json(
        { success: false, message: "Invalid user session" },
        { status: 401 }
      );
    }

    const parsedBody = interviewSetupSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return Response.json(
        { success: false, message: "Invalid interview setup data" },
        { status: 400 }
      );
    }

    const { interviewType, role, resumeText } = parsedBody.data;

    const newInterview = {
      _id: new mongoose.Types.ObjectId(),
      interviewType,
      role: interviewType === "role" ? role : undefined,
      resumeText: interviewType === "resume" ? resumeText?.trim() : undefined,
      status: "in_progress",
      totalQuestions: MAX_INTERVIEW_QUESTIONS,
      videoMetrics: null,
      questions: [],
      softSkillsScore: 0,
      technicalSkillsScore: 0,
      overallScore: 0,
      createdAt: new Date(),
    };

    // Use atomic $push to avoid Mongoose VersionError
    const updatedUser = await UserModel.findByIdAndUpdate(
      session.user.id,
      { $push: { interviews: newInterview } },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(
      { success: true, interviewId: newInterview._id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error starting interview:", error);

    const message =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message
        : "Internal server error";

    return Response.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
