import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const AuthInput = forwardRef(({
  label,
  error,
  icon: Icon,
  rightElement,
  type = 'text',
  id,
  name,
  className = '',
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputId = id || name;
  const isFloating = isFocused || hasValue;

  const handleFocus = (e) => {
    setIsFocused(true);
    rest.onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    rest.onBlur?.(e);
  };

  const handleChange = (e) => {
    setHasValue(!!e.target.value);
    rest.onChange?.(e);
  };

  return (
    <div className="w-full">
      <div className="relative group">
        {/* Leading icon */}
        {Icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 z-10 ${
            isFocused
              ? 'text-primary-600 dark:text-primary-400'
              : error
                ? 'text-red-500'
                : 'text-gray-400 dark:text-gray-500'
          }`}>
            <Icon className="w-[18px] h-[18px]" />
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          className={`
            glass-input w-full h-13 text-sm font-medium
            ${Icon ? 'pl-11' : 'pl-4'}
            ${rightElement ? 'pr-12' : 'pr-4'}
            pt-5 pb-2
            ${error ? 'border-red-500/50 focus:border-red-500/60 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]' : ''}
            ${className}
          `}
          placeholder=" "
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />

        {/* Floating label */}
        <label
          htmlFor={inputId}
          className={`
            absolute pointer-events-none transition-all duration-200 ease-out
            ${Icon ? 'left-11' : 'left-4'}
            ${isFloating
              ? 'top-2 text-[10px] font-semibold tracking-wider uppercase'
              : 'top-1/2 -translate-y-1/2 text-sm'
            }
            ${isFocused
              ? 'text-primary-600 dark:text-primary-400'
              : error
                ? 'text-red-500'
                : 'text-gray-400 dark:text-gray-500'
            }
          `}
        >
          {label}
        </label>

        {/* Right element (e.g., password toggle) */}
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            {rightElement}
          </div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${inputId}-error`}
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 mt-2 text-xs text-red-400 font-medium"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

AuthInput.displayName = 'AuthInput';

export default AuthInput;
