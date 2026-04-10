"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type FoodCartItem = {
  itemId: string;
  foodItemId: string;
  kitchenId: string;
  slug: string;
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  categoryName: string;
  itemType: "SINGLE" | "COMBO";
  offerTitle: string | null;
  variantLabel: string | null;
  customizations: string[];
  instructions: string | null;
  brandName: string | null;
};

export type FoodCartInput = Omit<
  FoodCartItem,
  "itemId" | "quantity" | "variantLabel" | "customizations" | "instructions" | "brandName"
> & {
  itemId?: string;
  quantity?: number;
  variantLabel?: string | null;
  customizations?: string[];
  instructions?: string | null;
  brandName?: string | null;
};

type FoodCartContextValue = {
  items: FoodCartItem[];
  itemCount: number;
  subtotal: number;
  kitchenId: string | null;
  isReady: boolean;
  addItem: (item: FoodCartInput) => { ok: boolean; message?: string };
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
};

const FoodCartContext = createContext<FoodCartContextValue | null>(null);
const STORAGE_KEY = "ceylontaste-food-cart";

function normalizeStoredItems(raw: string | null): FoodCartItem[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((entry) => {
      if (!entry || typeof entry !== "object") {
        return [];
      }

      const item = entry as Partial<FoodCartItem>;

      if (
        typeof item.foodItemId !== "string" ||
        typeof item.kitchenId !== "string" ||
        typeof item.slug !== "string" ||
        typeof item.name !== "string" ||
        typeof item.imageUrl !== "string" ||
        typeof item.categoryName !== "string"
      ) {
        return [];
      }

      return [
        {
          itemId:
            typeof item.itemId === "string" ? item.itemId : item.foodItemId,
          foodItemId: item.foodItemId,
          kitchenId: item.kitchenId,
          slug: item.slug,
          name: item.name,
          imageUrl: item.imageUrl,
          price: typeof item.price === "number" ? item.price : 0,
          quantity:
            typeof item.quantity === "number" && Number.isFinite(item.quantity)
              ? Math.max(1, Math.trunc(item.quantity))
              : 1,
          categoryName: item.categoryName,
          itemType: item.itemType === "COMBO" ? "COMBO" : "SINGLE",
          offerTitle:
            typeof item.offerTitle === "string" ? item.offerTitle : null,
          variantLabel:
            typeof item.variantLabel === "string" ? item.variantLabel : null,
          customizations: Array.isArray(item.customizations)
            ? item.customizations.filter(
                (entry): entry is string => typeof entry === "string",
              )
            : [],
          instructions:
            typeof item.instructions === "string" ? item.instructions : null,
          brandName: typeof item.brandName === "string" ? item.brandName : null,
        },
      ];
    });
  } catch {
    return [];
  }
}

export function FoodCartProvider({
  children,
  activeKitchenId,
}: {
  children: React.ReactNode;
  activeKitchenId: string | null;
}) {
  const [items, setItems] = useState<FoodCartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);

    try {
      setItems(normalizeStoredItems(window.localStorage.getItem(STORAGE_KEY)));
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [isReady, items]);

  useEffect(() => {
    if (!activeKitchenId) {
      return;
    }

    setItems((current) =>
      current.length && current.some((item) => item.kitchenId !== activeKitchenId)
        ? []
        : current,
    );
  }, [activeKitchenId]);

  const value = useMemo<FoodCartContextValue>(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const kitchenId = items[0]?.kitchenId ?? activeKitchenId ?? null;

    return {
      items,
      itemCount,
      subtotal,
      kitchenId,
      isReady,
      addItem(item) {
        if (kitchenId && kitchenId !== item.kitchenId && items.length > 0) {
          return {
            ok: false,
            message: "Your food cart can only contain items from one kitchen at a time.",
          };
        }

        setItems((current) => {
          const entryId = item.itemId ?? item.foodItemId;
          const existing = current.find((entry) => entry.itemId === entryId);

          if (existing) {
            return current.map((entry) =>
              entry.itemId === entryId
                ? {
                    ...entry,
                    quantity: entry.quantity + (item.quantity ?? 1),
                  }
                : entry,
            );
          }

          return [
            ...current,
            {
              ...item,
              itemId: entryId,
              quantity: item.quantity ?? 1,
              variantLabel: item.variantLabel ?? null,
              customizations: item.customizations ?? [],
              instructions: item.instructions ?? null,
              brandName: item.brandName ?? null,
            },
          ];
        });

        return { ok: true };
      },
      updateQuantity(itemId, quantity) {
        setItems((current) =>
          current.map((item) =>
            item.itemId === itemId
              ? {
                  ...item,
                  quantity: Math.max(1, Math.trunc(quantity)),
                }
              : item,
          ),
        );
      },
      removeItem(itemId) {
        setItems((current) => current.filter((item) => item.itemId !== itemId));
      },
      clearCart() {
        setItems([]);
      },
    };
  }, [activeKitchenId, isReady, items]);

  return <FoodCartContext.Provider value={value}>{children}</FoodCartContext.Provider>;
}

export function useFoodCart() {
  const context = useContext(FoodCartContext);

  if (!context) {
    throw new Error("useFoodCart must be used within FoodCartProvider");
  }

  return context;
}
