import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { JWT_SECRET, authenticate, type AuthRequest } from "../middleware.js";
import { loginSchema, signupSchema } from "../schemas.js";

export const authRouter = Router();

function sendSession(
  res: import("express").Response,
  user: { id: string; name: string; email: string; role: "STUDENT" | "ADMIN" },
  status = 200,
) {
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });
  res
    .status(status)
    .json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
}

authRouter.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({
        message: "Invalid data",
        errors: z.flattenError(parsed.error).fieldErrors,
      });

  const { name, email, password } = parsed.data;
  if (await prisma.user.findUnique({ where: { email } })) {
    return res
      .status(409)
      .json({
        message: "Email already in use",
        errors: { email: ["Email already in use"] },
      });
  }
  const user = await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10) },
  });
  sendSession(res, user, 201);
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({
        message: "Invalid data",
        errors: z.flattenError(parsed.error).fieldErrors,
      });

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (
    !user ||
    !(await bcrypt.compare(parsed.data.password, user.passwordHash))
  ) {
    return res.status(401).json({ message: "Incorrect email or password" });
  }
  sendSession(res, user);
});

authRouter.get("/me", authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(401).json({ message: "Account not found" });
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});
