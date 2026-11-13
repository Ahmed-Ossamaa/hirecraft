"use client";

import type { Machine, MachineCategory } from "@/shared/api/generated/model";
import { Select } from "@/shared/components/ui/Select";

interface MachineryAnalyticsFiltersProps {
  categories: MachineCategory[];
  machines: Machine[];
  isLoading?: boolean;
  selectedCategoryId: string;
  selectedMachineId: string;
  onCategoryChange: (categoryId: string) => void;
  onMachineChange: (machineId: string) => void;
}

export function MachineryAnalyticsFilters({
  categories,
  machines,
  isLoading = false,
  selectedCategoryId,
  selectedMachineId,
  onCategoryChange,
  onMachineChange,
}: MachineryAnalyticsFiltersProps) {
  const filteredMachines = selectedCategoryId
    ? machines.filter((machine) => machine.categoryId === selectedCategoryId)
    : machines;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Select
        label="Category"
        value={selectedCategoryId}
        onChange={(event) => onCategoryChange(event.target.value)}
        disabled={isLoading}
        options={[
          { label: "All categories", value: "" },
          ...categories.map((category) => ({
            label: `${category.nameEn} / ${category.nameAr}`,
            value: category.id,
          })),
        ]}
      />
      <Select
        label="Machine"
        value={selectedMachineId}
        onChange={(event) => onMachineChange(event.target.value)}
        disabled={isLoading || filteredMachines.length === 0}
        options={[
          { label: "Top 10 machines", value: "" },
          ...filteredMachines.map((machine) => ({
            label: `${machine.nameEn} / ${machine.nameAr}`,
            value: machine.id,
          })),
        ]}
      />
    </div>
  );
}
