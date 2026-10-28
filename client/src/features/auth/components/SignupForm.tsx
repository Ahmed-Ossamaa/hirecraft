"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Button, Select } from "@/shared/components/ui";
import { CountryCitySelect } from "@/shared/components/ui/CountryCitySelect";
import { INDUSTRY_SECTOR_OPTIONS } from "@/shared/constants/employer-options";
import { useSignup } from "@/shared/api/generated/auth/auth";
import { toast } from "sonner";
import { FormError } from "@/shared/components/ui/FormError";
import { getApiError } from "@/shared/utils/error";

const signupSchema = z
  .object({
    firstName: z.string().min(2, "Min 2 characters").max(30),
    lastName: z.string().min(2, "Min 2 characters").max(30),
    email: z.string().email("Invalid email"),
    phoneNumber: z.string().min(11, "Min 11 digits"),
    password: z.string().min(8, "Min 8 characters").max(50),
    confirmPassword: z.string().min(8, "Min 8 characters"),
    userType: z.enum(["CANDIDATE", "EMPLOYER"]),
    companyData: z
      .object({
        name: z.string().optional(),
        country: z.string().optional(),
        city: z.string().optional(),
        industry: z.string().optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
    }

    if (data.userType === "EMPLOYER") {
      if (!data.companyData?.name || data.companyData.name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Company Name is required",
          path: ["companyData", "name"],
        });
      }
      if (
        !data.companyData?.country ||
        data.companyData.country.trim() === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Country is required",
          path: ["companyData", "country"],
        });
      }
      if (
        !data.companyData?.industry ||
        data.companyData.industry.trim() === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Industry is required",
          path: ["companyData", "industry"],
        });
      }
    }
  });

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSuccess?: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess }) => {
  const [userType, setUserType] = useState<"CANDIDATE" | "EMPLOYER">(
    "CANDIDATE",
  );
  const [employerStep, setEmployerStep] = useState<1 | 2>(1);

  const signupMutation = useSignup();

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
    defaultValues: {
      userType: "CANDIDATE",
    },
  });

  const handleUserTypeChange = (type: "CANDIDATE" | "EMPLOYER") => {
    setUserType(type);
    setValue("userType", type);
    if (type === "CANDIDATE") {
      setEmployerStep(1);
    }
  };

  const selectedCountry = watch("companyData.country") || "";
  const selectedCity = watch("companyData.city") || "";

  const handleEmployerNext = async () => {
    const isValid = await trigger([
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "password",
      "confirmPassword",
    ]);
    if (isValid) {
      setEmployerStep(2);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        userType: data.userType,
        ...(data.userType === "EMPLOYER" && data.companyData
          ? { companyData: data.companyData as any }
          : {}),
      };

      await signupMutation.mutateAsync({ data: payload });

      toast.success(
        "Registration successful! Please verify your email and sign in.",
      );
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 3000);
    } catch (error) {
      console.error("Signup failed:", error);
      setError("root", {
        type: "manual",
        message: getApiError(error, "Failed to register. Please try again."),
      });
    }
  };

  return (
    <div className="w-full h-full  pr-1 flex flex-col justify-center">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase text-primary tracking-wider font-semibold">
            Machine Operators & Technicians
          </span>
          <span className="text-[10px] font-mono bg-card-hover text-primary px-2 py-0.5 rounded border border-primary/30">
            Profile Setup
          </span>
        </div>
        <h2 className="font-headline text-2xl sm:text-3xl text-foreground font-medium tracking-tight">
          Create Technically Account
        </h2>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          Direct hiring pipeline to premier millwork ateliers, tooling hubs, and
          architectural workshops.
        </p>

        {/* User Type Switcher */}
        <div className="mt-2 p-1 rounded-xl bg-input border border-border grid grid-cols-2 gap-1">
          <Button
            type="button"
            onClick={() => handleUserTypeChange("CANDIDATE")}
            variant={userType === "CANDIDATE" ? "primary" : "ghost"}
            className="py-1.5"
          >
            Job Seeker / Technician
          </Button>
          <Button
            type="button"
            onClick={() => handleUserTypeChange("EMPLOYER")}
            variant={userType === "EMPLOYER" ? "primary" : "ghost"}
            className="py-1.5"
          >
            Employer
          </Button>
        </div>

        {/* for Employer */}
        {userType === "EMPLOYER" && (
          <div className="mt-3 p-2 rounded-lg bg-card-hover border border-border flex items-center justify-between text-[11px] font-mono">
            <span
              className={`flex items-center gap-1.5 ${employerStep === 1 ? "text-foreground font-semibold" : "text-muted-foreground"}`}
            >
              <span
                className={`w-5 h-5 rounded-full font-bold flex items-center justify-center text-[10px] ${employerStep === 1 ? "bg-primary text-black" : "bg-input border border-border text-muted-foreground"}`}
              >
                1
              </span>
              <span>Credentials</span>
            </span>
            <span className="text-muted-foreground">→</span>
            <span
              className={`flex items-center gap-1.5 ${employerStep === 2 ? "text-foreground font-semibold" : "text-muted-foreground"}`}
            >
              <span
                className={`w-5 h-5 rounded-full font-bold flex items-center justify-center text-[10px] ${employerStep === 2 ? "bg-primary text-black" : "bg-input border border-border text-muted-foreground"}`}
              >
                2
              </span>
              <span>Company Details</span>
            </span>
          </div>
        )}

        <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>

          {/* 1st basic info */}
          <div
            className={
              userType === "EMPLOYER" && employerStep === 2
                ? "hidden"
                : "space-y-3"
            }
           >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="Ahmed"
                {...register("firstName")}
                error={errors.firstName?.message}
              />
              <Input
                label="Last Name"
                placeholder="Ossama"
                {...register("lastName")}
                error={errors.lastName?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Email"
                type="email"
                placeholder="name@domain.pro"
                {...register("email")}
                error={errors.email?.message}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 019-2831"
                {...register("phoneNumber")}
                error={errors.phoneNumber?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Password"
                type="password"
                placeholder="Min 8 characters"
                {...register("password")}
                error={errors.password?.message}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />
            </div>

            <div className="pt-2">
              {userType === "CANDIDATE" ? (
                <Button type="submit" fullWidth disabled={isSubmitting}>
                  Create Candidate Profile
                </Button>
              ) : (
                <Button type="button" fullWidth onClick={handleEmployerNext}>
                  Continue to Company Details
                </Button>
              )}
            </div>
          </div>

          {/* 2nd  Employer Organization flow */}
          <div
            className={
              userType === "EMPLOYER" && employerStep === 2
                ? "space-y-3"
                : "hidden"
            }
          >
            <Input
              label="Company Name"
              placeholder="e.g. Technically.co"
              {...register("companyData.name")}
              error={errors.companyData?.name?.message}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CountryCitySelect
                countryLabel="Country"
                cityLabel="City"
                country={selectedCountry}
                city={selectedCity}
                onCountryChange={(country) =>
                  setValue("companyData.country", country, {
                    shouldValidate: true,
                  })
                }
                onCityChange={(city) =>
                  setValue("companyData.city", city, { shouldValidate: true })
                }
                countryError={errors.companyData?.country?.message}
                cityError={errors.companyData?.city?.message}
              />
            </div>

            <Select
              label="Industry"
              {...register("companyData.industry")}
              error={errors.companyData?.industry?.message}
              options={INDUSTRY_SECTOR_OPTIONS}
            />

            <div className="pt-2 flex items-center gap-3 mb-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEmployerStep(1)}
                className="w-1/3"
              >
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-2/3">
                {isSubmitting
                  ? "Registering..."
                  : "Complete Employer Registration"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-1 pt-2 border-t border-border/40 text-center text-[10px] text-muted-foreground shrink-0 pb-2">
        By continuing, you agree to Technically&apos;s{" "}
        <a href="terms" className="underline hover:text-primary transition">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="privacy" className="underline hover:text-primary transition">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
};
