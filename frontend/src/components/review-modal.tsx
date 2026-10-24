"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { reviewSchema, type ReviewValues } from "@/lib/schemas";
import type { Project } from "@/lib/types";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";

type Props = {
  project: Project;
  presetStatus?: "APPROVED" | "REJECTED"; // set when the mentor clicks Approve or Reject
  onClose: () => void;
  onSaved: () => void;
};

// One form for approve, reject and edit: decision + mark out of 60 + feedback
export function ReviewModal({ project, presetStatus, onClose, onSaved }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      status: presetStatus ?? (project.status === "REJECTED" ? "REJECTED" : "APPROVED"),
      mark: project.mark ?? undefined,
      feedback: project.feedback ?? "",
    },
  });

  async function onSubmit(values: ReviewValues) {
    try {
      await api(`/projects/${project.id}`, { method: "PATCH", body: values });
      toast.success("Review saved");
      onSaved();
      onClose();
    } catch (e) {
      toast.error((e as ApiError).message);
    }
  }

  return (
    <Modal title={project.name} onClose={onClose}>
      <p className="mb-4 text-sm text-muted-foreground">
        by {project.student.name} - {project.description}
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <Field id="status" label="Decision" error={errors.status?.message}>
          <select id="status" className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm" {...register("status")}>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </Field>
        <Field id="mark" label="Mark (0 to 60)" error={errors.mark?.message}>
          <Input id="mark" type="number" min={0} max={60} {...register("mark", { valueAsNumber: true })} />
        </Field>
        <Field id="feedback" label="Feedback (optional)" error={errors.feedback?.message}>
          <Textarea id="feedback" placeholder="What was good? What should be improved?" {...register("feedback")} />
        </Field>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Saving..." : "Save review"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
