import React from 'react';

/**
 * Badge component for status indicators
 * @param {Object} props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.variant - 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'info' | 'gray'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {boolean} props.rounded - Fully rounded (pill) vs default rounded
 * @param {boolean} props.outline - Outline style
 * @param {string} props.className - Additional CSS classes
 */
const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  outline = false,
  className = '',
  ...rest
}) => {
  const baseClasses = 'inline-flex items-center font-medium whitespace-nowrap';

  const variantClasses = {
    primary: outline
      ? 'text-primary-600 border border-primary-300 bg-primary-50 dark:text-primary-400 dark:border-primary-700 dark:bg-primary-900/20'
      : 'bg-primary-500 text-white',
    secondary: outline
      ? 'text-secondary-600 border border-secondary-300 bg-secondary-50 dark:text-secondary-400 dark:border-secondary-700 dark:bg-secondary-900/20'
      : 'bg-secondary-500 text-white',
    danger: outline
      ? 'text-danger-600 border border-danger-300 bg-danger-50 dark:text-danger-400 dark:border-danger-700 dark:bg-danger-900/20'
      : 'bg-danger-500 text-white',
    warning: outline
      ? 'text-warning-600 border border-warning-300 bg-warning-50 dark:text-warning-400 dark:border-warning-700 dark:bg-warning-900/20'
      : 'bg-warning-500 text-white',
    success: outline
      ? 'text-success-600 border border-success-300 bg-success-50 dark:text-success-400 dark:border-success-700 dark:bg-success-900/20'
      : 'bg-success-500 text-white',
    info: outline
      ? 'text-accent-600 border border-accent-300 bg-accent-50 dark:text-accent-400 dark:border-accent-700 dark:bg-accent-900/20'
      : 'bg-accent-500 text-white',
    gray: outline
      ? 'text-gray-600 border border-gray-300 bg-gray-50 dark:text-gray-400 dark:border-gray-700 dark:bg-gray-900/20'
      : 'bg-gray-500 text-white',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const roundedClass = rounded ? 'rounded-full' : 'rounded-md';
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${roundedClass} ${className}`;

  return (
    <span className={combinedClasses} {...rest}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status, showIcon = true }) => {
  const statusConfig = {
    active: { label: 'Active', variant: 'success', icon: '●' },
    inactive: { label: 'Inactive', variant: 'gray', icon: '○' },
    pending: { label: 'Pending', variant: 'warning', icon: '⏳' },
    approved: { label: 'Approved', variant: 'success', icon: '✓' },
    rejected: { label: 'Rejected', variant: 'danger', icon: '✕' },
    completed: { label: 'Completed', variant: 'primary', icon: '✓' },
    warning: { label: 'Warning', variant: 'warning', icon: '!' },
    review: { label: 'Review', variant: 'info', icon: '•' },
    'on-leave': { label: 'On Leave', variant: 'warning', icon: '◐' },
    probation: { label: 'Probation', variant: 'info', icon: '◌' },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <Badge variant={config.variant} size="sm">
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </Badge>
  );
};

export { Badge };
export default Badge;
