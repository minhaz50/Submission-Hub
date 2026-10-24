import "dotenv/config";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.js";
import { projectRouter } from "./routes/projects.js";

if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL and JWT_SECRET in .env");
  process.exit(1);
}

const app = express();
app.set("trust proxy", 1);
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

const port = process.env.PORT ?? 4000;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
