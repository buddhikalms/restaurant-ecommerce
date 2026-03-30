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
  }, [slides.length]);

  if (!slides.length) {
    return null;
  }

  const activeSlide = slides[activeIndex];

  return (
    <section className="w-full">
      <div className="overflow-hidden bg-[#140f0b] text-white">
        <div className="relative h-[460px] pt-28 sm:h-[500px] sm:pt-32 lg:h-[540px] lg:pt-36">
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
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,10,8,0.94)_0%,rgba(13,10,8,0.84)_28%,rgba(13,10,8,0.56)_52%,rgba(13,10,8,0.3)_72%,rgba(13,10,8,0.42)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,198,122,0.18),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(155,95,25,0.22),transparent_28%)]" />
            </div>
          ))}

          <div className="relative z-10 flex h-full items-end">
            <div className="page-shell flex h-full w-full items-end pb-6 pt-8 sm:pb-8 sm:pt-10 lg:pb-10 lg:pt-12">
              <div className="flex min-h-[300px] w-full max-w-[38rem] flex-col rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(19,15,11,0.76),rgba(19,15,11,0.58))] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-md sm:min-h-[320px] sm:p-6 lg:min-h-[340px] lg:p-7">
                <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.18em] sm:text-[11px]">
                  <span className="font-semibold text-[#f0c67a]">
                    {activeSlide.eyebrow}
                  </span>
                  <span className="text-white/45">
                    {String(activeIndex + 1).padStart(2, "0")} /{" "}
                    {String(slides.length).padStart(2, "0")}
                  </span>
                </div>

                <h1 className="mt-3 max-w-[30rem] font-heading text-[clamp(1.9rem,4vw,3.25rem)] font-semibold leading-[1.08]">
                  {activeSlide.title}
                </h1>
                <p className="mt-3 max-w-[31rem] text-xs leading-6 text-[#f1e4cf] sm:text-sm sm:leading-7">
                  {activeSlide.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {activeSlide.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="rounded-full border border-[#f0c67a]/45 bg-white/10 px-3 py-1.5 text-xs font-medium text-[#fff4df] shadow-[0_10px_24px_rgba(15,10,8,0.18)] backdrop-blur-sm"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href={activeSlide.primaryAction.href}
                    className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--brand-dark)] px-5 text-sm font-semibold text-[#fff4df] shadow-[0_18px_38px_rgba(74,42,10,0.28)] transition hover:bg-[#653713]"
                  >
                    {activeSlide.primaryAction.label}
                  </Link>
                </div>

                <div className="mt-auto flex flex-col gap-4 border-t border-white/12 pt-4 sm:flex-row sm:items-center sm:justify-between">
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
                  <p className="text-xs leading-5 text-white/72 sm:text-sm sm:leading-6">
                    Retail and wholesale ordering with clearer product paths.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
