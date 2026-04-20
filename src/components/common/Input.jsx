import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Input component with validation states
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.error - Error message
 * @param {string} props.helperText - Helper text below input
 * @param {boolean} props.required - Show required asterisk
 * @param {string} props.variant - 'default' | 'filled' | 'outlined'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {string} props.leftIcon - Left icon component
 * @param {string} props.rightIcon - Right icon component
 * @param {React.InputHTMLAttributes} props.rest - Other input attributes
 */
const Input = forwardRef(({
  label,
  error,
  helperText,
  required = false,
  variant = 'default',
  size = 'md',
  icon,
  leftIcon,
  rightIcon,
  className = '',
  id,
  name,
  ...rest
}, ref) => {
  const inputId = id || name;
  const leadingIcon = leftIcon || icon;
  const baseClasses = 'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    default: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:border-gray-600',
    filled: 'border-transparent bg-gray-100 focus:bg-white focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:focus:bg-gray-800',
    outlined: 'border-gray-400 focus:border-primary-500 focus:ring-primary-500 bg-transparent',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  const errorClasses = error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${errorClasses} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leadingIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          className={`${combinedClasses} ${leadingIcon ? 'pl-10' : ''} ${rightIcon || error ? 'pr-10' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...rest}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-danger-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-danger-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

export { Input };
export default Input;
