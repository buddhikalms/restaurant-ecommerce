import { ContactForm } from "@/components/forms/contact-form";

export default function ContactPage() {
  return (
    <div className="page-shell py-12">
      <div className="mx-auto max-w-4xl surface-card rounded-[2.5rem] border border-white/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
          Contact us
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">
          Send us a message
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
          Questions about products, orders, delivery, or wholesale registration can all come through here.
        </p>
        <div className="mt-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}