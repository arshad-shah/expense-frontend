import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react"; // Importing Lucide icons
import { motion } from "framer-motion"; // Importing Framer Motion for animations

// Root Select Component
interface SelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  children: React.ReactNode;
}

export const Select = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  SelectProps
>(({ children, ...props }, ref) => (
  <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>
));

// Select Trigger Component
export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className = "", children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={`flex h-12 w-full items-center justify-between rounded-lg border border-gray-300 
      bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-50 focus:outline-none 
      focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed 
      disabled:opacity-50 transition duration-150 ease-in-out
      ${className}
    `}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon>
      <ChevronDown className="h-5 w-5 text-gray-400" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));

// Select Value Component
export const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ className = "", ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    className={`truncate text-sm font-medium ${className}`}
    {...props}
  />
));

// Select Content Component
export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className = "", children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <SelectPrimitive.Content
        ref={ref}
        className={`relative z-50 rounded-lg border border-gray-200 bg-white shadow-xl
          ${className}
        `}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={`p-2 ${
            position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          }`}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </motion.div>
  </SelectPrimitive.Portal>
));

// Select Group Component
export const SelectGroup = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group>
>(({ className = "", ...props }, ref) => (
  <SelectPrimitive.Group
    ref={ref}
    className={`py-2 ${className}`}
    {...props}
  />
));

// Select Item Component
export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className = "", children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={`relative flex w-full cursor-pointer select-none items-center 
      rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 
      focus:bg-teal-100 focus:text-teal-900 transition duration-150 ease-in-out
      ${className}
    `}
    {...props}
  >
    <span className="absolute left-3 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4 text-teal-500" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
