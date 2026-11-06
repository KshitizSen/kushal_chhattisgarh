import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Clock3 } from 'lucide-react';
import Card from '../../components/common/Card';
import Pagination from '../../components/common/Pagination';
import Table from '../../components/common/Table';
import api from '../../services/api';

const selectClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:disabled:bg-gray-800 sm:w-56';
const emptyList = { total: 0, page: 1, limit: 10, total_pages: 1, rows: [] };
const getIstDate = () => {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
};
const formatTime = (value) => value
  ? new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(new Date(value))
  : '—';

const DailyAttendance = () => {
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedDate, setSelectedDate] = useState(getIstDate);
  const [today] = useState(getIstDate);
  const [isBlocksLoading, setIsBlocksLoading] = useState(false);
  const [list, setList] = useState(emptyList);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    api.get('/reports/location-master', { params: { type: 'districts' }, signal: controller.signal })
      .then((response) => setDistricts(response.data?.data || []))
      .catch((requestError) => { if (requestError.code !== 'ERR_CANCELED') setLocationError(requestError.response?.data?.message || 'Districts could not be loaded.'); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedDistrict) return undefined;
    const controller = new AbortController();
    api.get('/reports/location-master', { params: { type: 'blocks', district_cd: selectedDistrict }, signal: controller.signal })
      .then((response) => setBlocks(response.data?.data || []))
      .catch((requestError) => { if (requestError.code !== 'ERR_CANCELED') setLocationError(requestError.response?.data?.message || 'Blocks could not be loaded.'); })
      .finally(() => setIsBlocksLoading(false));
    return () => controller.abort();
  }, [selectedDistrict]);

  useEffect(() => {
    const controller = new AbortController();
    const params = { district_cd: selectedDistrict, block_cd: selectedBlock, date: selectedDate };
    api.get('/admin/attendance-status/daily', { params: { ...params, page, limit }, signal: controller.signal })
      .then((dailyResponse) => {
        setList({ ...emptyList, ...(dailyResponse.data?.data || {}) });
      })
      .catch((requestError) => {
        if (requestError.code === 'ERR_CANCELED') return;
        setError(requestError.response?.data?.message || 'Daily attendance could not be loaded.');
        setList({ ...emptyList, page, limit });
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [selectedDistrict, selectedBlock, selectedDate, page, limit, refreshKey]);

  const columns = useMemo(() => [
    { key: 'serial', label: 'Sr. No.' },
    { key: 'udise_sch_code', label: 'UDISE', render: (value) => value || '—' },
    { key: 'name', label: 'Name', render: (value) => value || '—' },
    { key: 'district_name', label: 'District', render: (value) => value || '—' },
    { key: 'block_name', label: 'Block', render: (value) => value || '—' },
    { key: 'check_in_time', label: 'Check-In Time', render: formatTime },
    { key: 'check_out_time', label: 'Check-Out Time', render: formatTime },
  ], []);
  const rows = list.rows.map((row, index) => ({ ...row, serial: (list.page - 1) * list.limit + index + 1 }));
  const resetForFilters = () => { setPage(1); setLoading(true); setError(''); };

  return <div className="space-y-5">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Check-In/Out</h1>
      <p className="text-gray-600 dark:text-gray-400">Date-wise VT check-in and check-out details.</p>
    </div>

    <Card padding="md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300"><span className="sr-only">District</span><select aria-label="District" className={selectClass} value={selectedDistrict} onChange={(event) => { const value = event.target.value; setSelectedDistrict(value); setSelectedBlock(''); setBlocks([]); setIsBlocksLoading(Boolean(value)); resetForFilters(); }}><option value="">All Districts</option>{districts.map((district) => <option key={district.district_cd} value={district.district_cd}>{district.district_name}</option>)}</select></label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300"><span className="sr-only">Block</span><select aria-label="Block" className={selectClass} value={selectedBlock} onChange={(event) => { setSelectedBlock(event.target.value); resetForFilters(); }} disabled={!selectedDistrict || isBlocksLoading}><option value="">{isBlocksLoading ? 'Loading Blocks...' : 'All Blocks'}</option>{blocks.map((block) => <option key={block.block_cd} value={block.block_cd}>{block.block_name}</option>)}</select></label>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300"><span className="sr-only">Attendance Date</span><input aria-label="Attendance Date" type="date" className={selectClass} value={selectedDate} max={today} onChange={(event) => { setSelectedDate(event.target.value || today); resetForFilters(); }} /></label>
      </div>
      {locationError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{locationError}</p>}
    </Card>

    {/* {error && <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"><div className="flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span className="text-sm">{error}</span></div><button type="button" className="text-sm font-semibold underline" onClick={() => { setLoading(true); setError(''); setRefreshKey((value) => value + 1); }}>Retry</button></div>} */}

    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white"><Clock3 className="h-5 w-5" />VT Check-In/Out List</h2><p className="text-sm text-gray-500 dark:text-gray-400">Checked-in VTs for {selectedDate}.</p></div><select aria-label="Rows per page" value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); setLoading(true); setError(''); }} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">{[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size} / page</option>)}</select></div>
      {loading ? <Card><div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">Loading VT attendance...</div></Card> : <Table columns={columns} data={rows} keyExtractor={(row) => row.user_id} emptyState={<Card><div className="py-12 text-center text-gray-500 dark:text-gray-400">No checked-in VTs found.</div></Card>} />}
      {!loading && !error && <Pagination currentPage={list.page} totalPages={list.total_pages} totalItems={list.total} pageSize={list.limit} onPageChange={(nextPage) => { setPage(nextPage); setLoading(true); setError(''); }} />}
    </section>
  </div>;
};

export default DailyAttendance;
