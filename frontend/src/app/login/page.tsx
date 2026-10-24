"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { homeFor, saveSession } from "@/lib/auth";
import { loginSchema, type LoginValues } from "@/lib/schemas";
import type { User } from "@/lib/types";
import { AuthField, AuthLayout, authInput } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    try {
      const { token, user } = await api<{ token: string; user: User }>(
        "/auth/login",
        { method: "POST", body: values },
      );
      saveSession(token, user);
      router.replace(homeFor(user));
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <AuthLayout
      title="Login"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-extrabold uppercase tracking-wider text-primary"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
        <AuthField id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            className={authInput}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </AuthField>
        <AuthField
          id="password"
          label="Password"
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            placeholder="Password"
            className={authInput}
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </AuthField>
        <Button
          type="submit"
          variant="brutal"
          size="lg"
          className="mt-2 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
