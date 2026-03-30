import { existsSync } from "node:fs";
import { join } from "node:path";

import Link from "next/link";
import { Boxes, Handshake, ShieldCheck, Truck } from "lucide-react";

import { RemoteImage } from "@/components/ui/remote-image";

function resolveAboutImage(fileName: string, fallbackSrc: string) {
  const imagePath = join(process.cwd(), "public", fileName);

  return existsSync(imagePath) ? `/${fileName}` : fallbackSrc;
}

export default function AboutPage() {
  const storyImage = resolveAboutImage("cheff2.jpg", "/cheff2.jpg");
  const teamImage = resolveAboutImage("A6.webp", "/cheff.jpg");

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden">
        <RemoteImage
          src={storyImage}
          alt="About CeylonTaste"
          width={1800}
          height={920}
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,14,7,0.48)_0%,rgba(22,14,7,0.58)_45%,rgba(22,14,7,0.72)_100%)]" />
        <div className="relative page-shell flex min-h-[320px] items-center justify-center py-20 text-center sm:min-h-[360px] lg:min-h-[420px]">
          <h1 className="font-heading text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
            About Us
          </h1>
        </div>
      </section>

      <section className="page-shell mt-16">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_20px_56px_rgba(15,23,42,0.08)]">
            <ShieldCheck className="h-8 w-8 text-[var(--brand)]" />
            <h2 className="mt-5 font-heading text-2xl font-semibold text-slate-900">
              Reliable supply flow
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              We organize products so customers can find the essentials they
              need without a slow or confusing browse experience.
            </p>
          </div>
          <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_20px_56px_rgba(15,23,42,0.08)]">
            <Boxes className="h-8 w-8 text-[var(--brand)]" />
            <h2 className="mt-5 font-heading text-2xl font-semibold text-slate-900">
              Built for volume
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              From small weekly top-ups to bulk orders, the storefront is shaped
              around practical purchasing and repeat buying.
            </p>
          </div>
          <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_20px_56px_rgba(15,23,42,0.08)]">
            <Truck className="h-8 w-8 text-[var(--brand)]" />
            <h2 className="mt-5 font-heading text-2xl font-semibold text-slate-900">
              Service-minded delivery
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              We think in terms of kitchens, prep windows, and real operating
              pressure, not just product listings on a screen.
            </p>
          </div>
          <div className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_20px_56px_rgba(15,23,42,0.08)]">
            <Handshake className="h-8 w-8 text-[var(--brand)]" />
            <h2 className="mt-5 font-heading text-2xl font-semibold text-slate-900">
              Long-term partnerships
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The goal is to earn trust with clear information, smooth ordering,
              and a buying experience teams want to come back to.
            </p>
          </div>
        </div>
      </section>

      <section className="page-shell mt-16">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div className="overflow-hidden rounded-[2.5rem] border border-white/70 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.09)]">
            <RemoteImage
              src={teamImage}
              alt="CeylonTaste team and service values"
              width={1200}
              height={920}
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="surface-card rounded-[2.5rem] border border-white/70 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.09)] lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Our approach
            </p>
            <h2 className="mt-4 font-heading text-3xl font-semibold text-slate-900 sm:text-4xl">
              A warmer brand story with clearer routes into the catalog
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">
              This About Us page gives visitors more context before they buy. It
              complements the new homepage slider by turning the storefront into
              more than a product grid. Customers can now understand the service
              promise, the intended audience, and the thinking behind the
              experience.
            </p>
            <p className="mt-5 text-base leading-8 text-slate-600">
              We also made the main action buttons much easier to notice by
              shifting them to high-contrast branded fills instead of relying on
              light overlays alone. That keeps the text readable even when the
              background photography is busy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3"></div>
          </div>
        </div>
      </section>
    </div>
  );
}
