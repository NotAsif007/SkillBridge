import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Card = ({ className, hoverable, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white border border-[#E5E5EA] rounded-xl overflow-hidden',
        hoverable && 'transition-shadow hover:shadow-md',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const Header = ({ className, children, ...props }) => {
  return (
    <div className={cn('px-5 py-4 border-b border-[#E5E5EA] font-semibold text-[#1D1D1F] text-sm', className)} {...props}>
      {children}
    </div>
  );
};

const Body = ({ className, children, ...props }) => {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
};

const Footer = ({ className, children, ...props }) => {
  return (
    <div className={cn('px-5 py-3 border-t border-[#E5E5EA] bg-[#F5F5F7]', className)} {...props}>
      {children}
    </div>
  );
};

Card.Header = Header;
Card.Body = Body;
Card.Footer = Footer;

export default Card;
