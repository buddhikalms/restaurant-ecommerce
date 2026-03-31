"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";

import { RemoteImage } from "@/components/ui/remote-image";
import { cn } from "@/lib/utils";

type HeroSlide = {
  id: string;
  imageUrl: string;
  alt: string;
};

type HomeHeroSliderProps = {
  slides: HeroSlide[];
  totalProducts: number;
  pricingLabel: string;
  modeLabel: string;
};

export function HomeHeroSlider({
  slides,
  totalProducts,
  pricingLabel,
  modeLabel,
}: HomeHeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const advanceSlide = useEffectEvent(() => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
  });

  useEffect(() => {
    if (slides.length < 2) {
      return;
    }

    const intervalId = window.setInterval(() => {
      advanceSlide();
    }, 5500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [slides.length]);

  if (!slides.length) {
    return null;
  }

  const stats = [
    {
      label: "Products",
      value: `${totalProducts}+`,
    },
    {
      label: "Pricing",
      value: pricingLabel,
    },
    {
      label: "Mode",
      value: modeLabel,
    },
  ];

  return (
    <section className="relative w-full overflow-hidden rounded-[1.75rem] border border-black/10 bg-[#120b08] shadow-[0_24px_70px_rgba(18,12,8,0.18)]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(25,14,8,0.14)_0%,rgba(25,14,8,0.04)_24%,transparent_100%)]" />
      <div className="relative min-h-[420px] bg-[#120b08] sm:min-h-[470px] lg:min-h-[520px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition duration-700 ease-out",
              index === activeIndex
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-[1.02] opacity-0",
            )}
          >
            <div className="absolute inset-y-0 left-[18%] right-0 sm:left-[34%] lg:left-[42%]">
              <RemoteImage
                src={slide.imageUrl}
                alt={slide.alt}
                width={1800}
                height={1200}
                sizes="100vw"
                priority={index === 0}
                className="h-full w-full object-cover object-[78%_center] lg:object-right"
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,5,4,0.98)_0%,rgba(7,5,4,0.96)_24%,rgba(7,5,4,0.88)_40%,rgba(7,5,4,0.66)_56%,rgba(7,5,4,0.28)_74%,rgba(7,5,4,0.08)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(214,162,71,0.16),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.14),transparent_18%)]" />
          </div>
        ))}

        <div className="relative z-10 grid h-full gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(16rem,0.48fr)] lg:items-center lg:p-8">
          <div className="max-w-3xl py-2 lg:py-6">
            <div className="flex flex-wrap items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#f3d6a7]">
              <span>Wholesale marketplace</span>
              <span className="text-white/40">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </span>
            </div>

            <h1 className="mt-4 max-w-3xl font-heading text-[clamp(2.1rem,5vw,4.25rem)] font-semibold leading-[0.98] text-white">
              Clean ordering for kitchens, cafes, and restaurant buyers.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 sm:text-base">
              Browse products quickly, compare prices clearly, and keep bulk
              purchasing simple with a lighter interface built for daily use.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/products"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--brand)_0%,var(--brand-dark)_100%)] px-5 text-sm font-semibold text-[#fff8ef] shadow-[0_18px_38px_rgba(141,48,30,0.32)] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                <span className="text-white"> Browse products</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-7 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "h-[4px] rounded-full transition-all duration-300",
                      index === activeIndex
                        ? "w-14 bg-[#f2cf96]"
                        : "w-8 bg-white/28 hover:bg-white/52",
                    )}
                    aria-label={`Show slide ${index + 1}`}
                  />
                ))}
              </div>
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">
                Right-side imagery with a darker reading edge
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.06))] p-4 text-[#fff8ef] shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-sm"
              >
                <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-white/65">
                  {item.label}
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
