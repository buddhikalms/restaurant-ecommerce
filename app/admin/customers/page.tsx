import { EmptyState } from "@/components/ui/empty-state";
import { getAdminCustomers } from "@/lib/data/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();

  return (
    <div className="space-y-8">
      <section className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Customers</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">Customer relationships</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">Review retail and wholesale accounts, recent order history, and commercial activity across the platform.</p>
      </section>

      {customers.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {customers.map((customer) => (
            <div key={customer.id} className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-heading text-2xl font-semibold text-slate-900">{customer.businessName || customer.name}</p>
                    <span className="rounded-full bg-[#f9f4ea] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                      {customer.role === "WHOLESALE_CUSTOMER" ? "Wholesale" : "Retail"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{customer.name} | {customer.email}</p>
                  <p className="mt-1 text-sm text-slate-500">Joined {formatDate(customer.createdAt)}</p>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <p>{customer.orders.length} recent orders</p>
                  <p>{customer.phone || "No phone on file"}</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {customer.orders.length ? (
                  customer.orders.map((order) => (
                    <div key={order.id} className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                          <p className="mt-1 text-sm text-slate-500">{formatDate(order.createdAt)} | {order.status}</p>
                        </div>
                        <span className="font-semibold text-slate-900">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No orders yet for this customer.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No customers yet" description="Retail and wholesale accounts will appear here after registration." />
      )}
    </div>
  );
}

