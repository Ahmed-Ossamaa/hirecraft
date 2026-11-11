"use client";

import { useState } from "react";
import type { MachineCategory } from "@/shared/api/generated/model";
import { useDebounce } from "use-debounce";
import { useGetMachineCategories } from "@/shared/api/generated/machine-categories/machine-categories";
import { useMachineCategoryMutations } from "../../hooks/useMachineMutations";
import { MdAdd, MdDelete, MdEdit, MdSearch } from "react-icons/md";
import { MachineCategoryFormDialog } from "./MachineCategoryFormDialog";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { useConfirm } from "@/shared/providers/confirm-provider";
import { Pagination } from "@/shared/components/ui/Pagination";
import { formatDateTimeTooltip } from "@/shared/utils/date-utils";

const PAGE_SIZE = 10;

export function CategoriesTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<MachineCategory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [debouncedSearch] = useDebounce(search, 400);
  const { deleteMutation } = useMachineCategoryMutations();

  const { data, isLoading, isError, refetch } = useGetMachineCategories({
    page,
    limit: PAGE_SIZE,
    q: debouncedSearch || undefined,
  });

  const { confirm } = useConfirm();

  const categories = (data?.data?.data as MachineCategory[] | undefined) ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const openCreateDialog = () => {
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: MachineCategory) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleDelete = async (category: MachineCategory) => {
    const isConfirmed = await confirm({
      title: "Delete Category",
      message: `Are you sure you want to delete "${category.nameEn}"?`,
      confirmText: "delete",
      variant: "danger",
    });
    if (!isConfirmed) return;
    deleteMutation.mutate({ id: category.id });
  };
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search categories..."
            className="w-full pl-9"
          />
          <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground" />
        </div>

        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={openCreateDialog}
          className="group shrink-0 whitespace-nowrap py-2"
          leftIcon={
            <MdAdd
              size={18}
              className="transition-transform duration-200 group-hover:scale-110"
            />
          }
        >
          Add Category
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="border-b border-border bg-muted/50 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Category En</th>
                <th className="px-5 py-4">Category Ar</th>
                <th className="px-5 py-4">Created At</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-muted-foreground"
                  >
                    Loading categories...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-destructive"
                  >
                    Failed to load categories.
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="ml-2 underline"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition-colors hover:bg-row-hover"
                  >
                    <td className="px-5 py-4">
                      <div className="flex flex-col justify-center gap-1">
                        <div className="font-semibold">{category.nameEn}</div>
                        <div className="text-muted-foreground text-[10px]">
                          {category.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-semibold">
                      {category.nameAr}
                    </td>
                    <td
                      className="px-5 py-4 text-muted-foreground"
                      title={formatDateTimeTooltip(category.createdAt)}
                    >
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    {/* Action btns */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => openEditDialog(category)}
                          aria-label="Edit category"
                          title="Edit category"
                          className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                        >
                          <MdEdit size={17} />
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleDelete(category)}
                          disabled={deleteMutation.isPending}
                          aria-label="Delete category"
                          title="Delete category"
                          className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        >
                          <MdDelete size={17} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-border flex-row items-center text-xs text-muted-foreground">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      <MachineCategoryFormDialog
        isOpen={isDialogOpen}
        category={selectedCategory}
        onClose={closeDialog}
      />
    </div>
  );
}
