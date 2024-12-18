import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type TabItem = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  variant?: "filled" | "outlined" | "minimal" | "pills";
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "neutral";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  vertical?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Tabs = ({
  items,
  value,
  onChange,
  variant = "filled",
  color = "primary",
  size = "md",
  fullWidth = false,
  vertical = false,
  disabled: groupDisabled = false,
  className,
}: TabsProps) => {
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState({
    width: 0,
    height: 0,
    left: 0,
    top: 0,
  });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialRender, setIsInitialRender] = useState(true);

  const colorClasses = {
    primary: {
      active: "text-white",
      inactive: "text-blue-700 hover:text-blue-900",
      container: "bg-white shadow-lg shadow-blue-500/5",
      indicator: "bg-gradient-to-r from-blue-500 to-blue-600",
    },
    secondary: {
      active: "text-white",
      inactive: "text-purple-700 hover:text-purple-900",
      container: "bg-white shadow-lg shadow-purple-500/5",
      indicator: "bg-gradient-to-r from-purple-500 to-purple-600",
    },
    success: {
      active: "text-white",
      inactive: "text-emerald-700 hover:text-emerald-900",
      container: "bg-white shadow-lg shadow-emerald-500/5",
      indicator: "bg-gradient-to-r from-emerald-500 to-emerald-600",
    },
    danger: {
      active: "text-white",
      inactive: "text-rose-700 hover:text-rose-900",
      container: "bg-white shadow-lg shadow-rose-500/5",
      indicator: "bg-gradient-to-r from-rose-500 to-rose-600",
    },
    warning: {
      active: "text-white",
      inactive: "text-amber-700 hover:text-amber-900",
      container: "bg-white shadow-lg shadow-amber-500/5",
      indicator: "bg-gradient-to-r from-amber-500 to-amber-600",
    },
    neutral: {
      active: "text-white",
      inactive: "text-gray-700 hover:text-gray-900",
      container: "bg-white shadow-lg shadow-gray-500/5",
      indicator: "bg-gradient-to-r from-gray-700 to-gray-800",
    },
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-2.5 text-lg",
  };

  useEffect(() => {
    const updateIndicator = () => {
      const activeTab =
        tabsRef.current[items.findIndex((item) => item.value === value)];
      if (!activeTab || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const activeTabRect = activeTab.getBoundingClientRect();

      const newStyle = {
        width: activeTabRect.width,
        height: activeTabRect.height,
        left: activeTabRect.left - containerRect.left,
        top: activeTabRect.top - containerRect.top,
      };

      console.log(newStyle);

      setActiveIndicatorStyle(() => {
        if (isInitialRender) {
          setIsInitialRender(false);
          return newStyle;
        }
        return {
          ...newStyle,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        };
      });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [value, items, isInitialRender]);

  const containerClasses = cn(
    "relative rounded-xl p-1.5",
    vertical ? "flex-col" : "flex-row",
    colorClasses[color].container,
    fullWidth ? "w-full" : "w-fit",
    "transition-all duration-300 ease-in-out",
    className,
  );

  const tabClasses = cn(
    "relative outline-none rounded-lg z-10",
    "transition-colors duration-200",
    vertical && "justify-center w-full",
    fullWidth && "flex-1",
    sizeClasses[size],
  );

  return (
    <div ref={containerRef} role="tablist" className={containerClasses}>
      {/* Active Tab Indicator */}
      <div
        className={cn(
          "absolute rounded-lg z-0",
          colorClasses[color].indicator,
          "transition-all duration-300 ease-in-out shadow-lg",
          variant === "pills" ? "rounded-full" : "rounded-lg",
        )}
        style={{
          width: activeIndicatorStyle.width,
          height: activeIndicatorStyle.height,
          transform: `translate(${activeIndicatorStyle.left}px, ${activeIndicatorStyle.top}px)`,
        }}
      />

      <div
        className={cn(
          "relative z-10 flex",
          vertical ? "flex-col" : "flex-row",
          "gap-1",
        )}
      >
        {items.map((item, index) => {
          const isActive = value === item.value;
          const isDisabled = groupDisabled || item.disabled;

          return (
            <button
              key={item.value}
              ref={(el) => (tabsRef.current[index] = el)}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              onClick={() => !isDisabled && onChange(item.value)}
              className={cn(
                tabClasses,
                isActive
                  ? colorClasses[color].active
                  : colorClasses[color].inactive,
                isDisabled && "opacity-50 cursor-not-allowed",
                "group",
              )}
            >
              {item.icon && (
                <span
                  className={cn(
                    "inline-flex items-center transform transition-transform duration-200 ease-out group-hover:scale-110",
                    item.label && "mr-2",
                  )}
                >
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
