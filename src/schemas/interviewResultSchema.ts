import { z } from "zod";

export const interviewResultSchema = z.object({
interviewType: z.enum(["role", "resume"]),

role: z.string().optional(),

resumeText: z.string().optional(),

softSkillsScore: z
    .number()
    .min(0, "Soft skills score cannot be less than 0")
    .max(100, "Soft skills score cannot exceed 100"),

technicalSkillsScore: z
    .number()
    .min(0, "Technical skills score cannot be less than 0")
    .max(100, "Technical skills score cannot exceed 100"),

overallScore: z
    .number()
    .min(0, "Overall score cannot be less than 0")
    .max(100, "Overall score cannot exceed 100"),
})
.refine(
(data) =>
    (data.interviewType === "role" && !!data.role) ||
    (data.interviewType === "resume" && !!data.resumeText),
{
    message:
    "Role is required for role-based interviews and resume text is required for resume-based interviews",
    path: ["interviewType"],
}
);