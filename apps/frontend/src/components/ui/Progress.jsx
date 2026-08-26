import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Progress = ({ value = 0, label, showValue, colorOverride, className }) => {
  const safeValue = Math.min(Math.max(value, 0), 100);
  
  let colorClass = 'bg-emerald-500';
  if (colorOverride) {
    colorClass = colorOverride;
  } else {
    if (safeValue >= 80) colorClass = 'bg-emerald-500';
    else if (safeValue >= 60) colorClass = 'bg-teal-500';
    else if (safeValue >= 40) colorClass = 'bg-amber-500';
    else colorClass = 'bg-red-500';
  }

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-[#6E6E73] font-medium">{label}</span>}
          {showValue && <span className="text-xs font-bold text-[#1D1D1F]">{safeValue}%</span>}
        </div>
      )}
      <div className="h-2 bg-[#E5E5EA] rounded-full overflow-hidden w-full">
        <div 
          className={cn("h-full rounded-full transition-all duration-700 ease-in-out", colorClass)} 
          style={{ width: `${safeValue}%` }} 
        />
      </div>
    </div>
  );
};

export default Progress;
