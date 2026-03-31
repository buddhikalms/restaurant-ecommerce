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
  const galleryImages = buildProductGalleryImages(
    product.imageUrl,
    product.galleryImageUrls,
  );
  const showNormalPrice = !hideNormalPrice;
  const priceGridClass = showWholesalePrice
    ? showNormalPrice
      ? "mt-8 grid gap-4 rounded-[2rem] bg-[#f9f4ea] p-5 sm:grid-cols-3"
      : "mt-8 grid gap-4 rounded-[2rem] bg-[#f9f4ea] p-5 sm:grid-cols-2"
    : "mt-8 grid gap-4 rounded-[2rem] bg-[#f9f4ea] p-5 sm:grid-cols-1";
  const vatLabel = getDisplayedPriceVatLabel(product.vatRate);

  return (
    <div className="page-shell space-y-8 py-12">
      <div className="grid gap-6 lg:grid-cols-[minmax(250px,0.9fr)_minmax(0,1.8fr)] xl:grid-cols-[minmax(260px,1fr)_minmax(0,3fr)] xl:items-start">
        <div className="xl:max-w-sm">
          <ProductGallery productName={product.name} images={galleryImages} />
        </div>

        <div className="surface-card rounded-[2.5rem] border border-white/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
            {product.category.name}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-4xl font-semibold text-slate-900">
              {product.name}
            </h1>
            <StockBadge stockQuantity={product.stockQuantity} />
          </div>
          <p className="mt-3 text-sm uppercase tracking-[0.16em] text-slate-500">
            {isVariable ? `Base SKU ${product.sku}` : `SKU ${product.sku}`}
          </p>
          <p className="mt-6 text-base leading-8 text-slate-600">
            {product.description}
          </p>

          <div className="mt-5 border-t border-slate-200 pt-8">
            <AddToCartControls
              product={product}
              pricingMode={pricingMode}
              showWholesalePrice={showWholesalePrice}
              hideNormalPrice={hideNormalPrice}
            />
          </div>
        </div>
      </div>

      <ProductDetailTabs
        information={product.information}
        ingredients={product.ingredients}
        nutritional={product.nutritional}
        faq={product.faq}
      />
    </div>
  );
}
