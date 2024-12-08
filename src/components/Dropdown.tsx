import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export type DropdownItemType = {
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
  description?: string;
};

interface DropdownProps {
  show: boolean;
  onClose: () => void;
  items: DropdownItemType[];
  position?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  width?: 'auto' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Dropdown = ({
  show,
  onClose,
  items,
  position = 'right',
  size = 'md',
  width = 'sm',
  className,
}: DropdownProps) => {
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && show) {
        onClose();
      }
    };

    if (show) {
      // Small delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleEscapeKey);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [show, onClose]);

  const sizes = {
    sm: {
      text: 'text-sm',
      padding: 'px-3 py-1.5',
      icon: 'h-3.5 w-3.5',
    },
    md: {
      text: 'text-sm',
      padding: 'px-4 py-2',
      icon: 'h-4 w-4',
    },
    lg: {
      text: 'text-base',
      padding: 'px-4 py-2.5',
      icon: 'h-5 w-5',
    },
  };

  const widths = {
    auto: 'w-auto min-w-[12rem]',
    sm: 'w-48',
    md: 'w-56',
    lg: 'w-64',
  };

  const variants = {
    default: {
      base: 'text-gray-700',
      hover: 'hover:bg-indigo-50 hover:text-indigo-600',
      iconBase: 'text-gray-400',
      iconHover: 'group-hover:text-indigo-500',
      description: 'text-gray-500 group-hover:text-indigo-500/80'
    },
    danger: {
      base: 'text-gray-700',
      hover: 'hover:bg-red-50 hover:text-red-600',
      iconBase: 'text-gray-400',
      iconHover: 'group-hover:text-red-500',
      description: 'text-gray-500 group-hover:text-red-500/80'
    },
    success: {
      base: 'text-gray-700',
      hover: 'hover:bg-emerald-50 hover:text-emerald-600',
      iconBase: 'text-gray-400',
      iconHover: 'group-hover:text-emerald-500',
      description: 'text-gray-500 group-hover:text-emerald-500/80'
    },
    warning: {
      base: 'text-gray-700',
      hover: 'hover:bg-amber-50 hover:text-amber-600',
      iconBase: 'text-gray-400',
      iconHover: 'group-hover:text-amber-500',
      description: 'text-gray-500 group-hover:text-amber-500/80'
    },
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, scale: 0.95, y: -5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -5 }}
          transition={{
            duration: 0.15,
            ease: 'easeOut',
          }}
          className={cn(
            'absolute z-50 mt-2 origin-top-right rounded-xl bg-white shadow-lg',
            'border border-gray-100',
            position === 'left' ? 'left-0' : 'right-0',
            widths[width],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1.5" role="menu">
            {items.map((item, index) => {
              const Icon = item.icon;
              const variant = variants[item.variant || 'default'];
              
              return (
                <React.Fragment key={index}>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!item.disabled) {
                        item.onClick();
                        onClose();
                      }
                    }}
                    className={cn(
                      'group flex w-full items-center rounded-lg transition-colors duration-150',
                      variant.base,
                      variant.hover,
                      sizes[size].padding,
                      sizes[size].text,
                      'focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                      item.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
                      item.description && 'flex-col items-start gap-0.5'
                    )}
                    disabled={item.disabled}
                    role="menuitem"
                  >
                    <div className="flex items-center w-full">
                      {Icon && (
                        <Icon 
                          className={cn(
                            'mr-2 flex-shrink-0 transition-colors duration-150',
                            sizes[size].icon,
                            variant.iconBase,
                            variant.iconHover
                          )} 
                        />
                      )}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    
                    {item.description && (
                      <span className={cn(
                        "text-xs transition-colors duration-150 pl-6",
                        variant.description
                      )}>
                        {item.description}
                      </span>
                    )}
                  </motion.button>
                  
                  {index < items.length - 1 && (
                    <div className="my-1" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};