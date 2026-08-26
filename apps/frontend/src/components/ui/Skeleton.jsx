import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Skeleton = ({ variant = 'text', width, height, size, className }) => {
  const baseStyles = 'animate-pulse bg-[#E5E5EA]';
  
  if (variant === 'circle') {
    return (
      <div 
        className={cn(baseStyles, 'rounded-full', className)} 
        style={{ width: size, height: size }} 
      />
    );
  }
  
  if (variant === 'rect') {
    return (
      <div 
        className={cn(baseStyles, 'rounded-lg', className)} 
        style={{ width, height }} 
      />
    );
  }
  
  if (variant === 'card') {
    return (
      <div 
        className={cn(baseStyles, 'h-32 rounded-xl w-full', className)} 
      />
    );
  }

  // text variant (default)
  return (
    <div 
      className={cn(baseStyles, 'h-4 rounded', className)} 
      style={{ width: width || '100%' }} 
    />
  );
};

export default Skeleton;
