import { z } from "zod";

export const interviewSetupSchema = z
.object({
    interviewType: z.enum(["role", "resume"]),

    role: z.string().optional(),

    resumeText: z.string().optional(),
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