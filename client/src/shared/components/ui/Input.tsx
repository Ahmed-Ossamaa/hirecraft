"use client";

import React, { useState } from "react";
import { cn } from "@/shared/utils/utils";
import { FiEye, FiEyeOff } from "react-icons/fi";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  showPasswordToggle?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      error,
      type,
      showPasswordToggle = true,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === "password";
    const canToggle = isPasswordType && showPasswordToggle;

    const inputType = canToggle ? (showPassword ? "text" : "password") : type;

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "w-full bg-input border rounded-xl px-3.5 py-2.5 text-xs  focus:outline-none transition",
              "text-foreground",
              "placeholder:text-muted-foreground",
              canToggle && "pr-10",
              error
                ? ["border-red-500/50", "focus:ring-red-500/50"]
                : ["border-border", "focus:border-primary", "focus:ring-primary"],
              className,
            )}
            {...props}
          />
          {canToggle && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={props.disabled}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors p-1 rounded-md focus:outline-none cursor-pointer select-none",
                props.disabled && "opacity-50 pointer-events-none",
              )}
            >
              {showPassword ? (
                <FiEyeOff className="text-sm" />
              ) : (
                <FiEye className="text-sm" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-[10px] text-red-400 font-medium">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

