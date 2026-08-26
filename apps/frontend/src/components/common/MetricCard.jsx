import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

export default function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  color = 'emerald', 
  onClick 
}) {
  const colorStyles = {
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    neutral: 'bg-[#F5F5F7] text-[#6E6E73]',
  };

  return (
    <div 
      className={clsx(
        "bg-white border border-[#E5E5EA] rounded-xl p-5 flex flex-col gap-3 transition-all",
        onClick && "cursor-pointer hover:shadow-sm hover:border-[#D1D1D6]"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center", colorStyles[color])}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      
      <div>
        <div className="text-2xl font-bold text-[#1D1D1F]">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-[#6E6E73]">{label}</span>
          
          {trend !== undefined && trend !== null && (
            <div className={clsx(
              "flex items-center text-xs font-medium",
              trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-600" : "text-[#6E6E73]"
            )}>
              {trend > 0 ? (
                <TrendingUp size={14} className="mr-1" />
              ) : trend < 0 ? (
                <TrendingDown size={14} className="mr-1" />
              ) : null}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
