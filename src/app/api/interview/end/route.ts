import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { auth } from "@/auth";

export async function POST(request: Request){
    await dbConnect();

    try {
        const session = await auth();

        if(!session || !session.user?.id){ return Response.json( 
            { success: false, message: "Unauthorized" }, 
            { status: 401 } 
        );
    }

    const {interviewId} = await request.json();

    if(!interviewId){ 
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

    
    const questions = interview.questions ?? [];

    if (questions.length === 0) {
        return Response.json(
        { success: false, message: "No questions answered" },
        { status: 400 }
        );
    }

    const totalScore = questions.reduce(
        (acc, q) => acc + (q.score || 0),
        0
    );

    const overallScore = totalScore / questions.length;

    interview.overallScore = overallScore;
    interview.technicalSkillsScore = overallScore;
    interview.softSkillsScore = interview.softSkillsScore || 0;    //here ananya will implement the logic to calculate soft skills score with python libraries 

    await user.save();

    return Response.json(
        {
        success: true,
        totalQuestions: questions.length,
        overallScore,
        technicalSkillsScore: interview.technicalSkillsScore,
        softSkillsScore: interview.softSkillsScore,
        },
        { status: 200 }
    );

    } catch (error) {
    console.error("Error in /api/interview/end:", error);

    return Response.json(
        { success: false, message: "Internal Server Error" },
        { status: 500 }
    );
    }
}