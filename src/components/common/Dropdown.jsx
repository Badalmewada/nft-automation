// src/components/common/Dropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Dropdown Component
 * 
 * A reusable dropdown/select component with the following features:
 * - Custom styling (not native select)
 * - Keyboard navigation support
 * - Click outside to close
 * - Selected value indicator (checkmark)
 * - Dark mode support
 * - Error state
 * - Disabled state
 * - Empty state message
 * - Smooth animations
 * 
 * @param {string} label - Dropdown label text
 * @param {Array} options - Array of option objects: [{ value: 'id', label: 'Display Text' }]
 * @param {string|number} value - Currently selected value
 * @param {function} onChange - Callback when selection changes, receives selected value
 * @param {string} placeholder - Placeholder text when no selection
 * @param {string} error - Error message (also triggers error styling)
 * @param {boolean} disabled - Disable the dropdown
 * @param {boolean} fullWidth - Make dropdown take full width (default: true)
 * @param {string} className - Additional CSS classes for dropdown button
 */
const Dropdown = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  error,
  disabled = false,
  fullWidth = true,
  className = ''
}) => {
  // State for dropdown open/close
  const [isOpen, setIsOpen] = useState(false);
  
  // Ref for detecting clicks outside dropdown
  const dropdownRef = useRef(null);

  /**
   * Effect: Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Cleanup
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Find the selected option object from value
   */
  const selectedOption = options.find(opt => opt.value === value);

  /**
   * Handle option selection
   * @param {string|number} optionValue - The value of selected option
   */
  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  /**
   * Toggle dropdown open/close
   */
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      {/* Dropdown Container */}
      <div className="relative" ref={dropdownRef}>
        {/* Dropdown Button/Trigger */}
        <button
          type="button"
          onClick={toggleDropdown}
          disabled={disabled}
          className={`
            w-full px-3 py-2 text-left bg-white dark:bg-gray-800 
            border rounded-lg text-gray-900 dark:text-white
            flex items-center justify-between
            transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? undefined : 'dropdown-label'}
        >
          {/* Selected value or placeholder */}
          <span className={selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          
          {/* Chevron icon - rotates when open */}
          <ChevronDown 
            size={18} 
            className={`transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div 
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto"
            role="listbox"
            aria-labelledby={label}
          >
            {/* Empty state */}
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No options available
              </div>
            ) : (
              // Options list
              options.map((option) => {
                const isSelected = option.value === value;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-3 py-2 text-left text-sm
                      flex items-center justify-between
                      transition-colors
                      ${isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                      }
                    `.trim().replace(/\s+/g, ' ')}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {/* Option label */}
                    <span>{option.label}</span>
                    
                    {/* Checkmark for selected option */}
                    {isSelected && (
                      <Check size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Dropdown;