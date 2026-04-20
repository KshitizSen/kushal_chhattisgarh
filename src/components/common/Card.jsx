import React from 'react';

/**
 * Card component for content containers
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.title - Card title
 * @param {React.ReactNode} props.header - Custom header (overrides title)
 * @param {React.ReactNode} props.footer - Footer content
 * @param {string} props.variant - 'default' | 'elevated' | 'outlined' | 'filled'
 * @param {boolean} props.hover - Hover effect
 * @param {string} props.padding - 'none' | 'sm' | 'md' | 'lg'
 * @param {string} props.className - Additional CSS classes
 */
const Card = ({
  children,
  title,
  header,
  footer,
  variant = 'default',
  hover = false,
  padding = 'md',
  className = '',
  ...rest
}) => {
  const baseClasses = 'rounded-[1.5rem] transition-all duration-200';

  const variantClasses = {
    default: 'border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900',
    elevated: 'border border-gray-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)] dark:border-gray-800 dark:bg-gray-900',
    outlined: 'border border-gray-300/90 bg-transparent dark:border-gray-700',
    filled: 'border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/65',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClass = hover ? 'hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(15,23,42,0.12)]' : '';
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${className}`;

  return (
    <div className={combinedClasses} {...rest}>
      {header || (title && (
        <div className="mb-4 border-b border-gray-200/80 pb-4 dark:border-gray-800">
          <h3 className="font-heading text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
      ))}

      <div>{children}</div>

      {footer && (
        <div className="mt-6 border-t border-gray-200/80 pt-6 dark:border-gray-800">
          {footer}
        </div>
      )}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 border-b border-gray-200/80 pb-4 dark:border-gray-800 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`font-heading text-xl font-semibold text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-6 border-t border-gray-200/80 pt-6 dark:border-gray-800 ${className}`}>
    {children}
  </div>
);

export const StatCard = ({ title, value, change, icon, trend = 'up', description }) => {
  const trendColor = trend === 'up' ? 'text-success-500' : 'text-danger-500';
  const trendLabel = trend === 'up' ? 'Up' : 'Down';

  return (
    <Card variant="elevated" hover padding="md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              {/* <span className={`text-sm font-medium ${trendColor}`}>
                {trendLabel} {change}
              </span> */}
              {/* <span className="text-sm text-gray-500 dark:text-gray-400">from last month</span> */}
            </div>
          )}
          {description && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-2xl bg-primary-50 p-3 text-primary-500 dark:bg-primary-900/20">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export { Card };
export default Card;
