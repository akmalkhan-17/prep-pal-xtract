import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { auth } from "@/auth";

export async function POST(request: Request) {
    await dbConnect();


    try {
        const session = await auth();

        if(!session || !session.user ){
            return Response.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        const { interviewType, role , resumeText } = await request.json();

        if (
            !interviewType ||
            (interviewType === "role" && !role) ||
            (interviewType === "resume" && !resumeText)
        ){
            return Response.json(
                { success: false, message: "Invalid interview setup data" },
                { status: 400 }
            );
        }
        const interview = {
            interviewType,
            role: interviewType === "role" ? role : undefined,
            resumeText: interviewType === "resume" ? resumeText : undefined,
            softSkillsScore:0,
            technicalSkillsScore:0,
            overallScore:0,
            createdAt: new Date(),
        }

        const user = await UserModel.findById(userId);

        if (!user) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        user.interviews.push(interview)
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