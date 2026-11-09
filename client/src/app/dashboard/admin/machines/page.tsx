import { MachineCatalog } from "@/features/admin/components/machines/MachineCatalog";
import { MdPrecisionManufacturing } from "react-icons/md";

export default function MachineCatalogPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <MdPrecisionManufacturing size={24} />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Machine Catalog
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage machine categories and machines available across the
            platform.
          </p>
        </div>
      </div>

      <MachineCatalog />
    </div>
  );
}
