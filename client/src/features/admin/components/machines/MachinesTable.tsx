"use client";

import { useMemo, useState } from "react";
import { MdAdd, MdDelete, MdEdit, MdSearch } from "react-icons/md";
import { useGetMachines } from "@/shared/api/generated/machines/machines";
import { useGetMachineCategories } from "@/shared/api/generated/machine-categories/machine-categories";
import type { Machine, MachineCategory } from "@/shared/api/generated/model";

import { useMachineMutations } from "../../hooks/useMachineMutations";
import { useDebounce } from "use-debounce";
import { MachineFormDialog } from "./MachineFormDialog";
import { Button } from "@/shared/components/ui/Button";
import { useConfirm } from "@/shared/providers/confirm-provider";
import { Select } from "@/shared/components/ui/Select";
import { Input } from "@/shared/components/ui/Input";
import { Pagination } from "@/shared/components/ui/Pagination";
import { formatDateTimeTooltip } from "@/shared/utils/date-utils";

const PAGE_SIZE = 10;

export function MachinesTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { confirm } = useConfirm();

  const [debouncedSearch] = useDebounce(search, 400);
  const { deleteMutation } = useMachineMutations();

  const { data, isLoading, isError, refetch } = useGetMachines(
    {
      page,
      limit: PAGE_SIZE,
      q: debouncedSearch || undefined,
      categoryId: categoryId || undefined,
    },
    {
      query: {
        staleTime: 60 * 2 * 1000,
      },
    },
  );

  const { data: categoriesResponse } = useGetMachineCategories(
    {
      page: 1,
      limit: 100,
    },
    {
      query: {
        staleTime: 60 * 2 * 1000,
      },
    },
  );

  const machines = (data?.data?.data as Machine[] | undefined) ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const categories =
    (categoriesResponse?.data?.data as MachineCategory[] | undefined) ?? [];

  const categoriesMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const openCreateDialog = () => {
    setSelectedMachine(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsDialogOpen(true);
  };

  const handleDelete = async (machine: Machine) => {
    const isConfirmed = await confirm({
      title: "Delete Machine",
      message: `Are you sure you want to delete "${machine.nameEn}"?`,
      confirmText: "delete",
      variant: "danger",
    });
    if (!isConfirmed) return;
    deleteMutation.mutate({ id: machine.id });
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedMachine(null);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-[minmax(0,1fr)_15rem_auto] lg:items-end">
        {/* Search */}
        <div className="relative col-span-2 min-w-0 lg:col-span-1">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search machines..."
            className="w-full pl-9"
          />
          <MdSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground" />
        </div>

        {/* Category */}
        <div className="min-w-0">
          <Select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
            options={[
              { value: "", label: "All categories" },
              ...categories.map((category) => ({
                value: category.id,
                label: category.nameEn,
              })),
            ]}
            className="w-full"
          />
        </div>

        {/* Add Machine */}
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={openCreateDialog}
          className="group shrink-0 whitespace-nowrap py-2 "
          leftIcon={
            <MdAdd
              size={18}
              className="transition-transform duration-200 group-hover:scale-110"
            />
          }
        >
          Add Machine
        </Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="border-b border-border bg-muted/50 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Machine En</th>
                <th className="px-5 py-4">Machine Ar</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Created At</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-muted-foreground"
                  >
                    Loading machines...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-destructive"
                  >
                    Failed to load machines.
                    <button
                      type="button"
                      onClick={() => refetch()}
                      className="ml-2 underline"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : machines.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-muted-foreground"
                  >
                    No machines found.
                  </td>
                </tr>
              ) : (
                machines.map((machine) => {
                  return (
                    <tr
                      key={machine.id}
                      className="transition-colors hover:bg-row-hover"
                    >
                      <td className="px-5 py-4 font-semibold">
                        {machine.nameEn}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {machine.nameAr}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {categoriesMap.get(machine.categoryId)?.nameEn ?? "—"}
                      </td>
                      <td
                        className="px-5 py-4 text-muted-foreground"
                        title={formatDateTimeTooltip(machine.createdAt)}
                      >
                        {new Date(machine.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => openEditDialog(machine)}
                            aria-label="Edit machine"
                            title="Edit machine"
                            className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                          >
                            <MdEdit size={17} />
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleDelete(machine)}
                            disabled={deleteMutation.isPending}
                            aria-label="Delete machine"
                            title="Delete machine"
                            className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                          >
                            <MdDelete size={17} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      <MachineFormDialog
        isOpen={isDialogOpen}
        machine={selectedMachine}
        onClose={closeDialog}
      />
    </div>
  );
}
