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
      {/* Backdrop — frosted glass blur */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[3px]"
        style={{ transition: 'opacity 200ms ease' }}
        onClick={onClose}
      />

      {/* Panel — uses modal-fade-in keyframe from index.css */}
      <div
        className={cn(
          'relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-0',
          // Subtle resting elevation: deepened to feel lifted off the page
          'shadow-[0_20px_60px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.06)]',
          className
        )}
        style={{ animation: 'modal-fade-in 0.22s cubic-bezier(0.34, 1.15, 0.64, 1) both' }}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5EA]">
            <h3 className="font-semibold text-[#1D1D1F] text-lg">{title}</h3>
            <button
              onClick={onClose}
              className={cn(
                'text-[#6E6E73] hover:text-[#1D1D1F] rounded-full p-1 hover:bg-[#F5F5F7]',
                'transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-emerald-500/50',
              )}
              aria-label="Close"
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
