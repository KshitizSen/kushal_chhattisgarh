import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, RefreshCw, Search } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import Table from '../../components/common/Table';
import { getAdminTrades } from '../../services/adminService';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const TradesList = () => {
  const [trades, setTrades] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let active = true;

    const loadTrades = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getAdminTrades({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch,
        });
        if (!active) return;
        setTrades(Array.isArray(response.data) ? response.data : []);
        setPagination({
          total: Number(response.total || 0),
          totalPages: Math.max(1, Number(response.total_pages || 1)),
        });
      } catch (requestError) {
        if (!active) return;
        setTrades([]);
        setPagination({ total: 0, totalPages: 1 });
        setError(requestError.response?.data?.message || 'Trades list could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadTrades();
    return () => { active = false; };
  }, [currentPage, pageSize, debouncedSearch, reloadKey]);

  const columns = useMemo(() => [
    { key: 'serial', label: 'Sr. No.' },
    { key: 'trade_name', label: 'Trade Name' },
    { key: 'vtp_names', label: 'VTP Name' },
  ], []);

  const rows = useMemo(() => trades.map((trade, index) => ({
    ...trade,
    serial: (currentPage - 1) * pageSize + index + 1,
  })), [trades, currentPage, pageSize]);

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trades List</h1>
          <p className="text-gray-600 dark:text-gray-400">VTP-wise vocational trades</p>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by VTP or trade name..."
            leftIcon={<Search className="h-4 w-4" />}
          />
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            aria-label="Rows per page"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          >
            {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size} / page</option>)}
          </select>
        </div>
      </Card>

      {error ? (
        <Card>
          <div className="py-6 text-center">
            <p className="mb-3 text-danger-600 dark:text-danger-400">{error}</p>
            <Button variant="ghost" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => setReloadKey((value) => value + 1)}>
              Retry
            </Button>
          </div>
        </Card>
      ) : loading ? (
        <Card><div className="py-10 text-center text-gray-500 dark:text-gray-400">Loading trades...</div></Card>
      ) : (
        <Table
          columns={columns}
          data={rows}
          emptyState={(
            <div className="rounded-xl border border-gray-200 bg-white py-10 text-center text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
              No trades found.
            </div>
          )}
        />
      )}

      {!error && !loading && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default TradesList;
