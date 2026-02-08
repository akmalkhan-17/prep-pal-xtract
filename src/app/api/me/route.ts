import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { auth } from "@/auth";

export async function GET(request: Request) {
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

        const user = await UserModel.findById(userId).select("-password -verifyCode -verifyCodeExpiry");

        if (!user) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return Response.json(
            { success: true, user },
            { status: 200 }
        );

    } catch (error) {
        console.error("GET /api/me error:", error);
    return Response.json(
    { success: false, message: "Internal server error" },
    { status: 500 }
    );
    }
}