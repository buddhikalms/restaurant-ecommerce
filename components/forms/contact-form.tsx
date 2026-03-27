"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactFormAction } from "@/lib/actions/contact-actions";
import { contactSchema } from "@/lib/validations/contact";

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    }
  });

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((values) => {
        setMessage(null);
        setIsSuccess(false);

        startTransition(async () => {
          const result = await submitContactFormAction(values);

          if (!result.success) {
            setMessage(result.error);
            return;
          }

          reset();
          setIsSuccess(true);
          setMessage(result.message ?? "Message sent successfully.");
        });
      })}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
          <Input {...register("name")} placeholder="Your name" />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
          <Input type="email" {...register("email")} placeholder="you@example.com" />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
          <Input {...register("phone")} placeholder="Optional" />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Subject</label>
          <Input {...register("subject")} placeholder="How can we help?" />
          <FieldError message={errors.subject?.message} />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">Message</label>
          <Textarea {...register("message")} placeholder="Tell us what you need." className="min-h-40" />
          <FieldError message={errors.message?.message} />
        </div>
      </div>

      {message ? (
        <p className={isSuccess ? "rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700" : "rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700"}>
          {message}
        </p>
      ) : null}

      <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
        {isPending ? "Sending message..." : "Send message"}
      </Button>
    </form>
  );
}