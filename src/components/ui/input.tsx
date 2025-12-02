"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  onChange?: (value: string) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      icon,
      iconPosition = "left",
      required,
      disabled,
      onChange,
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-text-primary">
            {label} {required && <span className="text-error">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
              {icon}
            </div>
          )}

          <input
            type={type}
            ref={ref}
            disabled={disabled}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(
              "w-full px-4 py-3 rounded-xl",
              "bg-bg-secondary border text-text-primary placeholder:text-text-tertiary",
              "focus:outline-none focus:ring-2 transition-all",
              icon && iconPosition === "left" && "pl-12",
              icon && iconPosition === "right" && "pr-12",
              error
                ? "border-error focus:border-error focus:ring-error/20"
                : "border-border-default focus:border-primary-400 focus:ring-primary-400/20",
              disabled && "opacity-50 cursor-not-allowed",
              className
            )}
            {...props}
          />

          {icon && iconPosition === "right" && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-error flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
