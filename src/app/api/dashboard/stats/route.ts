import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { auth } from "@/auth";
import { success } from "zod";

export async function GET(request : Request) {

    await dbConnect();


    try {
        const session = await auth()

        if(!session || !session.user?.id){
            return Response.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        const user = await UserModel.findById(session.user.id);

        if(!user){
            return Response.json(
                {success: false , message: "User not found"},
                {status: 404}
            )
        }

        const interviews = user.interviews ?? [];

        if (interviews.length === 0) {
            return Response.json(
                {
                success: true,
                totalInterviews: 0,
                avgOverallScore: 0,
                avgTechnicalScore: 0,
                avgSoftSkillsScore: 0,
                latestInterview: null,
            },
            { status: 200 }
            );
        }

        const totalInterviews = interviews.length;

    const totalOverall = interviews.reduce(
        (acc, i) => acc + (i.overallScore || 0),
        0
    );

    const totalTechnical = interviews.reduce(
        (acc, i) => acc + (i.technicalSkillsScore || 0),
        0
    );

    const totalSoft = interviews.reduce(
        (acc, i) => acc + (i.softSkillsScore || 0),
        0
    );


    const avgOverallScore = totalOverall / totalInterviews;
    const avgTechnicalScore = totalTechnical / totalInterviews;
    const avgSoftSkillsScore = totalSoft / totalInterviews;


    const latestInterview = interviews.sort(
        (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )[0];

    return Response.json(
        {
            success: true,
            totalInterviews,
            avgOverallScore,
            avgTechnicalScore,
            avgSoftSkillsScore,
            latestInterview,
        },
        { status: 200 }
    );
    } catch (error) {
    console.error("Error in /api/dashboard/stats:", error);

    return Response.json(
        { success: false, message: "Internal Server Error" },
        { status: 500 }
    );
    }
}