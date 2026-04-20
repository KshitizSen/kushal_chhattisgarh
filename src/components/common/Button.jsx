import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button component with multiple variants and sizes
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'ghost'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {boolean} props.loading - Show loading spinner
 * @param {boolean} props.disabled - Disable button
 * @param {string} props.className - Additional CSS classes
 * @param {React.ButtonHTMLAttributes} props.rest - Other button attributes
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  ...rest
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-2xl font-medium tracking-[0.01em] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-950';

  const variantClasses = {
    primary: 'bg-primary-600 text-white shadow-[0_14px_28px_rgba(234,88,12,0.18)] hover:-translate-y-0.5 hover:bg-primary-700 focus:ring-primary-400',
    secondary: 'bg-secondary-600 text-white shadow-[0_14px_28px_rgba(22,163,74,0.16)] hover:-translate-y-0.5 hover:bg-secondary-700 focus:ring-secondary-400',
    danger: 'bg-danger-600 text-white shadow-[0_14px_28px_rgba(220,38,38,0.16)] hover:-translate-y-0.5 hover:bg-danger-700 focus:ring-danger-400',
    warning: 'bg-warning-500 text-white shadow-[0_14px_28px_rgba(217,119,6,0.18)] hover:-translate-y-0.5 hover:bg-warning-600 focus:ring-warning-300',
    success: 'bg-success-600 text-white shadow-[0_14px_28px_rgba(22,163,74,0.18)] hover:-translate-y-0.5 hover:bg-success-700 focus:ring-success-400',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:border-gray-400 hover:bg-white focus:ring-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-900',
    ghost: 'border border-gray-200 bg-white text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-800',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm sm:text-base',
    lg: 'px-6 py-3 text-base sm:text-lg',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && leftIcon}
      {children}
      {rightIcon}
    </button>
  );
};

export { Button };
export default Button;
