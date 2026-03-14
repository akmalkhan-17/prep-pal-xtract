import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { auth } from "@/auth";

export async function GET() {

    await dbConnect()

    try {
    const session = await auth();

    if (!session || !session.user?.id) {
        return Response.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }
    const user = await UserModel.findById(session.user.id);

    if (!user) {
        return Response.json(
            { success: false, message: "User not found" },
            { status: 404 }
        );
    }

    const interviews = user.interviews
    .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .map((interview) => ({
        _id: interview._id,
        interviewType: interview.interviewType,
        role: interview.role,
        status: interview.status || "in_progress",
        softSkillsScore: interview.softSkillsScore,
        technicalSkillsScore: interview.technicalSkillsScore,
        overallScore: interview.overallScore,
        totalQuestions: interview.totalQuestions || 0,
        answeredQuestions:
            interview.questions?.filter((question) => Boolean(question.answer?.trim())).length || 0,
        createdAt: interview.createdAt,
    }));

    return Response.json(
        {
            success: true,
            total: interviews.length,
            interviews,
        },
        { status: 200 }
    );

    } catch (error) {
        console.error("Error in /api/interviews:", error);

    return Response.json(
        { success: false, message: "Internal Server Error" },
        { status: 500 }
    );
    }
    
}
