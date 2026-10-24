"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { clearSession } from "@/lib/auth";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function Navbar({ user }: { user: User }) {
  const router = useRouter();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Image src="/logo.svg" alt="" width={28} height={28} />
          Markup
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:block">
            {user.name} ({user.role === "ADMIN" ? "Mentor" : "Student"})
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearSession();
              router.replace("/login");
            }}
          >
            <LogOut className="size-4" /> Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
