"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { registerCustomerAction, registerWholesaleCustomerAction } from "@/lib/actions/auth-actions";
import { customerRegisterSchema, wholesaleRegisterSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";

type RegisterValues = {
  name: string;
  businessName?: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export function RegisterForm({ mode = "customer" }: { mode?: "customer" | "wholesale" }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const schema = useMemo(
    () => (mode === "wholesale" ? wholesaleRegisterSchema : customerRegisterSchema),
    [mode]
  );
  const dashboardPath = mode === "wholesale" ? "/wholesale/account" : "/account";
  const action = mode === "wholesale" ? registerWholesaleCustomerAction : registerCustomerAction;
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      businessName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: ""
    }
  });

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((values) => {
        setMessage(null);
        startTransition(async () => {
          const result = await action(values);

          if (!result.success) {
            setMessage(result.error);
            return;
          }

          if (!result.data) {
            setMessage("Account created but sign-in details were not returned.");
            return;
          }

          await signIn("credentials", {
            email: result.data.email,
            password: result.data.password,
            redirect: false
          });

          router.push(dashboardPath);
          router.refresh();
        });
      })}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
          <Input placeholder="Elena Rivera" {...register("name")} />
          <FieldError message={errors.name?.message} />
        </div>
        {mode === "wholesale" ? (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Business name</label>
            <Input placeholder="Sunset Bistro" {...register("businessName")} />
            <FieldError message={errors.businessName?.message} />
          </div>
        ) : null}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
          <Input type="email" placeholder="buyer@restaurant.com" {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
          <Input placeholder="+1 555 0102" {...register("phone")} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
          <Input type="password" placeholder="Minimum 8 characters" {...register("password")} />
          <FieldError message={errors.password?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label>
          <Input type="password" placeholder="Re-enter your password" {...register("confirmPassword")} />
          <FieldError message={errors.confirmPassword?.message} />
        </div>
      </div>
      {message ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</p> : null}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? mode === "wholesale"
            ? "Creating wholesale account..."
            : "Creating account..."
          : mode === "wholesale"
            ? "Create wholesale account"
            : "Create customer account"}
      </Button>
    </form>
  );
}

