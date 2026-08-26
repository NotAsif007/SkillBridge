import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Input = forwardRef(({ className, label, error, helperText, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col">
      {label && (
        <label className="text-xs font-medium text-[#6E6E73] uppercase tracking-wide mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full px-3 py-2.5 border border-[#E5E5EA] rounded-lg bg-white text-[#1D1D1F] text-sm focus:outline-none transition-shadow',
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
            : 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
          className
        )}
        {...props}
      />
      {error && <span className="text-red-600 text-xs mt-1">{error}</span>}
      {!error && helperText && <span className="text-[#86868B] text-xs mt-1">{helperText}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
