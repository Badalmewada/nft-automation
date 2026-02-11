// src/components/common/Modal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal Component
 * 
 * A reusable modal dialog component with the following features:
 * - Overlay background with optional click-to-close
 * - ESC key to close
 * - Multiple size options (sm, md, lg, xl, full)
 * - Prevents body scroll when open
 * - Dark mode support
 * - Smooth animations
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal should close
 * @param {string} title - Modal title (optional)
 * @param {ReactNode} children - Modal content
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl', 'full' (default: 'md')
 * @param {boolean} showCloseButton - Show X button in header (default: true)
 * @param {boolean} closeOnOverlayClick - Allow closing by clicking overlay (default: true)
 * @param {string} className - Additional CSS classes
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  
  // Effect to handle body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Effect to handle ESC key press to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    // Add event listener when modal is open
    document.addEventListener('keydown', handleEscape);
    
    // Remove event listener on cleanup
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  // Size classes for different modal widths
  const sizeClasses = {
    sm: 'max-w-md',      // 448px
    md: 'max-w-lg',      // 512px
    lg: 'max-w-2xl',     // 672px
    xl: 'max-w-4xl',     // 896px
    full: 'max-w-full mx-4'  // Full width with margins
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay Background */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Container - Centers modal vertically and horizontally */}
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Modal Content */}
        <div 
          className={`
            relative bg-white dark:bg-gray-800 rounded-lg shadow-xl 
            w-full ${sizeClasses[size]} ${className}
          `}
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
        >
          {/* Modal Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              {/* Title */}
              {title && (
                <h3 
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {title}
                </h3>
              )}
              
              {/* Close Button */}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>
          )}

          {/* Modal Body - Content */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;