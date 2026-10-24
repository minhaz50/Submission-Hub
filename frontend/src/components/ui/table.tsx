import * as React from "react";
import { cn } from "@/lib/utils";

// The wrapper makes the table scroll sideways on small screens
export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  );
}
export function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return <th className={cn("whitespace-nowrap border-b border-border px-4 py-3 text-left font-semibold text-muted-foreground", className)} {...props} />;
}
export function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("border-b border-border px-4 py-3", className)} {...props} />;
}
