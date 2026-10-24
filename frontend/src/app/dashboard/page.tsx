"use client";
import { useCallback, useEffect, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Check, ChevronLeft, ChevronRight, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useRequireRole } from "@/lib/auth";
import type { Project, Stats, Status } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { ReviewModal } from "@/components/review-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Table, TableCell, TableHead } from "@/components/ui/table";

type Filter = "ALL" | Status;
const filters: Filter[] = ["ALL", "PENDING", "APPROVED", "REJECTED", "RECHECK"];

export default function DashboardPage() {
  const user = useRequireRole("ADMIN");
  const [stats, setStats] = useState<Stats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // which project the review popup is open for
  const [modal, setModal] = useState<{ project: Project; status?: "APPROVED" | "REJECTED" } | null>(null);

  const loadStats = useCallback(() => {
    api<Stats>("/projects/stats").then(setStats);
  }, []);

  // The server does the filtering and pagination
  const loadProjects = useCallback(() => {
    const status = filter === "ALL" ? "" : `&status=${filter}`;
    api<{ projects: Project[]; totalPages: number }>(`/projects?page=${page}&limit=8${status}`).then((r) => {
      setProjects(r.projects);
      setTotalPages(r.totalPages);
      // if the last item of a page was deleted, go back one page
      if (r.projects.length === 0 && page > 1) setPage(page - 1);
    });
  }, [filter, page]);

  useEffect(() => {
    if (user) loadStats();
  }, [user, loadStats]);

  useEffect(() => {
    if (user) loadProjects();
  }, [user, loadProjects]);

  function refresh() {
    loadStats();
    loadProjects();
  }

  async function remove(p: Project) {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await api(`/projects/${p.id}`, { method: "DELETE" });
      toast.success("Project deleted");
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (!user) return null;

  const chartData = [
    { name: "Pending", count: stats?.pending ?? 0, color: "#f59e0b" },
    { name: "Approved", count: stats?.approved ?? 0, color: "#16a34a" },
    { name: "Rejected", count: stats?.rejected ?? 0, color: "#dc2626" },
    { name: "Recheck", count: stats?.recheck ?? 0, color: "#4338ca" },
  ];
  const cards = [
    { label: "Pending", value: stats?.pending },
    { label: "Approved", value: stats?.approved },
    { label: "Rejected", value: stats?.rejected },
    { label: "Recheck", value: stats?.recheck },
  ];

  return (
    <>
      <Navbar user={user} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold">Review dashboard</h1>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            <Card className="col-span-2">
              <p className="text-sm text-muted-foreground">Total submissions</p>
              <p className="mt-1 text-4xl font-bold">{stats?.total ?? "-"}</p>
            </Card>
            {cards.map((c) => (
              <Card key={c.label}>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="mt-1 text-3xl font-bold">{c.value ?? "-"}</p>
              </Card>
            ))}
          </div>
          <Card className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setPage(1);
              }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium capitalize",
                filter === f ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
              )}
            >
              {f.toLowerCase()}
            </button>
          ))}
        </div>

        <Card className="mt-4 p-0 sm:p-0">
          <Table>
            <thead>
              <tr>
                <TableHead>Project</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Links</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mark</TableHead>
                <TableHead>Actions</TableHead>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const needsReview = p.status === "PENDING" || p.status === "RECHECK";
                return (
                  <tr key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      {p.student.name}
                      <span className="block text-xs text-muted-foreground">{p.student.email}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <a href={p.repoUrl} target="_blank" rel="noreferrer" className="text-primary">
                        Repo
                      </a>
                      {" / "}
                      <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-primary">
                        Live
                      </a>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-semibold">{p.mark === null ? "-" : `${p.mark} / 60`}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {needsReview ? (
                          <>
                            <Button size="sm" variant="success" onClick={() => setModal({ project: p, status: "APPROVED" })}>
                              <Check className="size-4" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setModal({ project: p, status: "REJECTED" })}>
                              <X className="size-4" /> Reject
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => setModal({ project: p })}>
                            <Pencil className="size-4" /> Edit
                          </Button>
                        )}
                        <Button size="sm" variant="outline" aria-label={`Delete ${p.name}`} onClick={() => remove(p)}>
                          <Trash2 className="size-4 text-destructive" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          {projects.length === 0 && <p className="p-6 text-center text-muted-foreground">No projects found.</p>}

          <div className="flex items-center justify-between border-t border-border p-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="size-4" /> Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next <ChevronRight className="size-4" />
            </Button>
          </div>
        </Card>
      </main>

      {modal && <ReviewModal key={modal.project.id} project={modal.project} presetStatus={modal.status} onClose={() => setModal(null)} onSaved={refresh} />}
    </>
  );
}
