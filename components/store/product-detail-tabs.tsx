"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type TabId = "information" | "ingredients" | "nutritional" | "faq";

type ProductDetailTabsProps = {
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
  information,
  ingredients,
  nutritional,
  faq
}: ProductDetailTabsProps) {
  const tabs: Array<{ id: TabId; label: string; content: string | null }> = [
    { id: "information", label: "Information", content: normalizeContent(information) },
    { id: "ingredients", label: "Ingredients", content: normalizeContent(ingredients) },
    { id: "nutritional", label: "Nutritional", content: normalizeContent(nutritional) },
    { id: "faq", label: "FAQ", content: normalizeContent(faq) }
  ];

  const defaultTabId = tabs.find((tab) => tab.content)?.id ?? "information";
  const [activeTabId, setActiveTabId] = useState<TabId>(defaultTabId);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const paragraphs = activeTab.content
    ? activeTab.content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean)
    : [];

  return (
    <section className="surface-card rounded-[2.5rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Product details</p>
          <h2 className="mt-3 font-heading text-3xl font-semibold text-slate-900">Everything buyers need before ordering</h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Browse the product information, ingredients, nutritional notes, and FAQs added by the store team.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTabId(tab.id)}
            className={cn(
              "rounded-full border px-5 py-3 text-sm font-semibold transition",
              activeTab.id === tab.id
                ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-[0_12px_32px_rgba(155,95,25,0.22)]"
                : "border-slate-200 bg-white text-slate-700 hover:border-[var(--brand)]/40 hover:bg-[#fff7eb]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-[2rem] border border-[var(--brand)]/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,248,238,0.92))] p-6 lg:p-7">
        <h3 className="font-heading text-2xl font-semibold text-slate-900">{activeTab.label}</h3>

        {paragraphs.length ? (
          <div className="mt-4 space-y-4">
            {paragraphs.map((paragraph, index) => (
              <p key={`${activeTab.id}-${index}`} className="whitespace-pre-line text-sm leading-7 text-slate-600">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm leading-7 text-slate-500">
            No {activeTab.label.toLowerCase()} has been added for this product yet.
          </p>
        )}
      </div>
    </section>
  );
}