import { z } from "zod";
import { INTERVIEW_ROLES } from "@/lib/interview-config";

export const interviewSetupSchema = z
.object({
    interviewType: z.enum(["role", "resume"]),

    role: z.enum(INTERVIEW_ROLES).optional(),

    resumeText: z.string().trim().min(1).optional(),
})
.refine(
    (data) =>
    (data.interviewType === "role" && !!data.role) ||
    (data.interviewType === "resume" && !!data.resumeText),
    {
    message:
        "Role is required for role-based interview and resume text is required for resume-based interview",
    path: ["interviewType"],
    }
);
