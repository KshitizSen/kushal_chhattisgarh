import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * Table component with sorting, pagination, and actions
 * @param {Object} props
 * @param {Array} props.columns - Column definitions [{ key, label, sortable, align, width }]
 * @param {Array} props.data - Array of row objects
 * @param {Function} props.renderRow - Custom row renderer (optional)
 * @param {string} props.sortColumn - Currently sorted column key
 * @param {string} props.sortDirection - 'asc' | 'desc'
 * @param {Function} props.onSort - Callback when column header clicked
 * @param {boolean} props.striped - Zebra striping
 * @param {boolean} props.hover - Row hover effect
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 * @param {React.ReactNode} props.emptyState - Component to show when data empty
 */
const Table = ({
  columns = [],
  data = [],
  renderRow,
  keyExtractor,
  sortColumn,
  sortDirection,
  onSort,
  striped = true,
  hover = true,
  size = 'md',
  emptyState,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const handleSort = (column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  if (data.length === 0) {
    return emptyState || (
      <div className="text-center py-12 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="text-gray-400 dark:text-gray-500">No data available</div>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/40 ${className}`}>
      <div className="overflow-x-auto">
        <table className={`w-full ${sizeClasses[size]}`}>
          <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                style={{ width: col.width }}
                onClick={() => handleSort(col)}
                aria-sort={sortColumn === col.key ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                  {col.label ?? col.header ?? col.key}
                  {col.sortable && sortColumn === col.key && (
                    <span className="inline-flex">
                      {sortDirection === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              if (renderRow) {
                return renderRow(row, rowIndex);
              }
              return (
                <tr
                  key={keyExtractor ? keyExtractor(row, rowIndex) : row.id ?? rowIndex}
                  className={`${striped && rowIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''} ${hover ? 'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors' : ''} border-b border-gray-200 dark:border-gray-700 last:border-b-0`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-gray-800 dark:text-gray-200 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                    >
                      {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Action column component for tables
 */
export const ActionCell = ({ children }) => (
  <div className="flex items-center gap-2">{children}</div>
);

export { Table };
export default Table;
