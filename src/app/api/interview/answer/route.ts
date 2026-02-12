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
    await  dbConnect();

    try {
        
        //authenticate

        const session = await auth();

        if(!session || !session.user?.id){
            return Response.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );

        }

        const {interviewId, questionId, answer} = await request.json();

        if(!interviewId || !questionId || !answer){
            return Response.json(
                { success: false, message: "Interview ID, Question ID and Answer are required" },
                { status: 400 }
            );
        }

        //find user

        const user = await UserModel.findById(session.user.id);

        if(!user){
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const interview = user.interviews.id(interviewId);

        if(!interview){
            return Response.json(
                { success: false, message: "Interview not found" },
                { status: 404 }
            );
        }

        // find question inside interview

        const questionDoc = interview.questions?.find(
            (q) => q._id?.toString() === questionId
        );

        if (!questionDoc) {
            return Response.json(
                { success: false, message: "Question not found" },
                { status: 404 }
            );
        }

        //AI prompt for evaluation

        const prompt = `
You are an expert technical interviewer.

Evaluate the following answer.

Question:
${questionDoc.question}

Answer:
${answer}

Give:
1. Score out of 10
2. Short feedback

Return strictly in JSON format:
{
"score": number,
"feedback": "text"
}
`;

    const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 300,
    });

    const raw = aiResponse.choices[0].message.content;

    let parsed;

    try {
        parsed = JSON.parse(raw || "{}");
    } catch {
        return Response.json(
        { success: false, message: "AI response parsing failed" },
        { status: 500 }
        );
    }

    const { score, feedback } = parsed;

    // update existing question

    questionDoc.answer = answer;
    questionDoc.score = score;
    questionDoc.feedback = feedback;


    const questions = interview.questions ?? [];

    const totalScore = questions.reduce(
        (acc, q) => acc + (q.score || 0),
        0
    );

    interview.overallScore =
        questions.length > 0 ? totalScore / questions.length : 0;

    await user.save();

    return Response.json(
        {
            success: true,
            score,
            feedback,
            overallScore: interview.overallScore,
        },
        { status: 200 }
        );
    } catch (error) {
    console.error("Error in /api/interview/answer:", error);

    return Response.json(
        { success: false, message: "Internal Server Error" },
        { status: 500 }
    );
    }
}
