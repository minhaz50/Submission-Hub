import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Name is too short"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });

export const projectSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(80, "Name is too long"),
  repoUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .regex(/^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/i, "Use the format https://github.com/owner/repo"),
  liveUrl: z.string().trim().url("Enter a valid URL").startsWith("https://", "Live link must start with https://"),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(1000, "Description is too long"),
});

export const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  mark: z
    .number({ error: "Enter a mark from 0 to 60" })
    .int("Mark must be a whole number")
    .min(0, "Mark must be 0 or more")
    .max(60, "Mark can be at most 60"),
  feedback: z.string().trim().max(500, "Feedback is too long"),
});

export type ReviewValues = z.infer<typeof reviewSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ProjectValues = z.infer<typeof projectSchema>;
