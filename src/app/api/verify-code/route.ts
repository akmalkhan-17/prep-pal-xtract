import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
await dbConnect();

try {
    const { email, code } = await request.json();

    if (!email || !code) {
    return Response.json(
        { success: false, message: "Email and code are required." },
        { status: 400 }
    );
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
    return Response.json(
        { success: false, message: "User not found." },
        { status: 404 }
    );
    }

    if (user.isVerified) {
    return Response.json(
        { success: false, message: "User is already verified." },
        { status: 400 }
    );
    }
    //safety k liye string me convert krke compare kr rhe hai taki type mismatch ka error na aaye
    if (String(user.verifyCode) !== String(code)) {
    return Response.json(
        { success: false, message: "Invalid verification code." },
        { status: 400 }
    );
    }

    if (!user.verifyCodeExpiry) {
    return Response.json(
        { success: false, message: "Verification code missing." },
        { status: 400 }
    );
    }

    if (new Date(user.verifyCodeExpiry) < new Date()) {
    return Response.json(
        { success: false, message: "Verification code expired." },
        { status: 400 }
    );
    }

    user.isVerified = true;
    user.verifyCode = undefined;
    user.verifyCodeExpiry = undefined;

    await user.save();

    return Response.json(
    { success: true, message: "Email verified successfully." },
    { status: 200 }
    );
} catch (error) {
    console.error("Error verifying code:", error);
    return Response.json(
    { success: false, message: "Internal server error." },
    { status: 500 }
    );
}
}