import { MenuItemCard } from "@/components/cloud-kitchen/storefront/menu-item-card";
import type {
  StorefrontCategory,
  StorefrontProduct,
} from "@/lib/data/cloud-kitchen-storefront";

export function MenuCategorySection({
  category,
  products,
  brandNames,
  onSelect,
  sectionRef,
}: {
  category: StorefrontCategory;
  products: StorefrontProduct[];
  brandNames: Record<string, string>;
  onSelect: (productId: string) => void;
  sectionRef: (node: HTMLElement | null) => void;
}) {
  return (
    <section
      id={category.slug}
      ref={sectionRef}
      className="scroll-mt-[16rem] space-y-4 rounded-[1.5rem] border border-transparent"
    >
      <div>
        <p className="section-label">{category.name}</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-subtitle">{products.length} items ready to order</h2>
            {category.description ? (
              <p className="section-copy mt-2 max-w-3xl">{category.description}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {products.map((product) => (
          <MenuItemCard
            key={product.id}
            product={product}
            brandName={brandNames[product.brandId] ?? "Kitchen brand"}
            onSelect={() => onSelect(product.id)}
          />
        ))}
      </div>
    </section>
  );
}
