import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { authenticate, requireRole, type AuthRequest } from "../middleware.js";
import { listSchema, projectSchema, reviewSchema } from "../schemas.js";

export const projectRouter = Router();

// Basic spam protection: max 5 submissions per 10 minutes for each student
const submitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  keyGenerator: (req) => (req as AuthRequest).user!.id,
  message: { message: "Too many submissions. Please try again in a few minutes" },
});

// "https://GitHub.com/Me/App.git/" -> "https://github.com/me/app"
const cleanRepoUrl = (url: string) => url.toLowerCase().replace(/\.git$/, "").replace(/\/+$/, "");

const include = { student: { select: { name: true, email: true } } };

// ---------- Student ----------

projectRouter.post("/", authenticate, requireRole("STUDENT"), submitLimiter, async (req: AuthRequest, res) => {
  const parsed = projectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: z.flattenError(parsed.error).fieldErrors });

  const { name, repoUrl, liveUrl, description } = parsed.data;
  try {
    const project = await prisma.project.create({
      data: { name, repoUrl: cleanRepoUrl(repoUrl), liveUrl, description, studentId: req.user!.id },
      include,
    });
    res.status(201).json({ project });
  } catch (e) {
    // P2002 = unique constraint failed (this repo was already submitted)
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(409).json({ message: "Duplicate submission", errors: { repoUrl: ["This repository was already submitted"] } });
    }
    throw e;
  }
});

projectRouter.get("/mine", authenticate, requireRole("STUDENT"), async (req: AuthRequest, res) => {
  const projects = await prisma.project.findMany({ where: { studentId: req.user!.id }, orderBy: { createdAt: "desc" }, include });
  res.json({ projects });
});

// ---------- Admin / mentor ----------

// Pagination and the status filter both happen in the database
projectRouter.get("/", authenticate, requireRole("ADMIN"), async (req, res) => {
  const parsed = listSchema.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ message: "Invalid query" });

  const { page, limit, status } = parsed.data;
  const where = status ? { status } : {};

  const [total, projects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include }),
  ]);
  res.json({ projects, page, totalPages: Math.max(1, Math.ceil(total / limit)), total });
});

projectRouter.get("/stats", authenticate, requireRole("ADMIN"), async (_req, res) => {
  const [pending, approved, rejected, recheck] = await Promise.all([
    prisma.project.count({ where: { status: "PENDING" } }),
    prisma.project.count({ where: { status: "APPROVED" } }),
    prisma.project.count({ where: { status: "REJECTED" } }),
    prisma.project.count({ where: { status: "RECHECK" } }),
  ]);
  res.json({ total: pending + approved + rejected + recheck, pending, approved, rejected, recheck });
});

// Approve / reject (also used to edit an existing review): status + mark (0-60) + feedback
projectRouter.patch("/:id", authenticate, requireRole("ADMIN"), async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: z.flattenError(parsed.error).fieldErrors });

  const id = String(req.params.id);
  const exists = await prisma.project.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ message: "Project not found" });

  const { status, mark, feedback } = parsed.data;
  const project = await prisma.project.update({ where: { id }, data: { status, mark, feedback: feedback || null }, include });
  res.json({ project });
});

projectRouter.delete("/:id", authenticate, requireRole("ADMIN"), async (req, res) => {
  const id = String(req.params.id);
  const exists = await prisma.project.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ message: "Project not found" });

  await prisma.project.delete({ where: { id } });
  res.json({ message: "Project deleted" });
});

// Student asks for a recheck of a project that was already approved or rejected
projectRouter.patch("/:id/recheck", authenticate, requireRole("STUDENT"), async (req: AuthRequest, res) => {
  const id = String(req.params.id);
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.studentId !== req.user!.id) return res.status(404).json({ message: "Project not found" });
  if (project.status !== "APPROVED" && project.status !== "REJECTED") {
    return res.status(400).json({ message: "Only reviewed projects can be rechecked" });
  }

  const updated = await prisma.project.update({ where: { id }, data: { status: "RECHECK" }, include });
  res.json({ project: updated });
});
