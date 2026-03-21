import React, { forwardRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helper?: string;
  fullWidth?: boolean;
  onChange?: (value: string) => void;
  value?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    options, 
    error, 
    helper, 
    fullWidth = true,
    className = '',
    onChange,
    value,
    placeholder,
    id,
    ...props 
  }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || '');
    
    const selectedOption = options.find(opt => opt.value === selectedValue);
    
    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
      if (props.onChange) {
        const event = {
          target: { value: optionValue }
        } as React.ChangeEvent<HTMLSelectElement>;
        props.onChange(event);
      }
    };
    
    const width = fullWidth ? 'w-full' : '';
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`
              w-full rounded-lg border bg-white px-3 py-2 text-sm text-left
              flex items-center justify-between
              transition-all duration-200
              focus:outline-none focus:ring-2
              ${error 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
              }
            `}
          >
            <span className={selectedValue ? 'text-gray-900' : 'text-gray-400'}>
              {selectedOption?.label || placeholder || 'Выберите значение'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full px-3 py-2 text-sm text-left hover:bg-gray-50
                      flex items-center justify-between
                      ${selectedValue === option.value ? 'bg-green-50 text-green-700' : 'text-gray-700'}
                    `}
                  >
                    {option.label}
                    {selectedValue === option.value && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
          
          <select
            ref={ref}
            id={selectId}
            value={selectedValue}
            onChange={(e) => handleSelect(e.target.value)}
            className="sr-only"
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        
        {helper && !error && (
          <p className="mt-1 text-sm text-gray-500">{helper}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';