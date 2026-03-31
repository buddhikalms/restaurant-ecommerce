import { notFound } from "next/navigation";

import { AddToCartControls } from "@/components/store/add-to-cart-controls";
import { ProductDetailTabs } from "@/components/store/product-detail-tabs";
import { ProductGallery } from "@/components/store/product-gallery";
import { StockBadge } from "@/components/store/status-badge";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getProductBySlug } from "@/lib/data/store";
import { buildProductGalleryImages } from "@/lib/product-gallery";
import { getDisplayedPriceVatLabel } from "@/lib/product-pricing";
import {
  canViewWholesalePricing,
  getPricingModeForRole,
} from "@/lib/user-roles";
import { formatCurrency } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export default async function ProductDetailsPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const user = await getCurrentUser();
  const pricingMode = getPricingModeForRole(user?.role);
  const showWholesalePrice = canViewWholesalePricing(user?.role);
  const hideNormalPrice = user?.role === "WHOLESALE_CUSTOMER";

  if (!product) {
    notFound();
  }

  const isVariable = product.productType === "VARIABLE";
  const optionCount = product.variants.length;
  const optionLabel = product.variantLabel?.toLowerCase() || "option";
  const galleryImages = buildProductGalleryImages(product.imageUrl, product.galleryImageUrls);
  const vatLabel = getDisplayedPriceVatLabel(product.vatRate);

  return (
    <div className="page-shell py-6 sm:py-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
        <div>
          <ProductGallery productName={product.name} images={galleryImages} />
        </div>

        <div className="surface-card rounded-xl p-5 sm:p-6">
          <p className="text-[0.78rem] text-[var(--muted-foreground)]">{product.category.name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-[1.5rem] font-semibold leading-tight text-[var(--foreground)] sm:text-[1.8rem]">
              {product.name}
            </h1>
            <StockBadge stockQuantity={product.stockQuantity} />
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {product.description}
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
              <p className="text-[0.72rem] text-[var(--muted-foreground)]">Retail price</p>
              <p className="mt-1 text-base font-semibold text-[var(--foreground)]">{formatCurrency(product.normalPrice)}</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
              <p className="text-[0.72rem] text-[var(--muted-foreground)]">Wholesale</p>
              <p className="mt-1 text-base font-semibold text-[var(--foreground)]">{showWholesalePrice ? formatCurrency(product.wholesalePrice) : "Login required"}</p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-3">
              <p className="text-[0.72rem] text-[var(--muted-foreground)]">Details</p>
              <p className="mt-1 text-base font-semibold text-[var(--foreground)]">{isVariable ? `${optionCount} ${optionLabel}${optionCount === 1 ? "" : "s"}` : `MOQ ${product.minOrderQuantity}`}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="info-pill">SKU {product.sku}</span>
            <span className="info-pill">{vatLabel}</span>
            {showWholesalePrice ? <span className="info-pill">Wholesale active</span> : null}
          </div>

          <div className="mt-5 border-t border-[var(--border)] pt-5">
            <AddToCartControls
              product={product}
              pricingMode={pricingMode}
              showWholesalePrice={showWholesalePrice}
              hideNormalPrice={hideNormalPrice}
            />
          </div>
        </div>
      </div>

      <div className="mt-5">
        <ProductDetailTabs
          description={product.description}
          information={product.information}
          ingredients={product.ingredients}
          nutritional={product.nutritional}
          faq={product.faq}
        />
      </div>
    </div>
  );
}
