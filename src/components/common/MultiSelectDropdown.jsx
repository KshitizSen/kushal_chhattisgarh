import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import Badge from './Badge';

const MultiSelectDropdown = ({
  label,
  groups = [],
  value = [],
  onChange,
  placeholder = 'Select permissions',
  helperText,
  error,
  required = false,
  disabled = false,
}) => {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const allOptions = useMemo(
    () =>
      groups.flatMap((group) =>
        group.permissions.map((permission) => ({
          ...permission,
          groupId: group.id,
          groupLabel: group.label,
        }))
      ),
    [groups]
  );

  const selectedOptions = useMemo(
    () => allOptions.filter((option) => value.includes(option.value)),
    [allOptions, value]
  );

  const filteredGroups = useMemo(() => {
    if (!query.trim()) {
      return groups;
    }

    const normalizedQuery = query.trim().toLowerCase();

    return groups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter((permission) =>
          `${permission.label} ${permission.description}`.toLowerCase().includes(normalizedQuery)
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [groups, query]);

  const visibleValues = filteredGroups.flatMap((group) =>
    group.permissions.map((permission) => permission.value)
  );

  const toggleValue = (nextValue) => {
    const nextSelection = value.includes(nextValue)
      ? value.filter((currentValue) => currentValue !== nextValue)
      : [...value, nextValue];

    onChange?.(nextSelection);
  };

  const selectVisible = () => {
    onChange?.([...new Set([...value, ...visibleValues])]);
  };

  const clearAll = () => {
    onChange?.([]);
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="ml-1 text-danger-500">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((current) => !current)}
          className={`flex min-h-[3.5rem] w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
            error
              ? 'border-danger-400 focus:ring-danger-200'
              : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600'
          } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {selectedOptions.length === 0 ? (
              <span className="text-sm text-gray-500 dark:text-gray-400">{placeholder}</span>
            ) : (
              <>
                {selectedOptions.slice(0, 2).map((permission) => (
                  <Badge key={permission.value} variant="primary" size="sm" rounded outline>
                    {permission.label}
                  </Badge>
                ))}
                {selectedOptions.length > 2 && (
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    +{selectedOptions.length - 2} more
                  </span>
                )}
              </>
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 flex-shrink-0 text-gray-500 transition ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-30 mt-2 w-full rounded-[1.5rem] border border-gray-200 bg-white p-3 shadow-[0_24px_48px_rgba(15,23,42,0.14)] dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-col gap-3 border-b border-gray-200 pb-3 dark:border-gray-700">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search permission"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-primary-500 dark:focus:ring-primary-900"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedOptions.length} permission selected
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectVisible}
                    className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-600 transition hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-300"
                  >
                    Select visible
                  </button>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3 max-h-72 space-y-3 overflow-y-auto pr-1">
              {filteredGroups.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-5 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  No permissions match the current search.
                </div>
              )}

              {filteredGroups.map((group) => (
                <div key={group.id} className="rounded-2xl border border-gray-200/80 bg-gray-50/80 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                  <div className="mb-3">
                    <p className="font-medium text-gray-900 dark:text-white">{group.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{group.description}</p>
                  </div>

                  <div className="space-y-2">
                    {group.permissions.map((permission) => {
                      const checked = value.includes(permission.value);

                      return (
                        <label
                          key={permission.value}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-3 transition ${
                            checked
                              ? 'border-primary-300 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20'
                              : 'border-transparent bg-white hover:border-gray-200 dark:bg-gray-900/70 dark:hover:border-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleValue(permission.value)}
                            className="peer sr-only"
                          />
                          <span
                            className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border ${
                              checked
                                ? 'border-primary-500 bg-primary-500 text-white'
                                : 'border-gray-300 bg-white text-transparent dark:border-gray-600 dark:bg-gray-900'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-gray-900 dark:text-white">
                              {permission.label}
                            </span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400">
                              {permission.description}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
      {!error && helperText && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
    </div>
  );
};

export default MultiSelectDropdown;
