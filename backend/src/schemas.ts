import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const projectSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(80),
  repoUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .regex(
      /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/i,
      "Use the format https://github.com/owner/repo",
    ),
  liveUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .startsWith("https://", "Live link must start with https://"),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .max(1000),
});

export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "RECHECK"]).optional(),
});

export const reviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  mark: z
    .number()
    .int("Mark must be a whole number")
    .min(0, "Mark must be 0 or more")
    .max(60, "Mark can be at most 60"),
  feedback: z.string().trim().max(500, "Feedback is too long").optional(),
});
