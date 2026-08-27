/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, RefreshCw, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import Table from '../../components/common/Table';
import vtpService from '../../services/vtpService';

const TradesList = () => {
  const [rows, setRows] = useState([]); const [search, setSearch] = useState(''); const [page, setPage] = useState(1); const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1 }); const [loading, setLoading] = useState(false);
  const loadTrades = useCallback(async () => { try { setLoading(true); const response = await vtpService.getTrades({ page, limit, search: search.trim() }); setRows(response.data?.data || []); setPagination(response.data?.pagination || { totalItems: 0, totalPages: 1 }); } catch (error) { setRows([]); toast.error(error.response?.data?.message || 'Unable to load trades.'); } finally { setLoading(false); } }, [page, limit, search]);
  useEffect(() => { loadTrades(); }, [loadTrades]);
  const columns = useMemo(() => [{ key: 'serial', label: 'Sr. No.' }, 
    { key: 'trade_name', label: 'Trade Name' }, 
    { key: 'total_vts', label: 'Number of VTs' }, 
    // { key: 'total_schools', label: 'Number of Schools' }
  ], []);
  const data = rows.map((row, index) => ({ ...row, serial: (page - 1) * limit + index + 1 }));
  return <div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Trades List</h1><p className="text-gray-500">Unique trades mapped to your VTP organization</p></div><Button leftIcon={<RefreshCw className="h-4 w-4" />} onClick={loadTrades} loading={loading}>Refresh</Button></div>
    <Card><div className="flex items-center gap-3"><div className="max-w-xl flex-1"><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} placeholder="Search trade name..." /></div><select value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900">{[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size} / page</option>)}</select></div></Card>
    {loading && !rows.length ? <Card><div className="py-10 text-center text-gray-500">Loading trades...</div></Card> : <Table columns={columns} data={data} emptyState={<div className="py-10 text-center text-gray-500"><BriefcaseBusiness className="mx-auto mb-2 h-9 w-9" />No trades found.</div>} />}
    <Pagination currentPage={page} totalPages={pagination.totalPages || 1} totalItems={pagination.totalItems || 0} pageSize={limit} onPageChange={setPage} /></div>;
};

export default TradesList;
