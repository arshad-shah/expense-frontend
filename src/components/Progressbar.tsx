import React from 'react';

interface ProgressBarProps {
  /** Value between 0 and 100 */
  value: number;
  /** Optional maximum value (defaults to 100) */
  max?: number;
  /** Visual variant of the progress bar */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  /** Show percentage text */
  showPercentage?: boolean;
  /** Show animated stripes */
  animated?: boolean;
  /** Size of the progress bar */
  size?: 'sm' | 'md' | 'lg';
  /** Additional classes */
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  showPercentage = false,
  animated = false,
  size = 'md',
  className = '',
}) => {
  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Define color schemes
  const colorSchemes = {
    default: {
      bar: 'bg-gradient-to-r from-blue-500 to-blue-600',
      background: 'bg-blue-100',
      text: 'text-blue-700'
    },
    success: {
      bar: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      background: 'bg-emerald-100',
      text: 'text-emerald-700'
    },
    warning: {
      bar: 'bg-gradient-to-r from-amber-500 to-amber-600',
      background: 'bg-amber-100',
      text: 'text-amber-700'
    },
    danger: {
      bar: 'bg-gradient-to-r from-red-500 to-red-600',
      background: 'bg-red-100',
      text: 'text-red-700'
    },
    info: {
      bar: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
      background: 'bg-cyan-100',
      text: 'text-cyan-700'
    }
  };

  // Define size variations
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  // Animation for the stripes
  const stripeAnimation = animated ? 
    'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-white/20 before:to-transparent before:animate-[shine_1.5s_ease-in-out_infinite]' : '';

  return (
    <div className="relative">
      <div 
        className={`
          w-full rounded-full overflow-hidden
          ${colorSchemes[variant].background}
          ${sizes[size]}
          shadow-inner
          ${className}
        `}
      >
        <div
          className={`
            h-full rounded-full
            relative overflow-hidden
            transition-all duration-500 ease-in-out
            ${colorSchemes[variant].bar}
            ${stripeAnimation}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {showPercentage && (
        <div className={`
          absolute right-0 -top-6
          text-sm font-medium
          ${colorSchemes[variant].text}
        `}>
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
};