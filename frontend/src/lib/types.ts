export type User = { id: string; name: string; email: string; role: "STUDENT" | "ADMIN" };
export type Status = "PENDING" | "APPROVED" | "REJECTED" | "RECHECK";

export type Project = {
  id: string;
  name: string;
  repoUrl: string;
  liveUrl: string;
  description: string;
  status: Status;
  feedback: string | null;
  mark: number | null; // 0 to 60
  createdAt: string;
  student: { name: string; email: string };
};

export type Stats = { total: number; pending: number; approved: number; rejected: number; recheck: number };
