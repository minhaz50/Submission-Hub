"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "./types";

export const homeFor = (user: User) => (user.role === "ADMIN" ? "/dashboard" : "/submit");

export function saveSession(token: string, user: User) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUser(): User | null {
  const raw = localStorage.getItem("user");
  return raw ? (JSON.parse(raw) as User) : null;
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Protects a page: sends logged-out users to /login and wrong-role users to their own page
export function useRequireRole(role: User["role"]) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const current = getUser();
    if (!current) router.replace("/login");
    else if (current.role !== role) router.replace(homeFor(current));
    else setUser(current);
  }, [role, router]);

  return user;
}
