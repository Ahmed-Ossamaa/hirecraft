import React from "react";
import { cn } from "@/shared/utils/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "font-medium transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none",
          // Sizes
          {
            "py-1.5 px-3 rounded-lg text-xs":
              size === "sm" && variant !== "ghost" && variant !== "link",
            "py-2.5 px-4 rounded-xl text-xs":
              size === "md" && variant !== "ghost" && variant !== "link",
            "py-3 px-6 rounded-xl text-sm":
              size === "lg" && variant !== "ghost" && variant !== "link",
            "p-2 rounded-xl text-xs":
              size === "icon" && variant !== "ghost" && variant !== "link",
          },
          // Variants
          {
            "bg-primary hover:bg-primary-hover disabled:hover:bg-primary text-background shadow-md shadow-primary/30":
              variant === "primary",
            "bg-card-hover hover:bg-border disabled:hover:bg-card-hover text-muted-foreground hover:text-foreground disabled:hover:text-muted-foreground border border-border shadow-sm":
              variant === "secondary",
            "bg-transparent border border-primary text-primary hover:bg-primary/10 disabled:hover:bg-transparent shadow-sm":
              variant === "outline",
            "text-muted-foreground hover:text-foreground disabled:hover:text-muted-foreground hover:bg-card-hover disabled:hover:bg-transparent py-2 px-3 gap-1.5 text-xs rounded-lg":
              variant === "ghost",
            "text-primary hover:text-primary-hover disabled:hover:text-primary gap-1 text-xs":
              variant === "link",
            "bg-red-500 hover:bg-red-600 disabled:hover:bg-red-500 text-white":
              variant === "danger",
          },
          // Full width
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {leftIcon && (
          <span className="flex items-center justify-center shrink-0">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className="flex items-center justify-center shrink-0">
            {rightIcon}
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
