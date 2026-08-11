import React from 'react';

const ApprovalSourceBadge = ({ type, className = '' }) => {
  if (!type) return null;
  const isAuto = type === 'auto';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
      isAuto
        ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        : 'border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
    } ${className}`}>
      {isAuto ? 'Auto-approved' : 'Manual'}
    </span>
  );
};

export default ApprovalSourceBadge;
