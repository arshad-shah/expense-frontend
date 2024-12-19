import React, { forwardRef } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "./Label";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
  isLoading?: boolean;
  variant?: "default" | "filled" | "outline" | "minimal";
  fullWidth?: boolean;
  inputSize?: "sm" | "md" | "lg";
  showRequired?: boolean;
  requiredStyle?: "subtle" | "prominent" | "animated";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      helperText,
      isLoading,
      variant = "default",
      fullWidth = false,
      inputSize = "md",
      className,
      required,
      disabled,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "h-8 text-sm",
      md: "h-10 text-base",
      lg: "h-12 text-lg",
    };

    const variantClasses = {
      default:
        "border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
      filled:
        "border-0 bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20",
      outline:
        "bg-transparent border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
      minimal:
        "border-b-2 border-gray-200 focus:border-blue-500 rounded-none bg-transparent px-0",
    };

    return (
      <div
        className={cn("relative space-y-1", fullWidth && "w-full", className)}
      >
        {label && (
          <Label className="block text-sm font-medium text-gray-700">
            {label}
          </Label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled || isLoading}
            required={required}
            className={cn(
              "w-full rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-400",
              "transition-all duration-200 ease-in-out",
              "focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              variantClasses[variant],
              sizeClasses[inputSize],
              icon && "pl-10",
              isLoading && "pr-10",
              error &&
                "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              fullWidth && "w-full",
            )}
            {...props}
          />

          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}

          {error && !isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
        </div>

        {(helperText || error) && (
          <p
            className={cn(
              "text-sm transition-all duration-200",
              error ? "text-red-500" : "text-gray-500",
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
