import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteButton } from "@/components/forms/delete-button";
import { getButtonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { deleteKitchenAction } from "@/lib/actions/cloud-kitchen-actions";
import { getAdminKitchens } from "@/lib/data/cloud-kitchen";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCloudKitchenKitchensPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = toValue(params.q);
  const kitchens = await getAdminKitchens(query);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Cloud Kitchen"
        title="Kitchen and branch management"
        description="Define each kitchen's location, readiness, and delivery defaults."
        actions={
          <Link href="/admin/cloud-kitchen/kitchens/new" className={getButtonClassName({})}>
            <span className="text-white">Add kitchen</span>
          </Link>
        }
      />

      <form className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4" method="get">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input name="q" defaultValue={query} placeholder="Search kitchen, city, or state" />
          <button className="inline-flex h-9 items-center justify-center rounded-lg bg-[var(--brand)] px-4 text-[0.82rem] font-medium text-white">
            Search
          </button>
        </div>
      </form>

      {kitchens.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {kitchens.map((kitchen: (typeof kitchens)[number]) => (
            <div key={kitchen.id} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="admin-kicker">{kitchen.city}, {kitchen.state}</p>
                  <h2 className="mt-2 text-lg font-semibold text-[var(--admin-foreground)]">{kitchen.name}</h2>
                  <p className="mt-2 text-[0.82rem] leading-6 text-[var(--admin-muted-foreground)]">
                    {kitchen.addressLine1}{kitchen.addressLine2 ? `, ${kitchen.addressLine2}` : ""}, {kitchen.postalCode}
                  </p>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-[0.72rem] font-semibold ${kitchen.acceptsOrders ? "bg-[rgba(85,99,71,0.14)] text-[var(--admin-success)]" : "bg-[rgba(179,86,72,0.12)] text-[var(--admin-danger)]"}`}>
                  {kitchen.acceptsOrders ? "Open" : "Paused"}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-[0.78rem] text-[var(--admin-muted-foreground)] sm:grid-cols-2">
                <p>Menu items: {kitchen._count?.foodItems ?? 0}</p>
                <p>Delivery zones: {kitchen._count?.deliveryZones ?? 0}</p>
                <p>Min order: {kitchen.minimumOrderAmount.toFixed(2)}</p>
                <p>Delivery fee: {kitchen.deliveryFee.toFixed(2)}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/admin/cloud-kitchen/kitchens/${kitchen.id}/edit`}
                  className={getButtonClassName({ variant: "secondary", size: "sm" })}
                >
                  Edit
                </Link>
                <DeleteButton
                  itemId={kitchen.id}
                  action={deleteKitchenAction}
                  label="Delete"
                  confirmMessage="Delete this kitchen? Existing food orders will block the delete."
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No kitchens found"
          description="Create your first kitchen or branch to start the delivery module."
          actionLabel="Add kitchen"
          actionHref="/admin/cloud-kitchen/kitchens/new"
        />
      )}
    </div>
  );
}


