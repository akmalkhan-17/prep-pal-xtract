import { z } from "zod";
import { INTERVIEW_ROLES, INTERVIEW_STATUSES } from "@/lib/interview-config";

export const interviewResultSchema = z.object({
interviewType: z.enum(["role", "resume"]),

role: z.enum(INTERVIEW_ROLES).optional(),

resumeText: z.string().trim().min(1).optional(),

status: z.enum(INTERVIEW_STATUSES),

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

videoMetrics: z
    .object({
        faceVisibility: z.number().min(0).max(100),
        postureScore: z.number().min(0).max(100),
        gazeScore: z.number().min(0).max(100),
        engagementScore: z.number().min(0).max(100),
        totalFrames: z.number().min(0),
        framesWithFace: z.number().min(0),
    })
    .nullable()
    .optional(),
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
