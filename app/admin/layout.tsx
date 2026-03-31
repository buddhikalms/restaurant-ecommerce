import { AdminShell } from "@/components/layout/admin-shell";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <AdminShell userName={user.name ?? "Admin"} userEmail={user.email}>
      {children}
    </AdminShell>
  );
}
