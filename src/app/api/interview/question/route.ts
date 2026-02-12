import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { auth } from "@/auth";
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
throw new Error("OPENAI_API_KEY is not defined in .env");
}

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
await dbConnect();

    try {
        // authenticate user
        const session = await auth();

        if (!session || !session.user?.id) {
        return Response.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
        }

        // Get interviewId from body
        const { interviewId } = await request.json();

        if (!interviewId) {
        return Response.json(
            { success: false, message: "Interview ID is required" },
            { status: 400 }
        );
        }

        // Find user
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

        //  AI prompt
        let prompt = "";

        if (interview.interviewType === "role") {
        prompt = `
    You are a professional technical interviewer.

    Generate 3 high-quality technical interview questions for a ${interview.role} position.

    Return strictly a JSON array like:
    ["Question 1", "Question 2", "Question 3"]

    Do not include explanations.
    `;
        } else {
        prompt = `
    You are a professional technical interviewer.

    Based on this resume:
    ${interview.resumeText}

    Generate 3 relevant technical interview questions.

    Return strictly a JSON array like:
    ["Question 1", "Question 2", "Question 3"]

    Do not include explanations.
    `;
        }

        //  OpenAI
        const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
            role: "user",
            content: prompt,
            },
        ],
        max_tokens: 300,
        temperature: 0.7,
        });

        const raw = response.choices[0].message.content;

        let questions: string[] = [];

        try {
        questions = JSON.parse(raw || "[]");
        } catch {
        questions = raw ? [raw] : [];
        }

        return Response.json(
        {
            success: true,
            questions,
        },
        { status: 200 }
        );
} catch (error) {
    console.error("Error in /api/interview/question:", error);

    return Response.json(
    { success: false, message: "Internal Server Error" },
    { status: 500 }
    );
}
}