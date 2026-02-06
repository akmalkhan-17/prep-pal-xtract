import { z } from "zod";

export const interviewResultSchema = z.object({
    interviewType: z.enum(["skill", "role"]),

    skills: z.array(z.string()).optional(),

    role: z.string().optional(),

    softSkillsScore: z
        .number()
        .min(0)
        .max(100),

    technicalSkillsScore: z
        .number()
        .min(0)
        .max(100),

    overallScore: z
        .number()
        .min(0)
        .max(100),
    });