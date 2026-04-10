"use client";

import { CircleAlert, Filter, Sparkles } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { CartSidebar } from "@/components/cloud-kitchen/storefront/cart-sidebar";
import { CategoryTabs } from "@/components/cloud-kitchen/storefront/category-tabs";
import { CloudKitchenHeader } from "@/components/cloud-kitchen/storefront/cloud-kitchen-header";
import { KitchenInfoBar } from "@/components/cloud-kitchen/storefront/kitchen-info-bar";
import { MenuCategorySection } from "@/components/cloud-kitchen/storefront/menu-category-section";
import { MenuItemModal } from "@/components/cloud-kitchen/storefront/menu-item-modal";
import { MobileCartBar } from "@/components/cloud-kitchen/storefront/mobile-cart-bar";
import { useFoodCart } from "@/components/providers/food-cart-provider";
import { EmptyState } from "@/components/ui/empty-state";
import type {
  CloudKitchenStorefrontData,
  StorefrontPromoCode,
} from "@/lib/data/cloud-kitchen-storefront";

function calculateDiscount({
  promo,
  subtotal,
  deliveryFee,
}: {
  promo: StorefrontPromoCode | null;
  subtotal: number;
  deliveryFee: number;
}) {
  if (!promo) {
    return 0;
  }

  if (promo.type === "percentage") {
    return subtotal * (promo.amount / 100);
  }

  if (promo.type === "fixed") {
    return subtotal >= 30 ? Math.min(promo.amount, subtotal) : 0;
  }

  return deliveryFee;
}

function getOrderTypeLabel(orderType: "delivery" | "takeaway" | "dine-in") {
  if (orderType === "delivery") {
    return "Delivery";
  }

  if (orderType === "takeaway") {
    return "Takeaway";
  }

  return "Dine-in";
}

