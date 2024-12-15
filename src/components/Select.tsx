import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Enhanced types
type SelectSize = "sm" | "md" | "lg";
type SelectVariant = "default" | "outline" | "ghost" | "secondary" | "error";

interface SelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  children: React.ReactNode;
}

interface TriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  size?: SelectSize;
  variant?: SelectVariant;
  error?: string;
  label?: string;
  helperText?: string;
  fullWidth?: boolean;
  required?: boolean;
  isLoading?: boolean;
}

const sizeStyles: Record<SelectSize, string> = {
  sm: "h-8 text-sm",
  md: "h-10 text-sm",
  lg: "h-12 text-base"
};

const paddingStyles: Record<SelectSize, string> = {
  sm: "px-2.5",
  md: "px-3.5",
  lg: "px-4"
};

const variantStyles: Record<SelectVariant, string> = {
  default: `
    border-gray-200 bg-white text-gray-900
    hover:border-indigo-400 hover:bg-gray-50/50
    focus:border-indigo-500 focus:ring-indigo-500
    disabled:bg-gray-50
  `,
  outline: `
    border-2 border-indigo-600 bg-transparent text-indigo-600
    hover:bg-indigo-50 hover:border-indigo-700
    focus:border-indigo-700 focus:ring-indigo-500
    disabled:border-indigo-300 disabled:text-indigo-300
  `,
  ghost: `
    border-transparent bg-transparent text-gray-700
    hover:bg-gray-100 hover:text-gray-900
    focus:bg-gray-100 focus:ring-gray-500
    disabled:bg-transparent
  `,
  secondary: `
    border-gray-200 bg-gray-100 text-gray-900
    hover:bg-gray-200 hover:border-gray-300
    focus:border-gray-400 focus:ring-gray-400
    disabled:bg-gray-50
  `,
  error: `
    border-red-300 bg-red-50 text-red-900
    hover:border-red-400 hover:bg-red-100
    focus:border-red-500 focus:ring-red-500
    disabled:bg-red-50
  `
};
export const Select = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  SelectProps
>(({ children, ...props }) => (
  <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>
));

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  TriggerProps
>(({ 
  className = "", 
  children, 
  size = "md",
  variant = "default",
  error,
  label,
  helperText,
  fullWidth = true,
  required = false,
  isLoading = false,
  ...props 
}, ref) => (
  <div className={cn("space-y-2", fullWidth ? "w-full" : "w-auto")}>
    {label && (
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {isLoading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-4 w-4 rounded-full border-2 border-gray-100 border-t-indigo-600"
          />
        )}
      </div>
    )}

    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        // Base styles
        "inline-flex items-center justify-between rounded-lg",
        "border shadow-sm",
        "focus:outline-none focus:ring-4",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition duration-200 ease-out",
        // Size variations
        sizeStyles[size],
        paddingStyles[size],
        // Variant styles
        error ? variantStyles.error : variantStyles[variant],
        // Width control
        fullWidth ? "w-full" : "w-auto",
        className
      )}
      {...props}
    >
      {children}
      <div className="flex items-center gap-1">
        {error && (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}
        <SelectPrimitive.Icon>
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform duration-200 ease-out",
            error ? "text-red-500" : "text-gray-500",
            "group-data-[state=open]:rotate-180"
          )} />
        </SelectPrimitive.Icon>
      </div>
    </SelectPrimitive.Trigger>

    <AnimatePresence mode="wait">
      {(error || helperText) && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {error ? (
            <p className="text-sm text-red-600 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{error}</span>
            </p>
          ) : helperText ? (
            <p className="text-sm text-gray-500">{helperText}</p>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
));
export const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ className = "", ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    className={cn("truncate text-sm", className)}
    {...props}
  />
));

export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className = "", children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <SelectPrimitive.Content
        ref={ref}
        className={cn(
          "relative z-50 min-w-[8rem] overflow-hidden",
          "rounded-lg border border-gray-200",
          "bg-white shadow-lg",
          "data-[side=bottom]:translate-y-1",
          "data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            "p-1.5",
            position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]",
            "max-h-[300px]",
            "overflow-y-auto",
            "scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent",
            "hover:scrollbar-thumb-gray-300"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </motion.div>
  </SelectPrimitive.Portal>
));

export const SelectGroup = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group>
>(({ className = "", ...props }, ref) => (
  <SelectPrimitive.Group
    ref={ref}
    className={cn(
      "py-1.5",
      "relative",
      "after:absolute after:bottom-0 after:left-2 after:right-2",
      "after:h-px after:bg-gray-100",
      "last:after:hidden",
      className
    )}
    {...props}
  />
));

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className = "", children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full select-none items-center",
      "rounded-md px-8 py-1.5 text-sm text-gray-700",
      "outline-none cursor-pointer",
      "hover:bg-indigo-50 hover:text-indigo-900",
      "focus:bg-indigo-100 focus:text-indigo-900",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "transition duration-200 ease-out",
      className
    )}
    {...props}
  >
    <span className="absolute left-2.5 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-indigo-600" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));

export const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className = "", ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5",
      "text-sm font-semibold text-gray-900",
      "select-none",
      className
    )}
    {...props}
  />
));

Select.displayName = "Select";
SelectTrigger.displayName = "SelectTrigger";
SelectValue.displayName = "SelectValue";
SelectContent.displayName = "SelectContent";