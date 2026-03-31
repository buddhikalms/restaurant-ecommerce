"use client";

import { ChevronDown } from "lucide-react";

type ProductDetailTabsProps = {
  description?: string | null;
  information?: string | null;
  ingredients?: string | null;
  nutritional?: string | null;
  faq?: string | null;
};

function normalizeContent(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function ProductDetailTabs({
  description,
  information,
  ingredients,
  nutritional,
  faq,
}: ProductDetailTabsProps) {
  const sections = [
    { id: "description", label: "Description", content: normalizeContent(description || information) },
    { id: "ingredients", label: "Ingredients", content: normalizeContent(ingredients) },
    { id: "details", label: "Details", content: normalizeContent(nutritional || information) },
    { id: "faq", label: "FAQ", content: normalizeContent(faq) },
  ];

  return (
    <section className="surface-card rounded-xl p-4 sm:p-5">
      <p className="section-label">Product information</p>
      <div className="mt-3 space-y-2">
        {sections.map((section, index) => (
          <details
            key={section.id}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)]"
            open={index === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-[var(--foreground)]">
              <span>{section.label}</span>
              <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
            </summary>
            <div className="border-t border-[var(--border)] px-4 py-3">
              <p className="whitespace-pre-line text-[0.84rem] leading-6 text-[var(--muted-foreground)]">
                {section.content || `No ${section.label.toLowerCase()} available yet.`}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
