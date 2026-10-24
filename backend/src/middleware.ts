import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthRequest = Request & { user?: { id: string; role: "STUDENT" | "ADMIN" } };

export const JWT_SECRET = process.env.JWT_SECRET ?? "";

// Reads "Authorization: Bearer <token>" and attaches the user to the request
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Please log in" });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; role: "STUDENT" | "ADMIN" };
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Please log in again" });
  }
}

// Role-based access control
export const requireRole = (role: "STUDENT" | "ADMIN") => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== role) return res.status(403).json({ message: "You are not allowed to do this" });
  next();
};
