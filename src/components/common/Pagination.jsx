import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import Button from './Button';

/**
 * Pagination component
 * @param {Object} props
 * @param {number} props.currentPage - Current page number (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.pageSize - Items per page
 * @param {number} props.totalItems - Total items count
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {boolean} props.showPageNumbers - Show individual page numbers
 * @param {number} props.siblingCount - Number of siblings to show around current
 * @param {string} props.variant - 'default' | 'minimal'
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
  showPageNumbers = true,
  siblingCount = 1,
  variant = 'default',
  size = 'md',
}) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  const generatePageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 3; // siblings + current + first + last + 2 ellipsis
    const totalBlocks = totalNumbers + 2; // +2 for ellipsis

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftEllipsis = leftSiblingIndex > 2;
    const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, 'ellipsis', totalPages];
    }

    if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, 'ellipsis', ...rightRange];
    }

    if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [1, 'ellipsis', ...middleRange, 'ellipsis', totalPages];
    }
  };

  const pageNumbers = generatePageNumbers();

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2 text-lg',
  };

  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Items info */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Showing <span className="font-semibold">{startItem}-{endItem}</span> of{' '}
        <span className="font-semibold">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <Button
          variant="ghost"
          size={size}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Page numbers */}
        {showPageNumbers &&
          pageNumbers?.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className={`${sizeClasses[size]} text-gray-400 dark:text-gray-500`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            const isCurrent = page === currentPage;

            return (
              <Button
                key={page}
                variant={isCurrent ? 'primary' : 'ghost'}
                size={size}
                onClick={() => handlePageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={isCurrent ? 'min-w-[2.5rem]' : ''}
              >
                {page}
              </Button>
            );
          })}

        {/* Next button */}
        <Button
          variant="ghost"
          size={size}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Page size selector (optional) */}
      {variant === 'default' && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page size: <span className="font-semibold">{pageSize}</span>
        </div>
      )}
    </div>
  );
};

export default Pagination;
