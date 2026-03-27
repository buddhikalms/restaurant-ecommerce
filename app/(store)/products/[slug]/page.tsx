import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartControls } from "@/components/store/add-to-cart-controls";
import { ProductDetailTabs } from "@/components/store/product-detail-tabs";
import { ProductGallery } from "@/components/store/product-gallery";
import { StockBadge } from "@/components/store/status-badge";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getProductBySlug } from "@/lib/data/store";
import { buildProductGalleryImages } from "@/lib/product-gallery";
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

  if (!product) {
    notFound();
  }

  const isVariable = product.productType === "VARIABLE";
  const optionCount = product.variants.length;
  const galleryImages = buildProductGalleryImages(
    product.imageUrl,
    product.galleryImageUrls,
  );

  return (
    <div className="page-shell space-y-8 py-12">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
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

          {galleryImages.length > 1 ? (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              This product includes {galleryImages.length} gallery images so
              customers can browse multiple views before ordering.
            </p>
          ) : null}

          {isVariable ? (
            <div className="mt-6 rounded-[1.7rem] border border-[var(--brand)]/15 bg-[rgba(255,250,242,0.86)] p-4 text-sm leading-6 text-slate-600">
              {showWholesalePrice
                ? `Available in ${optionCount} ${product.variantLabel?.toLowerCase() || "option"}${optionCount === 1 ? "" : "s"}. Choose an option below to see its exact price, stock, and wholesale minimum.`
                : `Available in ${optionCount} ${product.variantLabel?.toLowerCase() || "option"}${optionCount === 1 ? "" : "s"}. Choose an option below to see its exact price and stock. Wholesale pricing unlocks after you register for a wholesale account.`}
            </div>
          ) : null}

          <div
            className={
              showWholesalePrice
                ? "mt-8 grid gap-4 rounded-[2rem] bg-[#f9f4ea] p-5 sm:grid-cols-3"
                : "mt-8 grid gap-4 rounded-[2rem] bg-[#f9f4ea] p-5 sm:grid-cols-1"
            }
          >
            <div
              className={
                pricingMode === "retail"
                  ? "rounded-[1.25rem] bg-white p-4"
                  : "p-4"
              }
            >
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                {isVariable ? "Normal price from" : "Normal price"}
              </p>
              <p className="mt-2 font-heading text-2xl font-semibold text-slate-900">
                {formatCurrency(product.normalPrice)}
              </p>
            </div>
            {showWholesalePrice ? (
              <>
                <div
                  className={
                    pricingMode === "wholesale"
                      ? "rounded-[1.25rem] bg-white p-4"
                      : "p-4"
                  }
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {isVariable ? "Wholesale price from" : "Wholesale price"}
                  </p>
                  <p className="mt-2 font-heading text-2xl font-semibold text-slate-900">
                    {formatCurrency(product.wholesalePrice)}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {isVariable
                      ? "Wholesale minimum from"
                      : "Wholesale minimum"}
                  </p>
                  <p className="mt-2 font-heading text-2xl font-semibold text-slate-900">
                    {product.minOrderQuantity}
                  </p>
                </div>
              </>
            ) : null}
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            {showWholesalePrice
              ? isVariable
                ? "Wholesale pricing is active, and the selected option below controls the exact MOQ and price you order."
                : "Wholesale pricing and minimum quantities are active for your account."
              : isVariable
                ? "Retail pricing is shown here. Create a wholesale account to unlock wholesale prices and bulk minimums for each option."
                : "Retail pricing is shown here. Create a wholesale account to unlock wholesale pricing and bulk minimums."}
          </p>

          {!showWholesalePrice ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {!user ? (
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#4a2a0a] px-5 text-sm font-semibold text-[#fff4df] transition hover:bg-[#653713]"
                >
                  <span className="text-white">Log in</span>
                </Link>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 border-t border-slate-200 pt-8">
            <AddToCartControls
              product={product}
              pricingMode={pricingMode}
              showWholesalePrice={showWholesalePrice}
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
