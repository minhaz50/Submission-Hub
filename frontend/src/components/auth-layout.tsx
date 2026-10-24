import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";

// Input style for the login / signup pages
export const authInput =
  "h-12 rounded-none border-[3px] border-foreground bg-slate-50 px-4 shadow-[3px_3px_0_0_#14192b] focus:border-primary focus:ring-0 aria-invalid:border-destructive";

type LayoutProps = {
  title: string;
  children: React.ReactNode;
  footer: React.ReactNode;
};

export function AuthLayout({ title, children, footer }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-20 items-center justify-between border-b-4 border-foreground px-4 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-3 text-xl font-extrabold"
        >
          <Image src="/logo.svg" alt="" width={36} height={36} />
          Markup
        </Link>
        <Link
          href="/"
          className="border-[3px] border-foreground bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wider shadow-[4px_4px_0_0_#14192b] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#14192b]"
        >
          Back to home
        </Link>
      </header>

      <main className="grid-paper flex flex-1 justify-center bg-white px-4 py-10 sm:py-16">
        <div className="h-fit w-full max-w-md border-[3px] border-foreground bg-white p-6 shadow-[10px_10px_0_0_#14192b] sm:p-10">
          <h1 className="text-center text-3xl font-extrabold">{title}</h1>
          <div className="mx-auto mt-3 h-1 w-16 bg-primary" />

          <div className="mt-8">{children}</div>

          <div className="mt-8 border-t-2 border-foreground pt-5 text-center text-sm font-medium">
            {footer}
          </div>
        </div>
      </main>
    </div>
  );
}

// Uppercase label + input + error message
export function AuthField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label
        htmlFor={id}
        className="text-xs font-extrabold uppercase tracking-wider"
      >
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-sm font-semibold text-destructive">{error}</p>
      )}
    </div>
  );
}
