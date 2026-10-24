"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useRequireRole } from "@/lib/auth";
import { projectSchema, type ProjectValues } from "@/lib/schemas";
import type { Project } from "@/lib/types";
import { Field } from "@/components/field";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";

export default function SubmitPage() {
  const user = useRequireRole("STUDENT");
  const [projects, setProjects] = useState<Project[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProjectValues>({ resolver: zodResolver(projectSchema) });

  useEffect(() => {
    if (user) api<{ projects: Project[] }>("/projects/mine").then((r) => setProjects(r.projects));
  }, [user]);

  async function onSubmit(values: ProjectValues) {
    try {
      const { project } = await api<{ project: Project }>("/projects", { method: "POST", body: values });
      setProjects((list) => [project, ...list]);
      reset();
      toast.success("Project submitted");
    } catch (e) {
      const err = e as ApiError;
      // Show server errors (like duplicate repo) under the right field
      const fields = ["name", "repoUrl", "liveUrl", "description"] as const;
      const field = fields.find((f) => err.errors?.[f]);
      if (field) setError(field, { message: err.errors![field][0] });
      else toast.error(err.message);
    }
  }

  // Student asks the mentor to look at an approved/rejected project again
  async function recheck(p: Project) {
    if (!window.confirm(`Ask a mentor to recheck "${p.name}"?`)) return;
    try {
      const { project } = await api<{ project: Project }>(`/projects/${p.id}/recheck`, { method: "PATCH" });
      setProjects((list) => list.map((item) => (item.id === project.id ? project : item)));
      toast.success("Recheck requested");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  if (!user) return null;

  return (
    <>
      <Navbar user={user} />
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2">
        <section>
          <h1 className="text-3xl font-bold">Submit a project</h1>
          <Card className="mt-5">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              <Field id="name" label="Project name" error={errors.name?.message}>
                <Input id="name" {...register("name")} />
              </Field>
              <Field id="repoUrl" label="GitHub repo URL" error={errors.repoUrl?.message}>
                <Input id="repoUrl" placeholder="https://github.com/you/project" {...register("repoUrl")} />
              </Field>
              <Field id="liveUrl" label="Live link" error={errors.liveUrl?.message}>
                <Input id="liveUrl" placeholder="https://my-project.vercel.app" {...register("liveUrl")} />
              </Field>
              <Field id="description" label="Description" error={errors.description?.message}>
                <Textarea id="description" {...register("description")} />
              </Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit project"}
              </Button>
            </form>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Your submissions</h2>
          <div className="mt-5 grid gap-3">
            {projects.length === 0 && <p className="text-muted-foreground">Nothing submitted yet.</p>}
            {projects.map((p) => (
              <Card key={p.id} className="grid gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{p.name}</p>
                    <a href={p.repoUrl} target="_blank" rel="noreferrer" className="block truncate text-sm text-primary">
                      {p.repoUrl}
                    </a>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                {p.mark !== null && (
                  <p className="text-sm">
                    <span className="font-semibold">Mark:</span> {p.mark} / 60
                  </p>
                )}
                {p.feedback && (
                  <p className="rounded-md bg-muted px-3 py-2 text-sm">
                    <span className="font-semibold">Mentor feedback: </span>
                    {p.feedback}
                  </p>
                )}
                {(p.status === "APPROVED" || p.status === "REJECTED") && (
                  <Button variant="outline" size="sm" className="w-fit" onClick={() => recheck(p)}>
                    <RotateCcw className="size-4" /> Request recheck
                  </Button>
                )}
                {p.status === "RECHECK" && <p className="text-sm text-muted-foreground">Recheck requested. A mentor will look at it again.</p>}
              </Card>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
