import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-border bg-card hover:bg-muted",
        success: "bg-success text-white hover:bg-success/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",

        // Bold button with a hard offset shadow (like "GET STARTED")
        brutal:
          "rounded-none bg-primary font-extrabold uppercase tracking-wider text-white shadow-[6px_6px_0_0_#14192b] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#14192b] active:translate-x-1 active:translate-y-1 active:shadow-none",

        // Same style, for use on the indigo background
        brutalLight:
          "rounded-none bg-white font-extrabold uppercase tracking-wider text-primary shadow-[6px_6px_0_0_#14192b] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_#14192b] active:translate-x-1 active:translate-y-1 active:shadow-none",
      },
      size: { default: "h-10 px-4", sm: "h-8 px-3", lg: "h-12 px-7 text-base" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type Props = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: Props) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
