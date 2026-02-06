import { z } from "zod";

export const interviewSetupSchema = z
    .object({
        interviewType: z.enum(["skill", "role"]),

        skills: z.array(z.string()).optional(),

        role: z.string().optional(),
    })
    .refine(
        (data) =>
        (data.interviewType === "skill" && data.skills?.length) ||
        (data.interviewType === "role" && data.role),
        {
        message:
            "Skills are required for skill-based interview and role is required for role-based interview",
        path: ["interviewType"],
        }
    );