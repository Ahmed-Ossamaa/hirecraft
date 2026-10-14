"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Button, Textarea, Select } from "@/shared/components/ui";
import { useCreateJob, useUpdateJob } from "@/features/jobs/api/useJobMutations";
import { useGetMachines } from "@/shared/api/generated/machines/machines";
import { useGetMachineCategories } from "@/shared/api/generated/machine-categories/machine-categories";
import { Machine, MachineCategory, Job } from "@/shared/api/generated/model";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MdAdd, MdDeleteOutline } from "react-icons/md";
import { FormError } from "@/shared/components/ui/FormError";
import { getApiError } from "@/shared/utils/error";
import { CountryCitySelect } from "@/shared/components/ui/CountryCitySelect";

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Machine category is required"),
  machineId: z.string().min(1, "Machine selection is required"),
  experienceLevel: z.enum(["ENTRY_LEVEL", "SKILLED", "SENIOR", "EXPERT"]),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
  country: z.string().min(1, "Country is required").max(100),
  city: z.string().min(1, "City is required").max(100),
  yearsOfExperience: z.coerce.number().min(0).max(50).optional(),
  salaryRange: z.string().max(20).optional().or(z.literal("")),
  requirements: z
    .array(
      z.object({ value: z.string().min(1, "Requirement cannot be empty") }),
    )
    .optional(),
});

type JobFormData = z.infer<typeof jobSchema>;

export interface JobFormProps {
  initialJob?: Job;
}

