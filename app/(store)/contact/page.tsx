import { companyDetails } from "@/lib/company-details";
import { ContactForm } from "@/components/forms/contact-form";

export default function ContactPage() {
  return (
    <div className="page-shell py-6 sm:py-8">
      <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
        <section className="paper-panel rounded-lg p-5">
          <p className="section-label">Contact</p>
          <h1 className="section-title mt-2">Talk to the team</h1>
          <p className="section-copy mt-3 max-w-md">
            Use this page for product questions, delivery support, wholesale setup, or help choosing the right items for your kitchen.
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="section-label">Email</p>
              <a href={`mailto:${companyDetails.email}`} className="mt-2 inline-flex text-sm font-medium text-[var(--brand-dark)] transition hover:text-[var(--brand)]">
                {companyDetails.email}
              </a>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="section-label">Address</p>
              <div className="mt-2 text-[0.82rem] leading-6 text-[var(--muted-foreground)]">
                {companyDetails.addressLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--surface)] p-4">
              <p className="section-label">Phone</p>
              <p className="mt-2 text-[0.82rem] leading-6 text-[var(--muted-foreground)]">
                Phone support details will be added soon.
              </p>
            </div>
          </div>
        </section>

        <section className="surface-card rounded-lg p-5">
          <p className="section-label">Send a message</p>
          <h2 className="section-subtitle mt-2">We&apos;ll reply as soon as we can</h2>
          <p className="section-copy mt-3 max-w-2xl">
            Keep the message brief and we&apos;ll route it to the right person quickly.
          </p>
          <div className="mt-4">
            <ContactForm />
          </div>
        </section>
      </div>
    </div>
  );
}
