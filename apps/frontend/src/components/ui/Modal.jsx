import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X } from 'lucide-react';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Modal = ({ open, onClose, title, children, className }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      <div className={cn(
        "relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-0 animate-in fade-in zoom-in-95 duration-200",
        className
      )}>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5EA]">
            <h3 className="font-semibold text-[#1D1D1F] text-lg">{title}</h3>
            <button 
              onClick={onClose}
              className="text-[#6E6E73] hover:text-[#1D1D1F] transition-colors rounded-full p-1 hover:bg-[#F5F5F7]"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        <div className="px-5 py-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
