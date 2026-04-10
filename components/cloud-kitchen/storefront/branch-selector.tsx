import { Select } from "@/components/ui/select";
import type { StorefrontBranch } from "@/lib/data/cloud-kitchen-storefront";

export function BranchSelector({
  branches,
  selectedBranchId,
  onBranchChange,
}: {
  branches: StorefrontBranch[];
  selectedBranchId: string;
  onBranchChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="field-label">Kitchen branch</span>
      <Select
        value={selectedBranchId}
        onChange={(event) => onBranchChange(event.target.value)}
        className="h-11 rounded-xl"
      >
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name} - {branch.area} ({branch.eta})
          </option>
        ))}
      </Select>
    </label>
  );
}
