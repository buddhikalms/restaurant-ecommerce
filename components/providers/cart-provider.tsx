"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { type PricingMode } from "@/lib/user-roles";

type CartItem = {
  itemId: string;
  productId: string;
  variantId: string | null;
  slug: string;
  name: string;
  variantName: string | null;
  sku: string;
  imageUrl: string;
  unitPrice: number;
  minimumQuantity: number;
  stockQuantity: number;
  categoryName: string;
  pricingMode: PricingMode;
  quantity: number;
};

type CartInput = Omit<CartItem, "itemId" | "quantity"> & {
  quantity?: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  pricingMode: PricingMode;
  isReady: boolean;
  addItem: (item: CartInput) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function createCartItemId(productId: string, variantId: string | null) {
  return variantId ? `${productId}:${variantId}` : productId;
}

function normalizeStoredItems(raw: string | null): CartItem[] {
  if (!raw) {
    return [];
  }

  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return [];
    }

    const item = entry as Partial<CartItem>;

    if (
      typeof item.productId !== "string" ||
      typeof item.slug !== "string" ||
      typeof item.name !== "string" ||
      typeof item.sku !== "string" ||
      typeof item.imageUrl !== "string" ||
      typeof item.categoryName !== "string"
    ) {
      return [];
    }

    const variantId = typeof item.variantId === "string" ? item.variantId : null;
    const minimumQuantity =
      typeof item.minimumQuantity === "number" && Number.isFinite(item.minimumQuantity)
        ? Math.max(1, Math.trunc(item.minimumQuantity))
        : 1;
    const stockQuantity =
      typeof item.stockQuantity === "number" && Number.isFinite(item.stockQuantity)
        ? Math.max(0, Math.trunc(item.stockQuantity))
        : 0;
    const quantityCandidate =
      typeof item.quantity === "number" && Number.isFinite(item.quantity)
        ? Math.trunc(item.quantity)
        : minimumQuantity;

    return [
      {
        itemId:
          typeof item.itemId === "string" && item.itemId.length > 0
            ? item.itemId
            : createCartItemId(item.productId, variantId),
        productId: item.productId,
        variantId,
        slug: item.slug,
        name: item.name,
        variantName: typeof item.variantName === "string" ? item.variantName : null,
        sku: item.sku,
        imageUrl: item.imageUrl,
        unitPrice:
          typeof item.unitPrice === "number" && Number.isFinite(item.unitPrice)
            ? item.unitPrice
            : 0,
        minimumQuantity,
        stockQuantity,
        categoryName: item.categoryName,
        pricingMode: item.pricingMode === "wholesale" ? "wholesale" : "retail",
        quantity: Math.min(stockQuantity, Math.max(minimumQuantity, quantityCandidate))
      }
    ];
  });
}

export function CartProvider({
  children,
  pricingMode
}: {
  children: React.ReactNode;
  pricingMode: PricingMode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const storageKey = `harvest-cart-${pricingMode}`;

  useEffect(() => {
    setIsReady(false);

    try {
      const raw = window.localStorage.getItem(storageKey);
      setItems(normalizeStoredItems(raw));
    } catch (error) {
      console.error("Failed to load cart", error);
      setItems([]);
    } finally {
      setIsReady(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isReady) return;
    window.localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, isReady, storageKey]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      subtotal,
      itemCount,
      pricingMode,
      isReady,
      addItem(item) {
        setItems((current) => {
          const itemId = createCartItemId(item.productId, item.variantId);
          const existing = current.find((cartItem) => cartItem.itemId === itemId);
          const requestedQuantity = item.quantity ?? item.minimumQuantity;
          const nextQuantity = Math.min(item.stockQuantity, (existing?.quantity ?? 0) + requestedQuantity);

          if (existing) {
            return current.map((cartItem) =>
              cartItem.itemId === itemId
                ? {
                    ...cartItem,
                    variantId: item.variantId,
                    variantName: item.variantName,
                    sku: item.sku,
                    unitPrice: item.unitPrice,
                    minimumQuantity: item.minimumQuantity,
                    stockQuantity: item.stockQuantity,
                    pricingMode: item.pricingMode,
                    quantity: Math.min(item.stockQuantity, Math.max(item.minimumQuantity, nextQuantity))
                  }
                : cartItem
            );
          }

          return [
            ...current,
            {
              ...item,
              itemId,
              quantity: Math.min(item.stockQuantity, Math.max(item.minimumQuantity, requestedQuantity))
            }
          ];
        });
      },
      updateQuantity(itemId, quantity) {
        setItems((current) =>
          current.map((item) =>
            item.itemId === itemId
              ? {
                  ...item,
                  quantity: Math.min(item.stockQuantity, Math.max(item.minimumQuantity, quantity))
                }
              : item
          )
        );
      },
      removeItem(itemId) {
        setItems((current) => current.filter((item) => item.itemId !== itemId));
      },
      clearCart() {
        setItems([]);
      }
    };
  }, [isReady, items, pricingMode]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}