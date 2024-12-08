import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, icon, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {/* Label */}
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-semibold text-gray-700"
          >
            {label}
          </label>
        )}

        {/* Input Wrapper */}
        <div className="relative">
          {/* Icon */}
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {icon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            className={`
              block w-full rounded-md border bg-white shadow-sm transition duration-200 
              ${icon ? "pl-10" : "pl-4"} pr-4 py-2
              text-gray-900 placeholder-gray-400
              focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500
              disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500
              ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300"}
              ${className}
            `}
            {...props}
          />
        </div>

        {/* Error Message */}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
