import { cn } from "@/lib/utils";
import type { Status } from "@/lib/types";

const styles: Record<Status, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  RECHECK: "bg-indigo-100 text-indigo-800",
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", styles[status])}>{status.toLowerCase()}</span>;
}
