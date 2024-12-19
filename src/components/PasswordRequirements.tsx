import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { PASSWORD_REQUIREMENTS } from "@/constants";

interface PasswordRequirement {
  label: string;
  validator: (password: string) => boolean;
}

interface PasswordRequirementsProps {
  /** The current password string to validate */
  password: string;
  /** Array of password requirements with labels and validator functions */
  requirements?: PasswordRequirement[];
  /** Controls the visibility of the requirements panel */
  isVisible: boolean;
  /** Optional class name for additional styling */
  className?: string;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  requirements = PASSWORD_REQUIREMENTS,
  isVisible,
  className,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 shadow-sm backdrop-blur-xl p-5 mt-2",
            className,
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
            <p className="text-sm font-semibold text-gray-900">
              Password Requirements
            </p>
          </div>

          <ul className="space-y-3">
            {requirements.map((requirement, index) => {
              const isValid = requirement.validator(password);
              return (
                <li
                  key={index}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                    isValid ? "bg-green-100/50" : "bg-gray-50/50",
                  )}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isValid ? [1.4, 1] : 1,
                      rotate: isValid ? [0, 20, 0] : 0,
                    }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    {isValid ? (
                      <div className="rounded-full bg-green-200 p-1">
                        <Check className="h-3 w-3 text-green-800" />
                      </div>
                    ) : (
                      <div className="rounded-full bg-gray-100 p-1">
                        <X className="h-3 w-3 text-gray-400" />
                      </div>
                    )}
                  </motion.div>
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors duration-200",
                      isValid ? "text-green-800" : "text-gray-600",
                    )}
                  >
                    {requirement.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PasswordRequirements;
