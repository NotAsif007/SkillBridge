import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Button = forwardRef(({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
  // Base: focus ring, disabled state, micro-press feedback via btn-lift
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg font-medium ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-1 ' +
    'disabled:opacity-50 disabled:pointer-events-none ' +
    'btn-lift select-none';

  const variants = {
    primary:   'bg-[#1D1D1F] text-white hover:bg-black shadow-[0_1px_3px_rgba(0,0,0,0.18)]',
    secondary: 'border border-[#E5E5EA] text-[#1D1D1F] bg-white hover:bg-[#F5F5F7]',
    ghost:     'text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7]',
    danger:    'bg-red-600 text-white hover:bg-red-700 shadow-[0_1px_3px_rgba(220,38,38,0.25)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
