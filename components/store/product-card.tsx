import Link from "next/link";

import { RemoteImage } from "@/components/ui/remote-image";
import { StockBadge } from "@/components/store/status-badge";
import { type PricingMode } from "@/lib/user-roles";
import { cn, formatCurrency } from "@/lib/utils";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    description: string;
    imageUrl: string;
    productType: "SIMPLE" | "VARIABLE";
    variantLabel: string | null;
    normalPrice: number;
    wholesalePrice: number;
    stockQuantity: number;
    minOrderQuantity: number;
    variants: Array<{ id: string; name: string }>;
    category: {
      name: string;
      slug: string;
    };
  };
  pricingMode: PricingMode;
  showWholesalePrice: boolean;
};

export function ProductCard({
  product,
  pricingMode,
  showWholesalePrice,
}: ProductCardProps) {
  const isVariable = product.productType === "VARIABLE";
  const optionCount = product.variants.length;
  const helperText = isVariable
    ? `Choose a ${product.variantLabel?.toLowerCase() || "product option"} on the detail page before adding this item to the cart.`
    : showWholesalePrice
      ? "Wholesale pricing is active for this session."
      : "Create a wholesale account to unlock bulk pricing for this item.";
  const detailLabel = isVariable ? "Choose options" : "View details";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[2.2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,243,230,0.92))] shadow-[0_26px_80px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_34px_100px_rgba(15,23,42,0.14)]">
      <div className="relative aspect-[5/4] overflow-hidden bg-[#e9dcc3]">
        <RemoteImage
          src={product.imageUrl}
          alt={product.name}
          width={1200}
          height={900}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-dark)] backdrop-blur-sm">
          {product.category.name}
        </div>
        <div className="absolute right-4 top-4">
          <StockBadge stockQuantity={product.stockQuantity} />
        </div>
        <div className="absolute inset-x-4 bottom-4">
          <p className="text-xs uppercase tracking-[0.16em] text-white/75">
            SKU {product.sku}
          </p>
          <h3 className="mt-2 font-heading text-2xl font-semibold text-white">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
          {isVariable ? (
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white">
              {optionCount} {product.variantLabel?.toLowerCase() || "option"}
              {optionCount === 1 ? "" : "s"} available
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">
          {product.description}
        </p>

        <div
          className={cn(
            "grid gap-3",
            showWholesalePrice ? "sm:grid-cols-3" : "sm:grid-cols-1",
          )}
        >
          <div
            className={cn(
              "rounded-[1.4rem] border p-4",
              pricingMode === "retail"
                ? "border-[var(--brand)]/20 bg-[rgba(255,248,235,0.95)]"
                : "border-slate-200 bg-white",
            )}
          >
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              {isVariable ? "Normal from" : "Normal price"}
            </p>
            <p className="mt-2 font-heading text-2xl font-semibold text-slate-900">
              {formatCurrency(product.normalPrice)}
            </p>
          </div>

          {showWholesalePrice ? (
            <>
              <div
                className={cn(
                  "rounded-[1.4rem] border p-4",
                  pricingMode === "wholesale"
                    ? "border-[var(--brand)]/20 bg-[rgba(255,248,235,0.95)]"
                    : "border-slate-200 bg-white",
                )}
              >
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  {isVariable ? "Wholesale from" : "Wholesale price"}
                </p>
                <p className="mt-2 font-heading text-2xl font-semibold text-slate-900">
                  {formatCurrency(product.wholesalePrice)}
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  {isVariable ? "MOQ from" : "Wholesale MOQ"}
                </p>
                <p className="mt-2 font-heading text-2xl font-semibold text-slate-900">
                  {product.minOrderQuantity}
                </p>
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-auto space-y-4">
          <p className="text-xs leading-5 text-slate-500">{helperText}</p>
          <div
            className={cn(
              "grid gap-3",
              !showWholesalePrice ? "sm:grid-cols-1" : "sm:grid-cols-1",
            )}
          >
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#4a2a0a] px-5 text-sm font-semibold  shadow-[0_16px_32px_rgba(74,42,10,0.24)] transition hover:bg-[#653713]"
            >
              <span className="text-white/90">View details</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
