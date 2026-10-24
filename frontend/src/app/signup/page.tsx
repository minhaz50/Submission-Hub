"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { homeFor, saveSession } from "@/lib/auth";
import { signupSchema, type SignupValues } from "@/lib/schemas";
import type { User } from "@/lib/types";
import { AuthField, AuthLayout, authInput } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit({ name, email, password }: SignupValues) {
    try {
      const { token, user } = await api<{ token: string; user: User }>(
        "/auth/signup",
        { method: "POST", body: { name, email, password } },
      );
      saveSession(token, user);
      router.replace(homeFor(user));
    } catch (e) {
      const err = e as ApiError;
      if (err.errors?.email)
        setError("email", { message: err.errors.email[0] });
      else toast.error(err.message);
    }
  }

  return (
    <AuthLayout
      title="Registration"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-extrabold uppercase tracking-wider text-primary"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
        <AuthField id="name" label="Name" error={errors.name?.message}>
          <Input
            id="name"
            placeholder="Name"
            className={authInput}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </AuthField>
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
        <AuthField
          id="confirm"
          label="Confirm password"
          error={errors.confirm?.message}
        >
          <Input
            id="confirm"
            type="password"
            placeholder="Confirm Password"
            className={authInput}
            aria-invalid={!!errors.confirm}
            {...register("confirm")}
          />
        </AuthField>
        <Button
          type="submit"
          variant="brutal"
          size="lg"
          className="mt-2 w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
