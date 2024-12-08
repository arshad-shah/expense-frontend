import { ButtonHTMLAttributes, forwardRef } from "react";

// Custom Button Component
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "danger"
    | "success"
    | "warning"
    | "info"
    | "link";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 focus-visible:ring-indigo-500",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus-visible:ring-gray-400",
      outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 focus-visible:ring-indigo-500",
      danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500",
      success: "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus-visible:ring-green-500",
      warning: "bg-yellow-500 text-white hover:bg-yellow-600 active:bg-yellow-700 focus-visible:ring-yellow-400",
      info: "bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700 focus-visible:ring-teal-400",
      link: "text-indigo-600 hover:underline focus-visible:ring-indigo-500",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
