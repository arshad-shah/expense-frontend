import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  helperText?: string;
  isLoading?: boolean;
  variant?: "default" | "filled" | "outline";
  fullWidth?: boolean;
  inputSize?: "sm" | "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className = "", 
    label, 
    error, 
    icon, 
    helperText,
    isLoading = false,
    variant = "default",
    fullWidth = true,
    inputSize = "md",
    ...props 
  }, ref) => {
    const variants = {
      default: "border-gray-200 bg-white hover:border-indigo-400 focus:border-indigo-500 focus:ring-indigo-500/20",
      filled: "border-transparent bg-gray-50 hover:bg-gray-100/80 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/20",
      outline: "border-2 border-gray-200 bg-transparent hover:border-indigo-400 focus:border-indigo-500 focus:ring-indigo-500/20"
    };

    const sizes = {
      sm: "h-8 text-sm",
      md: "h-10 text-sm",
      lg: "h-12 text-base"
    };

    const iconSizes = {
      sm: "h-4 w-4",
      md: "h-4 w-4",
      lg: "h-5 w-5"
    };

    return (
      <div className={cn("space-y-2", fullWidth ? "w-full" : "w-auto")}>
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={props.id}
              className="block text-sm font-medium text-gray-700"
            >
              {label}
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

        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={cn(iconSizes[inputSize])}
              >
                {icon}
              </motion.div>
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              "block w-full rounded-lg border transition-all duration-200",
              "text-gray-900 placeholder:text-gray-400/70",
              "focus:outline-none focus:ring-4",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200",
              icon ? "pl-10" : "pl-4",
              "pr-4",
              variants[variant],
              sizes[inputSize],
              error && "!border-red-500 !ring-red-500/20 focus:!border-red-500 focus:!ring-red-500/20",
              className
            )}
            {...props}
          />
        </div>

        <AnimatePresence mode="wait">
          {(error || helperText) && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {error ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-600 flex items-center gap-1.5"
                >
                  <svg
                    className="h-3.5 w-3.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </motion.p>
              ) : helperText ? (
                <p className="text-sm text-gray-500">{helperText}</p>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = "Input";