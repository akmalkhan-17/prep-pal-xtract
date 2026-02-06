import { z } from "zod";

export const verifySchema = z.object({
        email: z.email("Invalid email address"),
        verifyCode: z
        .string()
        .length(6, "Verification code must be exactly 6 digits")
        .regex(/^[0-9]+$/, "Verification code must contain only numbers"),
});