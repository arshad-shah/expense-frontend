import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className = "", ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={`
      peer h-5 w-5 shrink-0 rounded-md border border-gray-300 bg-white
      transition-all duration-200 ease-in-out shadow-sm focus-visible:outline-none 
      focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 
      hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50
      data-[state=checked]:border-teal-600 data-[state=checked]:bg-teal-600 
      data-[state=checked]:text-white
      ${className}
    `}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className="flex items-center justify-center text-current"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
