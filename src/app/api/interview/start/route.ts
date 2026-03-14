import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import { MAX_INTERVIEW_QUESTIONS } from "@/lib/interview-config";
import UserModel from "@/model/User";
import { interviewSetupSchema } from "@/schemas/interviewSetupSchema";

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

    const parsedBody = interviewSetupSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return Response.json(
        { success: false, message: "Invalid interview setup data" },
        { status: 400 }
      );
    }

    const { interviewType, role, resumeText } = parsedBody.data;
    const user = await UserModel.findById(session.user.id);

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    user.interviews.push({
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
    });

    await user.save();

    const interviewId = user.interviews[user.interviews.length - 1]._id;

    return Response.json(
      { success: true, interviewId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error starting interview:", error);

    return Response.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
