"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";

import { RemoteImage } from "@/components/ui/remote-image";
import { cn } from "@/lib/utils";

type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  highlights: string[];
  primaryAction: {
    href: string;
    label: string;
  };
  secondaryAction: {
    href: string;
    label: string;
  };
};

export function HomeHeroSlider({ slides }: { slides: HeroSlide[] }) {
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
  }, [advanceSlide, slides.length]);

  if (!slides.length) {
    return null;
  }

  const activeSlide = slides[activeIndex];

  return (
    <section className="w-full">
      <div className="relative h-[560px] overflow-hidden bg-[#140f0b] text-white md:h-[600px] lg:h-[640px]">
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
            <RemoteImage
              src={slide.imageUrl}
              alt={slide.title}
              width={1800}
              height={1000}
              sizes="100vw"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,10,8,0.94)_0%,rgba(13,10,8,0.88)_26%,rgba(13,10,8,0.62)_46%,rgba(13,10,8,0.22)_68%,rgba(13,10,8,0.34)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,198,122,0.18),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(155,95,25,0.22),transparent_28%)]" />
          </div>
        ))}

        <div className="relative z-10 flex h-[560px] flex-col justify-between px-5 py-8 sm:px-8 sm:py-10 md:h-[600px] lg:h-[640px] lg:px-12 lg:py-12">
          <div className="max-w-[44rem]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f1c87c]">
                Featured Banner
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-white/55">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(slides.length).padStart(2, "0")}
              </span>
            </div>

            <p className="mt-10 text-sm font-semibold uppercase tracking-[0.22em] text-[#f0c67a]">
              {activeSlide.eyebrow}
            </p>
            <h1 className="mt-4 max-w-[42rem] font-heading text-4xl font-semibold leading-tight sm:text-5xl lg:text-[4rem] lg:leading-[1.02]">
              {activeSlide.title}
            </h1>
            <p className="mt-5 max-w-[38rem] text-base leading-8 text-[#ebdcc4] sm:text-lg">
              {activeSlide.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {activeSlide.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full border border-[#f0c67a]/45 bg-white/10 px-4 py-2 text-sm font-medium text-[#fff4df] shadow-[0_10px_24px_rgba(15,10,8,0.18)] backdrop-blur-sm"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-10 flex max-w-[44rem] flex-col gap-6">
            <div className="flex flex-wrap gap-3">
              <Link
                href={activeSlide.primaryAction.href}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#4a2a0a] px-6 text-sm font-semibold text-[#fff4df] shadow-[0_18px_38px_rgba(74,42,10,0.28)] transition hover:bg-[#653713]"
              >
                {activeSlide.primaryAction.label}
              </Link>
              <Link
                href={activeSlide.secondaryAction.href}
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#f4d39b]/70 bg-[#fff4df] px-6 text-sm font-semibold text-[#5a3109] shadow-[0_16px_34px_rgba(255,244,223,0.18)] transition hover:bg-white"
              >
                {activeSlide.secondaryAction.label}
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-[3px] rounded-full transition-all duration-300",
                    index === activeIndex
                      ? "w-14 bg-[#f0c67a]"
                      : "w-7 bg-white/30 hover:bg-white/55",
                  )}
                  aria-label={`Show slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="text-sm text-white/65">
              <p className="uppercase tracking-[0.18em] text-[#f0c67a]">
                Restaurant-first service
              </p>
              <p className="mt-2 max-w-xl text-white/80">
                Clear navigation, visible actions, and fast access to the
                products and company story your customers need.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
