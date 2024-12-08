import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check } from "lucide-react";
import { motion } from "framer-motion";

interface SelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  children: React.ReactNode;
}

export const Select = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  SelectProps
>(({ children, ...props }, ref) => (
  <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>
));

export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className = "", children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={`
      flex h-10 w-full items-center justify-between rounded-lg border 
      border-gray-200 bg-white px-3.5 py-2 text-sm text-gray-900
      shadow-sm hover:border-indigo-400 hover:bg-gray-50/50
      focus:outline-none focus:ring-2 focus:ring-indigo-500 
      focus:ring-offset-2 disabled:cursor-not-allowed 
      disabled:opacity-50 disabled:hover:border-gray-200
      transition duration-200 ease-out gap-2
      ${className}
    `}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon>
      <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));

export const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(({ className = "", ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    className={`truncate text-sm ${className}`}
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
        className={`
          relative z-50 min-w-[8rem] max-w-[--radix-select-trigger-width] overflow-hidden rounded-lg border border-gray-200 
          bg-white shadow-lg backdrop-blur-sm
          data-[side=bottom]:slide-in-from-top-2 
          data-[side=left]:slide-in-from-right-2
          data-[side=right]:slide-in-from-left-2
          data-[side=top]:slide-in-from-bottom-2
          ${className}
        `}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={`p-1.5 ${
            position === "popper"
            ? "w-full min-w-[var(--radix-select-trigger-width)]"
            : ""
          } max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300`}
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
    className={`py-1.5 ${className}`}
    {...props}
  />
));

export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className = "", children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={`
      relative flex w-full select-none items-center rounded-md 
      px-8 py-1.5 text-sm text-gray-700 outline-none
      hover:bg-indigo-50 hover:text-indigo-900
      focus:bg-indigo-100 focus:text-indigo-900
      disabled:pointer-events-none disabled:opacity-50
      transition duration-200 ease-out cursor-pointer
      ${className}
    `}
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
    className={`px-2 py-1.5 text-sm font-semibold text-gray-900 ${className}`}
    {...props}
  />
));