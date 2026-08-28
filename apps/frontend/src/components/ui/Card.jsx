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
        // Base: clean white surface, subtle border, gentle resting shadow
        'bg-white border border-[#E5E5EA] rounded-xl overflow-hidden',
        'shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.03)]',
        // Hoverable: adds the card-hover micro-lift from index.css
        hoverable && 'card-hover',
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
