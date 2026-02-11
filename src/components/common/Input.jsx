// src/components/common/Input.jsx
import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Input Component
 * 
 * A reusable form input component with the following features:
 * - Label support with required indicator
 * - Error state with icon and message
 * - Helper text for additional guidance
 * - Left and right icon slots
 * - Dark mode support
 * - Full width or custom width
 * - Forward ref support for form libraries (React Hook Form, Formik, etc.)
 * - Focus ring for accessibility
 * 
 * @param {string} label - Input label text
 * @param {string} error - Error message (also triggers error styling)
 * @param {string} helperText - Helper text shown below input (hidden when error is shown)
 * @param {ReactNode} leftIcon - Icon to show on left side of input
 * @param {ReactNode} rightIcon - Icon to show on right side of input
 * @param {boolean} fullWidth - Make input take full width (default: true)
 * @param {string} className - Additional CSS classes for input
 * @param {string} containerClassName - Additional CSS classes for container
 * @param {boolean} required - Show asterisk for required fields
 * @param {object} props - All other HTML input attributes (type, placeholder, value, onChange, etc.)
 * @param {ref} ref - Forwarded ref for direct input access
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  containerClassName = '',
  required = false,
  ...props
}, ref) => {
  
  // Base styles for all inputs
  const baseClasses = `
    px-3 py-2 
    bg-white dark:bg-gray-800 
    border rounded-lg 
    text-gray-900 dark:text-white 
    placeholder-gray-400 dark:placeholder-gray-500 
    transition-colors 
    focus:outline-none focus:ring-2 focus:ring-blue-500
  `.trim();
  
  // Dynamic border color based on error state
  const errorClasses = error 
    ? 'border-red-500 dark:border-red-500' 
    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500';

  // Full width or custom width
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={containerClassName}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input Container - Relative positioning for icons */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        {/* Input Field */}
        <input
          ref={ref}
          className={`
            ${baseClasses} 
            ${errorClasses} 
            ${widthClass} 
            ${leftIcon ? 'pl-10' : ''} 
            ${rightIcon || error ? 'pr-10' : ''} 
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${props.id}-error` : 
            helperText ? `${props.id}-helper` : 
            undefined
          }
          {...props}
        />
        
        {/* Right Icon (custom icon takes precedence over error icon) */}
        {rightIcon && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {rightIcon}
          </div>
        )}
        
        {/* Error Icon - Shown when there's an error */}
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none">
            <AlertCircle size={18} />
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p 
          id={`${props.id}-error`}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
      
      {/* Helper Text - Only shown when there's no error */}
      {helperText && !error && (
        <p 
          id={`${props.id}-helper`}
          className="mt-1 text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

// Display name for debugging
Input.displayName = 'Input';

export default Input;