export function CloudKitchenStorefront({
  data,
  checkoutHref,
  checkoutHint,
}: {
  data: CloudKitchenStorefrontData;
  checkoutHref: string;
  checkoutHint?: string | null;
}) {
  const {
    items,
    itemCount,
    subtotal,
    isReady,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  } = useFoodCart();
  const [searchValue, setSearchValue] = useState("");
  const deferredSearch = useDeferredValue(searchValue.trim().toLowerCase());
  const [selectedBranchId, setSelectedBranchId] = useState(data.kitchen.defaultBranchId);
  const [selectedBrandId, setSelectedBrandId] = useState("all");
  const [orderType, setOrderType] = useState<"delivery" | "takeaway" | "dine-in">("delivery");
  const [selectedScheduleId, setSelectedScheduleId] = useState(
    data.scheduleOptions[0]?.id ?? "asap",
  );
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState(data.categories[0]?.id ?? "");
  const [promoValue, setPromoValue] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(
    data.promoCodes.length ? "Enter a promo code if you have one." : null,
  );
  const [notice, setNotice] = useState<string | null>(checkoutHint ?? null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const selectedBranch =
    data.branches.find((branch) => branch.id === selectedBranchId) ?? data.branches[0];
  const selectedSchedule =
    data.scheduleOptions.find((option) => option.id === selectedScheduleId) ??
    data.scheduleOptions[0];
  const selectedPromo =
    data.promoCodes.find((promo) => promo.code === appliedPromoCode) ?? null;

  const brandNames = useMemo(
    () => Object.fromEntries(data.brands.map((brand) => [brand.id, brand.name])),
    [data.brands],
  );
  const categoryNames = useMemo(
    () => Object.fromEntries(data.categories.map((category) => [category.id, category.name])),
    [data.categories],
  );
  const validProductIds = useMemo(
    () => new Set(data.products.map((product) => product.id)),
    [data.products],
  );

  const visibleCategories = data.categories
    .map((category) => ({
      ...category,
      products: data.products.filter((product) => {
        const matchesCategory = product.categoryId === category.id;
        const matchesBrand =
          selectedBrandId === "all" || product.brandId === selectedBrandId;
        const matchesSearch =
          !deferredSearch ||
          [
            product.name,
            product.shortDescription,
            product.description,
            brandNames[product.brandId] ?? "",
            category.name,
          ]
            .join(" ")
            .toLowerCase()
            .includes(deferredSearch);

        return matchesCategory && matchesBrand && matchesSearch;
      }),
    }))
    .filter((category) => category.products.length > 0);

  const resolvedActiveCategoryId = visibleCategories.some(
    (category) => category.id === activeCategoryId,
  )
    ? activeCategoryId
    : (visibleCategories[0]?.id ?? "");

  const minimumOrder =
    orderType === "delivery"
      ? selectedBranch.minimumOrder
      : orderType === "takeaway"
        ? Math.max(0, data.kitchen.minOrder - 4)
        : 0;
  const deliveryFee = orderType === "delivery" ? selectedBranch.deliveryFee : 0;
  const discount = calculateDiscount({
    promo: selectedPromo,
    subtotal,
    deliveryFee,
  });
  const tax = Math.max(subtotal - discount, 0) * data.kitchen.taxRate;
  const total = Math.max(subtotal + deliveryFee + tax - discount, 0);
  const canCheckout = subtotal >= minimumOrder;
  const selectedProduct =
    data.products.find((product) => product.id === selectedProductId) ?? null;
  const selectedBrandName = selectedProduct
    ? brandNames[selectedProduct.brandId] ?? "Kitchen menu"
    : "Kitchen menu";
  const selectedCategoryName = selectedProduct
    ? categoryNames[selectedProduct.categoryId] ?? "Menu item"
    : "Menu item";

  useEffect(() => {
    if (!isReady || !items.length) {
      return;
    }

    for (const item of items) {
      if (item.kitchenId !== data.kitchen.id || !validProductIds.has(item.foodItemId)) {
        removeItem(item.itemId);
      }
    }
  }, [data.kitchen.id, isReady, items, removeItem, validProductIds]);

  useEffect(() => {
    if (!visibleCategories.length) {
      return;
    }

    const handleScroll = () => {
      let nextActiveCategory = visibleCategories[0]?.id ?? "";

      for (const category of visibleCategories) {
        const section = sectionRefs.current[category.id];

        if (section && section.getBoundingClientRect().top <= 260) {
          nextActiveCategory = category.id;
        }
      }

      if (nextActiveCategory) {
        setActiveCategoryId(nextActiveCategory);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [visibleCategories]);

  useEffect(() => {
    if (!isMobileCartOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileCartOpen]);

  function applyPromo() {
    const nextPromo = data.promoCodes.find(
      (promo) => promo.code === promoValue.trim().toUpperCase(),
    );

    if (!nextPromo) {
      setAppliedPromoCode(null);
      setPromoMessage("Promo code not found.");
      return;
    }

    setAppliedPromoCode(nextPromo.code);
    setPromoMessage(`${nextPromo.label} applied to your estimate.`);
    setPromoValue(nextPromo.code);
  }

  return (
    <div className="space-y-6 pb-24 xl:pb-10">
      <CloudKitchenHeader
        kitchen={data.kitchen}
        branch={selectedBranch}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />

      {notice ? (
        <div className="rounded-[1.5rem] border border-[rgba(85,99,71,0.18)] bg-[rgba(85,99,71,0.1)] px-4 py-3 text-[0.84rem] text-[var(--accent-dark)]">
          {notice}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-6">
          <div className="sticky top-4 z-20 space-y-3">
            <KitchenInfoBar
              orderType={orderType}
              onOrderTypeChange={(value) => {
                setOrderType(value);
                setNotice(checkoutHint ?? null);
              }}
              branches={data.branches}
              selectedBranchId={selectedBranchId}
              onBranchChange={(value) => {
                setSelectedBranchId(value);
                setNotice(checkoutHint ?? null);
              }}
              brands={data.brands}
              selectedBrandId={selectedBrandId}
              onBrandChange={setSelectedBrandId}
              scheduleOptions={data.scheduleOptions}
              selectedScheduleId={selectedScheduleId}
              onScheduleChange={setSelectedScheduleId}
              minimumOrder={minimumOrder}
              deliveryFee={deliveryFee}
              branchesLabel={data.kitchen.branchesLabel}
            />

            <CategoryTabs
              categories={visibleCategories.map((category) => ({
                id: category.id,
                name: category.name,
                itemCount: category.products.length,
              }))}
              activeCategoryId={resolvedActiveCategoryId}
              onSelect={(categoryId) => {
                setActiveCategoryId(categoryId);
                const targetSection = sectionRefs.current[categoryId];

                if (!targetSection) {
                  return;
                }

                const top = targetSection.getBoundingClientRect().top + window.scrollY - 250;
                window.scrollTo({ top, behavior: "smooth" });
              }}
            />
          </div>

          <div className="flex flex-col gap-2 rounded-[1.5rem] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[0.82rem] text-[var(--muted-foreground)]">
              <Sparkles className="h-4 w-4 text-[var(--brand-dark)]" />
              Showing{" "}
              {visibleCategories.reduce(
                (sum, category) => sum + category.products.length,
                0,
              )}{" "}
              items across {visibleCategories.length || 0} categories
            </div>
            {data.brands.length > 1 ? (
              <div className="inline-flex items-center gap-2 text-[0.78rem] text-[var(--muted-foreground)]">
                <Filter className="h-4 w-4" />
                {selectedBrandId === "all"
                  ? "All brands"
                  : `Filtered to ${brandNames[selectedBrandId] ?? "brand"}`}
              </div>
            ) : null}
          </div>

          {visibleCategories.length ? (
            <div className="space-y-8">
              {visibleCategories.map((category) => (
                <MenuCategorySection
                  key={category.id}
                  category={category}
                  products={category.products}
                  brandNames={brandNames}
                  onSelect={setSelectedProductId}
                  sectionRef={(node) => {
                    sectionRefs.current[category.id] = node;
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No matching menu items"
              description="Try a different keyword or clear the active menu filter."
            />
          )}
        </div>

        <div className="hidden xl:block">
          <CartSidebar
            items={items}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            tax={tax}
            discount={discount}
            total={total}
            minimumOrder={minimumOrder}
            orderTypeLabel={getOrderTypeLabel(orderType)}
            branchName={selectedBranch.name}
            scheduleLabel={selectedSchedule?.label ?? "As soon as possible"}
            promoValue={promoValue}
            onPromoValueChange={setPromoValue}
            onApplyPromo={applyPromo}
            promoMessage={promoMessage}
            appliedPromoLabel={selectedPromo?.label ?? null}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
            onClearCart={clearCart}
            canCheckout={canCheckout}
            checkoutHref={checkoutHref}
            checkoutLabel={checkoutHint ? "Set location before checkout" : "Continue to checkout"}
            checkoutHelper={checkoutHint}
            showPromoCodes={data.promoCodes.length > 0}
            className="sticky top-4"
          />
        </div>
      </div>

      <MobileCartBar
        itemCount={itemCount}
        total={total}
        onOpen={() => setIsMobileCartOpen(true)}
      />

      {isMobileCartOpen ? (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(15,23,42,0.48)]"
            onClick={() => setIsMobileCartOpen(false)}
            aria-label="Close cart"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-[2rem] bg-[var(--background)] p-4">
            <CartSidebar
              items={items}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              tax={tax}
              discount={discount}
              total={total}
              minimumOrder={minimumOrder}
              orderTypeLabel={getOrderTypeLabel(orderType)}
              branchName={selectedBranch.name}
              scheduleLabel={selectedSchedule?.label ?? "As soon as possible"}
              promoValue={promoValue}
              onPromoValueChange={setPromoValue}
              onApplyPromo={applyPromo}
              promoMessage={promoMessage}
              appliedPromoLabel={selectedPromo?.label ?? null}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
              onClearCart={clearCart}
              canCheckout={canCheckout}
              checkoutHref={checkoutHref}
              checkoutLabel={checkoutHint ? "Set location before checkout" : "Continue to checkout"}
              checkoutHelper={checkoutHint}
              showPromoCodes={data.promoCodes.length > 0}
            />
          </div>
        </div>
      ) : null}

      <MenuItemModal
        kitchenId={data.kitchen.id}
        product={selectedProduct}
        categoryName={selectedCategoryName}
        brandName={selectedBrandName}
        onClose={() => setSelectedProductId(null)}
        onAddToCart={(item) => {
          const result = addItem(item);

          if (!result.ok) {
            setNotice(result.message ?? "Unable to add item to the cart.");
            return;
          }

          setNotice(checkoutHint ?? null);
        }}
      />

      {!isReady ? (
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-4 py-2 text-[0.78rem] text-[var(--muted-foreground)]">
          <CircleAlert className="h-4 w-4" />
          Loading basket state...
        </div>
      ) : null}
    </div>
  );
}
