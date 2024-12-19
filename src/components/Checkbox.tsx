import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Label } from "./Label";

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  id?: string;
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className = "", label, ...props }, ref) => (
  <div className="flex items-center gap-2">
    <CheckboxPrimitive.Root
      ref={ref}
      className={`
        peer h-5 w-5 shrink-0 rounded-md border border-gray-200 bg-white
        transition-all duration-200 ease-out shadow-sm 
        focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-indigo-500 focus-visible:ring-offset-2 
        hover:border-indigo-400 hover:bg-indigo-50
        active:bg-indigo-100 disabled:cursor-not-allowed 
        disabled:opacity-50 disabled:hover:border-gray-200
        data-[state=checked]:border-indigo-600 
        data-[state=checked]:bg-indigo-600 
        data-[state=checked]:text-white
        ${className}
      `}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    {label && <Label>{label}</Label>}
  </div>
));

Checkbox.displayName = "Checkbox";
