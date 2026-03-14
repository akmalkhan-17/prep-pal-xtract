import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { auth } from "@/auth";

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {

    await dbConnect()

    try {

    const session = await auth();

    if (!session || !session.user?.id) {
        return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
        );
    }

    const { id: interviewId } = await context.params;

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


        
    return Response.json(
        {
        success: true,
        interview,
        },
        { status: 200 }
    );

    } catch (error) {
    console.error("Error in /api/interviews/[id]:", error);

    return Response.json(
        { success: false, message: "Internal Server Error" },
        { status: 500 }
    );
    }
}
