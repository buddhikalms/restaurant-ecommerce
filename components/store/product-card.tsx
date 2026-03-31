import Link from "next/link";
import { Star } from "lucide-react";

import { ProductCardPurchaseControls } from "@/components/store/product-card-purchase-controls";
import { StockBadge } from "@/components/store/status-badge";
import { RemoteImage } from "@/components/ui/remote-image";
import { type PricingMode } from "@/lib/user-roles";
import { formatCurrency } from "@/lib/utils";

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
}: ProductCardProps) {
  const activePrice =
    pricingMode === "wholesale" ? product.wholesalePrice : product.normalPrice;

  return (
    <article className="surface-card flex h-full flex-col overflow-hidden rounded-lg">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-muted)]">
          <RemoteImage
            src={product.imageUrl}
            alt={product.name}
            width={800}
            height={600}
            sizes="(min-width: 1280px) 18vw, (min-width: 768px) 30vw, 100vw"
            className="h-full w-full object-cover"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[0.72rem] text-[var(--muted-foreground)]">{product.category.name}</p>
            <Link href={`/products/${product.slug}`}>
              <h3 className="mt-0.5 line-clamp-2 text-[0.96rem] font-semibold leading-5 text-[var(--foreground)]">
                {product.name}
              </h3>
            </Link>
          </div>
          <StockBadge stockQuantity={product.stockQuantity} />
        </div>

        <div className="flex items-center gap-1 text-[var(--brand)]">
          {Array.from({ length: 4 }).map((_, index) => (
            <Star key={index} className="h-3 w-3 fill-current" />
          ))}
          <Star className="h-3 w-3 text-[var(--border-strong)]" />
          <span className="ml-1 text-[0.72rem] text-[var(--muted-foreground)]">4.0</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {formatCurrency(activePrice)}
          </p>
          <p className="text-[0.72rem] text-[var(--muted-foreground)]">SKU {product.sku}</p>
        </div>

        <p className="line-clamp-2 text-[0.8rem] leading-5 text-[var(--muted-foreground)]">
          {product.description}
        </p>

        <div className="mt-auto">
          <ProductCardPurchaseControls
            product={product}
            pricingMode={pricingMode}
          />
        </div>
      </div>
    </article>
  );
}
