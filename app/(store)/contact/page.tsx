import { ContactForm } from "@/components/forms/contact-form";

export default function ContactPage() {
  return (
    <div className="page-shell py-12">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card rounded-[2.5rem] border border-white/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            Contact us
          </p>
          <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">
            Get in touch with CeylonTaste
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Questions about products, orders, delivery, or wholesale registration can all come through here.
          </p>

          <div className="mt-8 space-y-5">
            <div className="rounded-[1.7rem] border border-slate-200 bg-[rgba(255,250,242,0.72)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Email
              </p>
              <a
                href="mailto:info@ceylontaste.co.uk"
                className="mt-2 inline-flex text-base font-semibold text-[var(--brand-dark)] transition hover:text-[var(--brand)]"
              >
                info@ceylontaste.co.uk
              </a>
            </div>

            <div className="rounded-[1.7rem] border border-slate-200 bg-[rgba(255,250,242,0.72)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Company address
              </p>
              <div className="mt-2 space-y-1 text-sm leading-6 text-slate-700">
                <p>Apartment 32</p>
                <p>3 Denman Place</p>
                <p>Brighton</p>
                <p>BN1 9BZ</p>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-dashed border-slate-300 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Contact number
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Phone number will be added soon.
              </p>
            </div>
          </div>
        </div>

        <div className="surface-card rounded-[2.5rem] border border-white/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            Send a message
          </p>
          <h2 className="mt-3 font-heading text-3xl font-semibold text-slate-900">
            We’ll get back to you
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            Use the form below and we’ll reply as soon as possible.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
