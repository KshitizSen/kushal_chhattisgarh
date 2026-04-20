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
  const baseClasses = 'rounded-xl transition-all duration-200';

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 shadow-card hover:shadow-card-hover',
    outlined: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent',
    filled: 'bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClass = hover ? 'hover:shadow-card-hover hover:-translate-y-1' : '';
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClass} ${className}`;

  return (
    <div className={combinedClasses} {...rest}>
      {header || (title && (
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
      ))}

      <div>{children}</div>

      {footer && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-semibold text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
);

export const StatCard = ({ title, value, change, icon, trend = 'up', description }) => {
  const trendColor = trend === 'up' ? 'text-success-500' : 'text-danger-500';
  const trendIcon = trend === 'up' ? '↗' : '↘';

  return (
    <Card variant="elevated" hover padding="md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${trendColor}`}>
                {trendIcon} {change}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">from last month</span>
            </div>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-500">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export { Card };
export default Card;
