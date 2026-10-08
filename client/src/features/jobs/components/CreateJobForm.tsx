"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Button, Textarea, Select } from "@/shared/components/ui";
import { useCreateJob } from "@/features/jobs/api/useJobMutations";
import { useGetMachines } from "@/shared/api/generated/machines/machines";
import { useGetMachineCategories } from "@/shared/api/generated/machine-categories/machine-categories";
import { Machine, MachineCategory } from "@/shared/api/generated/model";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MdAdd, MdDeleteOutline } from "react-icons/md";
import { FormError } from "@/shared/components/ui/FormError";
import { getApiError } from "@/shared/utils/error";
import { CountryCitySelect } from "@/shared/components/ui/CountryCitySelect";

const createJobSchema = z.object({
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

type CreateJobFormData = z.infer<typeof createJobSchema>;

export const CreateJobForm: React.FC = () => {
  const router = useRouter();
  const createMutation = useCreateJob();
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
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      machineId: "",
      experienceLevel: "SKILLED",
      jobType: "FULL_TIME",
      country: "",
      city: "",
      salaryRange: "",
      yearsOfExperience: 0,
      requirements: [{ value: "" }],
    },
  });

  const selectedCategoryId = watch("categoryId");
  const filteredMachines = selectedCategoryId
    ? machines.filter((m) => m.categoryId === selectedCategoryId)
    : machines;

  React.useEffect(() => {
    setValue("machineId", "");
  }, [selectedCategoryId, setValue]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "requirements",
  });

  const onSubmit = async (data: CreateJobFormData) => {
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
        ...(data.yearsOfExperience
          ? { yearsOfExperience: data.yearsOfExperience }
          : {}),
        ...(data.salaryRange ? { salaryRange: data.salaryRange } : {}),
        requirements:
          data.requirements?.map((r) => r.value).filter(Boolean) || [],
      };

      await createMutation.mutateAsync({ data: payload });
      toast.success("Job posted successfully!");
      router.push("/dashboard/company/jobs");
    } catch (error) {
      console.error("Failed to create job:", error);
      setError("root", {
        type: "manual",
        message: getApiError(error, "Failed to post job."),
      });
    }
  };

  return (
    <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormError message={errors.root?.message} />

        <div className="space-y-4 border-b border-border/60 pb-6">
          <h3 className="font-headline text-lg font-semibold">Basic Details</h3>

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
              countryCode={watch("country")}
              cityName={watch("city")}
              onCountryChange={(code) => {
                setValue("country", code, { shouldValidate: true });
                setValue("city", "", { shouldValidate: true }); // reset city on country change
              }}
              onCityChange={(city) =>
                setValue("city", city, { shouldValidate: true })
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
            {isSubmitting ? "Posting..." : "Post Job"}
          </Button>
        </div>
      </form>
    </div>
  );
};
