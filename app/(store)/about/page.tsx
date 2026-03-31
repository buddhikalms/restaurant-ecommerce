import { existsSync } from "node:fs";
import { join } from "node:path";

import { Boxes, Handshake, ShieldCheck, Truck } from "lucide-react";

import { RemoteImage } from "@/components/ui/remote-image";

function resolveAboutImage(fileName: string, fallbackSrc: string) {
  const imagePath = join(process.cwd(), "public", fileName);

  return existsSync(imagePath) ? `/${fileName}` : fallbackSrc;
}

const values = [
  {
    icon: ShieldCheck,
    title: "Reliable supply",
    copy: "Clear product information and practical ordering for repeat purchasing.",
  },
  {
    icon: Boxes,
    title: "Built for volume",
    copy: "Compact browsing that works for both quick top-ups and large trade orders.",
  },
  {
    icon: Truck,
    title: "Delivery focused",
    copy: "Designed around prep schedules, kitchen timing, and real operating needs.",
  },
  {
    icon: Handshake,
    title: "Long-term service",
    copy: "A simple platform that supports regular buyers instead of slowing them down.",
  },
];

export default function AboutPage() {
  const storyImage = resolveAboutImage("cheff2.jpg", "/cheff2.jpg");
  const teamImage = resolveAboutImage("A6.webp", "/cheff.jpg");

  return (
    <div className="page-shell py-6 sm:py-8">
      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="surface-card rounded-lg p-5">
          <p className="section-label">About</p>
          <h1 className="section-title mt-2">A cleaner wholesale buying experience for food businesses</h1>
          <p className="section-copy mt-3 max-w-2xl">
            The storefront is built to help kitchens, cafes, and hospitality buyers find the right products fast, compare pricing clearly, and reorder with less friction.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <div key={value.title} className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <Icon className="h-4 w-4 text-[var(--brand-dark)]" />
                  <h2 className="mt-2 text-sm font-semibold text-[var(--foreground)]">{value.title}</h2>
                  <p className="mt-1 text-[0.82rem] leading-6 text-[var(--muted-foreground)]">{value.copy}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <RemoteImage
            src={storyImage}
            alt="About CeylonTaste"
            width={1400}
            height={920}
            sizes="(min-width: 1024px) 36vw, 100vw"
            className="h-full min-h-[260px] w-full object-cover"
          />
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <RemoteImage
            src={teamImage}
            alt="CeylonTaste team and service values"
            width={1200}
            height={920}
            sizes="(min-width: 1024px) 34vw, 100vw"
            className="h-full min-h-[240px] w-full object-cover"
          />
        </div>
        <div className="surface-card rounded-lg p-5">
          <p className="section-label">Our approach</p>
          <h2 className="section-subtitle mt-2">Food supply should feel organized, not overwhelming</h2>
          <p className="section-copy mt-3">
            We&apos;ve shifted the experience away from oversized sections and decorative clutter so buyers can focus on product imagery, price clarity, and quick decisions.
          </p>
          <p className="section-copy mt-3">
            That same thinking carries across product browsing, account management, and wholesale registration so the experience stays consistent from first visit to repeat order.
          </p>
        </div>
      </section>
    </div>
  );
}
