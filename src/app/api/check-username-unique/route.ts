import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";

const UsernameQuerySchema = z.object({
    username: usernameValidation,
})

export async function GET(request: Request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        
        const result = UsernameQuerySchema.safeParse({
            username: searchParams.get("username")
        })
        if(!result.success){
            return Response.json(
                { success: false, message: "Invalid username format." },
                { status: 400 }
            );
        }

        const { username } = result.data;

        const existingUser = await UserModel.findOne({ 
            username,
            isVerified: true
        });

        if (existingUser) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken.",
                },
                { status: 400 }
            );
        } else {
            return Response.json(
                {
                    success: true,
                    message: "Username is available.",
                },
                { status: 200 }
            );
        }

    } catch (error) {
        console.error("Error checking username uniqueness:", error);
        return Response.json({
            success: false,
            message: "Internal server error.",
        }, { status: 500
        })
    }
}