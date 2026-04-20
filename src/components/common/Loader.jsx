import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Loading spinner component
 * @param {Object} props
 * @param {string} props.size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} props.color - Tailwind color class
 * @param {string} props.text - Loading text to display
 * @param {boolean} props.fullScreen - Center in full screen
 * @param {string} props.className - Additional CSS classes
 */
const Loader = ({
  size = 'md',
  color = 'primary-500',
  text,
  fullScreen = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClass = `text-${color}`;

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} ${colorClass} animate-spin`} />
      {text && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

/**
 * Skeleton loader for content placeholders
 */
export const Skeleton = ({
  variant = 'text',
  width = 'full',
  height = 'auto',
  count = 1,
  className = '',
}) => {
  const widthClass = width === 'full' ? 'w-full' : `w-${width}`;
  const heightClass = height === 'auto' ? 'h-4' : `h-${height}`;

  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

  const variantClasses = {
    text: `${heightClass} ${widthClass}`,
    circle: 'rounded-full w-12 h-12',
    rectangle: `h-24 ${widthClass}`,
    card: 'h-40 w-full rounded-xl',
  };

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className={className}>
      {items.map((i) => (
        <div
          key={i}
          className={`${baseClasses} ${variantClasses[variant]} ${i < count - 1 ? 'mb-2' : ''}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

/**
 * Page loader with overlay
 */
export const PageLoader = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">{message}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Please wait a moment</p>
    </div>
  </div>
);

export default Loader;