"use client";

import { useState } from "react";
import { MachinesTable } from "./MachinesTable";
import { CategoriesTable } from "./CategoriesTable";
import { MdCategory, MdPrecisionManufacturing } from "react-icons/md";
import { Tabs } from "@/shared/components/ui/Tabs";

export type MachineCatalogTab = "machines" | "categories";

export function MachineCatalog() {
  const [activeTab, setActiveTab] = useState("MACHINES");

  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          {
            id: "MACHINES",
            label: (
              <>
                <MdPrecisionManufacturing size={16} />
                Machines
              </>
            ),
          },
          {
            id: "CATEGORIES",
            label: (
              <>
                <MdCategory size={16} />
                Categories
              </>
            ),
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "MACHINES" ? <MachinesTable /> : <CategoriesTable />}
    </div>
  );
}
