"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validations/auth";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ callbackUrl = "/account" }: { callbackUrl?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((values) => {
        setMessage(null);
        startTransition(async () => {
          const result = await signIn("credentials", {
            ...values,
            redirect: false,
            callbackUrl
          });

          if (result?.error) {
            setMessage("Incorrect email or password.");
            return;
          }

          router.push(result?.url || callbackUrl);
          router.refresh();
        });
      })}
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
        <Input type="email" placeholder="buyer@restaurant.com" {...register("email")} />
        <FieldError message={errors.email?.message} />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
        <Input type="password" placeholder="Enter your password" {...register("password")} />
        <FieldError message={errors.password?.message} />
      </div>
      {message ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p> : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