export const JobForm: React.FC<JobFormProps> = ({ initialJob }) => {
  const isEdit = Boolean(initialJob);
  const router = useRouter();
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();

  const { data: categoriesRes, isLoading: isLoadingCategories } = useGetMachineCategories({ limit: 100 });
  const categories: MachineCategory[] = (categoriesRes?.data?.data as any) || [];

  const { data: machinesRes, isLoading: isLoadingMachines } = useGetMachines({
    limit: 100,
  });
  const machines: Machine[] = (machinesRes?.data?.data as any) || [];

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialJob?.title || "",
      description: initialJob?.description || "",
      categoryId: initialJob?.machineCategoryId || "",
      machineId: initialJob?.machineId || "",
      experienceLevel: (initialJob?.experienceLevel as any) || "SKILLED",
      jobType: (initialJob?.jobType as any) || "FULL_TIME",
      country: initialJob?.country || "",
      city: initialJob?.city || "",
      salaryRange: initialJob?.salaryRange || "",
      yearsOfExperience: initialJob?.yearsOfExperience ?? 0,
      requirements:
        initialJob?.requirements && initialJob.requirements.length > 0
          ? initialJob.requirements.map((r) => ({ value: r }))
          : [{ value: "" }],
    },
  });

  const selectedCategoryId = watch("categoryId");
  const filteredMachines = selectedCategoryId
    ? machines.filter((m) => m.categoryId === selectedCategoryId)
    : machines;

  const isFirstRender = React.useRef(true);
  const prevCategoryIdRef = React.useRef(initialJob?.machineCategoryId || "");

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (prevCategoryIdRef.current !== selectedCategoryId) {
      prevCategoryIdRef.current = selectedCategoryId;
      const currentMachineId = watch("machineId");
      if (currentMachineId) {
        const isStillValid = machines.some(
          (m) => m.id === currentMachineId && m.categoryId === selectedCategoryId
        );
        if (!isStillValid) {
          setValue("machineId", "");
        }
      }
    }
  }, [selectedCategoryId, machines, setValue, watch]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requirements",
  });

  const onSubmit = async (data: JobFormData) => {
    try {
      // Find category ID based on selected machine
      const selectedMachine = machines.find((m) => m.id === data.machineId);
      if (!selectedMachine) {
        toast.error("Invalid machine selected");
        return;
      }

      const payload = {
        title: data.title,
        description: data.description,
        machineId: data.machineId,
        machineCategoryId: selectedMachine.categoryId,
        experienceLevel: data.experienceLevel,
        jobType: data.jobType,
        country: data.country,
        city: data.city,
        ...(data.yearsOfExperience !== undefined
          ? { yearsOfExperience: data.yearsOfExperience }
          : {}),
        ...(data.salaryRange ? { salaryRange: data.salaryRange } : {}),
        requirements:
          data.requirements?.map((r) => r.value).filter(Boolean) || [],
      };

      if (isEdit && initialJob) {
        await updateMutation.mutateAsync({
          id: initialJob.id,
          data: payload,
        });
        toast.success("Job updated successfully!");
      } else {
        await createMutation.mutateAsync({ data: payload });
        toast.success("Job posted successfully!");
      }

      router.push("/dashboard/company/jobs");
    } catch (error) {
      console.error(isEdit ? "Failed to update job:" : "Failed to create job:", error);
      setError("root", {
        type: "manual",
        message: getApiError(error, isEdit ? "Failed to update job." : "Failed to post job."),
      });
    }
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormError message={errors.root?.message} />

        <div className="space-y-4 border-b border-border/60 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-headline text-lg font-semibold">Basic Details</h3>
            {isEdit && initialJob && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Status:</span>
                <span
                  className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md border tracking-wide ${
                    initialJob.status === "PUBLISHED"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : initialJob.status === "DRAFT"
                        ? "bg-muted text-muted-foreground border-border/60"
                        : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                  }`}
                >
                  {initialJob.status}
                </span>
              </div>
            )}
          </div>

          {isEdit && (
            <p className="text-xs text-muted-foreground bg-muted/30 border border-border/40 rounded-xl p-3">
              Job status transitions (Publish, Close, Archive) are handled through the Actions menu on the Jobs list.
            </p>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Job Title *
            </label>
            <Input
              {...register("title")}
              placeholder="e.g. Senior CNC Operator"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Job Description *
            </label>
            <Textarea
              {...register("description")}
              placeholder="Describe the role and responsibilities..."
              rows={4}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 border-b border-border/60 pb-6">
          <h3 className="font-headline text-lg font-semibold">
            Machine & Experience
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Machine Category *"
              {...register("categoryId")}
              error={errors.categoryId?.message}
              options={
                isLoadingCategories
                  ? [{ value: "", label: "Loading..." }]
                  : [
                      { value: "", label: "Select category..." },
                      ...categories.map((c) => ({
                        value: c.id,
                        label: c.nameEn,
                      })),
                    ]
              }
            />

            <Select
              label="Primary Machine *"
              {...register("machineId")}
              error={errors.machineId?.message}
              disabled={!selectedCategoryId}
              options={
                isLoadingMachines
                  ? [{ value: "", label: "Loading..." }]
                  : [
                      { value: "", label: "Select machine..." },
                      ...filteredMachines.map((m) => ({
                        value: m.id,
                        label: m.nameEn,
                      })),
                    ]
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Experience Level *"
              {...register("experienceLevel")}
              error={errors.experienceLevel?.message}
              options={[
                { value: "ENTRY_LEVEL", label: "Entry Level (0-2 years)" },
                { value: "SKILLED", label: "Skilled (3-5 years)" },
                { value: "SENIOR", label: "Senior (6+ years)" },
                { value: "EXPERT", label: "Expert (10+ years)" },
              ]}
            />

            <Select
              label="Job Type *"
              {...register("jobType")}
              error={errors.jobType?.message}
              options={[
                { value: "FULL_TIME", label: "Full Time" },
                { value: "PART_TIME", label: "Part Time" },
                { value: "CONTRACT", label: "Contract" },
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Minimum Years of Experience
            </label>
            <Input
              {...register("yearsOfExperience")}
              type="number"
              min="0"
              className={errors.yearsOfExperience ? "border-red-500" : ""}
            />
            {errors.yearsOfExperience && (
              <p className="text-xs text-red-500 mt-1">
                {errors.yearsOfExperience.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4 border-b border-border/60 pb-6">
          <h3 className="font-headline text-lg font-semibold">
            Location & Compensation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CountryCitySelect
              country={watch("country")}
              city={watch("city")}
              onCountryChange={(val) => {
                setValue("country", val, { shouldValidate: true });
                setValue("city", "", { shouldValidate: true });
              }}
              onCityChange={(val) =>
                setValue("city", val, { shouldValidate: true })
              }
              countryLabel="Country *"
              cityLabel="City *"
              allCountriesOptionLabel="Select a country..."
              allCitiesOptionLabel="Select a city..."
              countryError={errors.country?.message}
              cityError={errors.city?.message}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Salary Range (Optional)
            </label>
            <Input
              {...register("salaryRange")}
              placeholder="e.g. $50k - $70k"
              className={errors.salaryRange ? "border-red-500" : ""}
            />
          </div>
        </div>

        <div className="space-y-4 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-lg font-semibold">
              Requirements / Bullet Points
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ value: "" })}
              className="gap-1.5"
              leftIcon={<MdAdd />}
            >
              Add Requirement
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="flex-1 space-y-1">
                  <Input
                    {...register(`requirements.${index}.value` as const)}
                    placeholder="e.g. Must know G-Code..."
                    className={
                      errors.requirements?.[index]?.value
                        ? "border-red-500"
                        : ""
                    }
                  />
                  {errors.requirements?.[index]?.value && (
                    <p className="text-xs text-red-500">
                      {errors.requirements[index]?.value?.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  title="Remove"
                  onClick={() => remove(index)}
                  className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <MdDeleteOutline className="text-xl" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-border/60">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEdit
                ? "Saving..."
                : "Posting..."
              : isEdit
                ? "Save Changes"
                : "Post Job"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;
