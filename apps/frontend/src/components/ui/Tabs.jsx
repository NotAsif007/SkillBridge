import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Tabs = ({ value, onChange, tabs, className }) => {
  return (
    <div className={cn("flex border-b border-[#E5E5EA]", className)}>
      {tabs.map((tab) => {
        const isActive = value === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors relative focus:outline-none",
              isActive 
                ? "text-[#1D1D1F] font-semibold" 
                : "text-[#6E6E73] hover:text-[#1D1D1F]"
            )}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
