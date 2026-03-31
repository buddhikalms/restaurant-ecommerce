import Link from "next/link";

import { ProductCardPurchaseControls } from "@/components/store/product-card-purchase-controls";
import { StockBadge } from "@/components/store/status-badge";
import { RemoteImage } from "@/components/ui/remote-image";
import { type PricingMode } from "@/lib/user-roles";

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
    vatRate: number;
    normalPrice: number;
    wholesalePrice: number;
    stockQuantity: number;
    minOrderQuantity: number;
    variants: Array<{
      id: string;
      name: string;
      sku: string;
      normalPrice: number;
      wholesalePrice: number;
      minOrderQuantity: number;
      stockQuantity: number;
    }>;
    category: {
      name: string;
      slug: string;
    };
  };
  pricingMode: PricingMode;
  showWholesalePrice: boolean;
  hideNormalPrice?: boolean;
};

export function ProductCard({
  product,
  pricingMode,
  showWholesalePrice,
}: ProductCardProps) {
  const isVariable = product.productType === "VARIABLE";
  const optionCount = product.variants.length;
  const optionLabel = product.variantLabel?.toLowerCase() || "product option";
  const helperText = isVariable
    ? showWholesalePrice
      ? `Pick a ${optionLabel} to add the right wholesale total and MOQ.`
      : `Pick a ${optionLabel} to add it straight to your cart.`
    : showWholesalePrice
      ? "Wholesale totals are active and VAT is already included."
      : "Create a wholesale account to unlock bulk pricing.";

  return (
    <article className="group flex h-full min-h-[28rem] flex-col overflow-hidden rounded-[1.6rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(250,243,230,0.94))] shadow-[0_18px_48px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_68px_rgba(15,23,42,0.12)]">
      <div className="relative aspect-[7/5] overflow-hidden bg-[#e9dcc3]">
        <RemoteImage
          src={product.imageUrl}
          alt={product.name}
          width={1200}
          height={900}
          sizes="(min-width: 1536px) 18vw, (min-width: 1280px) 22vw, (min-width: 768px) 50vw, 100vw"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/72 via-slate-950/12 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--brand-dark)] backdrop-blur-sm">
          {product.category.name}
        </div>
        <div className="absolute right-3 top-3">
          <StockBadge stockQuantity={product.stockQuantity} />
        </div>
        <div className="absolute inset-x-3 bottom-3">
          <p className="text-[11px] uppercase tracking-[0.15em] text-white/75">
            SKU {product.sku}
          </p>
          <h3 className="mt-1.5 line-clamp-2 min-h-[2.8rem] font-heading text-[1.35rem] font-semibold leading-tight text-white">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
          {isVariable ? (
            <p className="mt-1.5 text-[11px] uppercase tracking-[0.15em] text-white">
              {optionCount} {product.variantLabel?.toLowerCase() || "option"}
              {optionCount === 1 ? "" : "s"} available
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-2 min-h-[3rem] text-sm leading-6 text-slate-600">
          {product.description}
        </p>

        <div className="mt-auto space-y-2.5">
          <p className="line-clamp-2 min-h-[2.5rem] text-[13px] leading-5 text-slate-500">
            {helperText}
          </p>
          <ProductCardPurchaseControls
            product={product}
            pricingMode={pricingMode}
          />
        </div>
      </div>
    </article>
  );
}
