import React from "react";
import { cn } from "@/lib/utils";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  variant?: "default" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ 
    className, 
    variant = "default", 
    size = "md",
    children, 
    required = false,
    ...props 
  }, ref) => {
    const variants = {
      default: "text-gray-700",
      secondary: "text-gray-500",
      ghost: "text-gray-400",
    };

    const sizes = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    };

    return (
      <label
        ref={ref}
        className={cn(
          "block font-medium transition-colors duration-200",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";