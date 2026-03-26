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
  const storyImage = resolveAboutImage("A5.webp", "/A3.webp");
  const teamImage = resolveAboutImage("A6.webp", "/A4.webp");
  const isUsingFallbackImages =
    storyImage !== "/A5.webp" || teamImage !== "/A6.webp";

  return (
    <div className="pb-20">
      <section className="page-shell pt-12">
        <div className="grid overflow-hidden rounded-[2.75rem] border border-white/70 bg-[linear-gradient(135deg,rgba(92,51,9,0.98),rgba(38,24,10,0.96))] shadow-[0_28px_90px_rgba(48,24,6,0.24)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f7cf88]">
              About us
            </p>
            <h1 className="mt-4 max-w-[34rem] font-heading text-4xl font-semibold leading-tight text-white sm:text-5xl">
              We help kitchens stay stocked, move faster, and order with more
              confidence.
            </h1>
            <p className="mt-6 max-w-[36rem] text-base leading-8 text-[#f2e5d1] sm:text-lg">
              Harvest Wholesale was built for busy restaurant teams, cafes,
              caterers, and households that want dependable access to everyday
              essentials. We focus on practical supply choices, clearer buying
              paths, and a storefront experience that feels modern from the
              first click.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#4a2a0a] px-6 text-sm font-semibold text-[#fff4df] shadow-[0_18px_38px_rgba(74,42,10,0.28)] transition hover:bg-[#653713]"
              >
                Browse products
              </Link>
              <Link
                href="/checkout"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#eed3aa] bg-[#fff4df] px-6 text-sm font-semibold text-[#5a3109] shadow-[0_16px_34px_rgba(255,244,223,0.16)] transition hover:bg-white"
              >
                Start an order
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                <p className="font-heading text-3xl font-semibold text-white">
                  Retail + bulk
                </p>
                <p className="mt-2 text-sm leading-6 text-[#ead8bc]">
                  Flexible browsing for everyday shoppers and wholesale buyers.
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                <p className="font-heading text-3xl font-semibold text-white">
                  Clear pricing
                </p>
                <p className="mt-2 text-sm leading-6 text-[#ead8bc]">
                  Structured access that keeps standard and wholesale journeys
                  easy to follow.
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                <p className="font-heading text-3xl font-semibold text-white">
                  Faster decisions
                </p>
                <p className="mt-2 text-sm leading-6 text-[#ead8bc]">
                  Stronger visuals and more visible actions across the
                  storefront.
                </p>
              </div>
            </div>

            {isUsingFallbackImages ? (
              <p className="mt-6 text-sm leading-6 text-[#f7e6c7]">
                A5.webp and A6.webp are not in the public folder yet, so this
                page is temporarily using existing storefront images as a
                fallback until those two files are added.
              </p>
            ) : null}
          </div>

          <div className="relative min-h-[320px] lg:min-h-full">
            <RemoteImage
              src={storyImage}
              alt="About Harvest Wholesale"
              width={1200}
              height={980}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,14,7,0.06)_0%,rgba(22,14,7,0.22)_55%,rgba(22,14,7,0.48)_100%)]" />
          </div>
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
              alt="Harvest Wholesale team and service values"
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
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#5b330c] px-6 text-sm font-semibold text-[#fff4df] shadow-[0_18px_34px_rgba(91,51,12,0.24)] transition hover:bg-[#704011]"
              >
                View all products
              </Link>
              <Link
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--brand)]/25 bg-[rgba(255,248,230,0.92)] px-6 text-sm font-semibold text-[var(--brand-dark)] transition hover:border-[var(--brand)]/45 hover:bg-white"
              >
                Back to homepage
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
