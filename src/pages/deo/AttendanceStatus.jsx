import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  MapPin,
  RefreshCw,
  Search,
  Timer,
  UserCheck,
  UserX,
  X,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Pagination from '../../components/common/Pagination';
import Table from '../../components/common/Table';
import api from '../../services/api';

/* ─── Constants ──────────────────────────────────────────────────────────── */

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

const ATTENDANCE_STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'late', label: 'Late' },
  { value: 'half_day', label: 'Half Day' },
];

const DEFAULT_PAGINATION = { total: 0, page: 1, limit: 10, total_pages: 1 };

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const calcWorkHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60);
  if (diff <= 0) return null;
  return `${Math.floor(diff / 60)}h ${Math.round(diff % 60)}m`;
};

const statusColors = {
  present: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', border: 'border-emerald-200 dark:border-emerald-800' },
  absent: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500', border: 'border-red-200 dark:border-red-800' },
  on_leave: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500', border: 'border-amber-200 dark:border-amber-800' },
  late: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500', border: 'border-orange-200 dark:border-orange-800' },
  half_day: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500', border: 'border-blue-200 dark:border-blue-800' },
};

const AttendancePill = ({ status }) => {
  const cfg = statusColors[status?.toLowerCase()] || statusColors.absent;
  const label = status ? status.replace(/_/g, ' ') : '-';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      <span className="capitalize">{label}</span>
    </span>
  );
};

const AvatarCell = ({ name, sub }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
    <div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{name || '-'}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{sub || '-'}</p>
    </div>
  </div>
);

const TimeCell = ({ value, icon: Icon = Clock }) => (
  <div className="flex items-center gap-1.5">
    <Icon className="h-3.5 w-3.5 text-gray-400" />
    <span className="text-sm text-gray-700 dark:text-gray-300">{formatTime(value)}</span>
  </div>
);

/* ─── Table columns ───────────────────────────────────────────────────────── */
const COLUMNS = [
  {
    key: '_seno',
    header: '#',
    render: (_, __, index) => (
      <span className="text-xs font-medium text-gray-400">{index + 1}</span>
    ),
  },
  {
    key: 'vt_name',
    header: 'Teacher / Trade',
    render: (value, row) => <AvatarCell name={value} sub={row.trade || '-'} />,
  },
  {
    key: 'school_name',
    header: 'School',
    render: (value, row) => (
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{value || '-'}</p>
        <p className="text-xs text-gray-500">UDISE: {row.udise_code || '-'}</p>
      </div>
    ),
  },
  {
    key: 'vtp_name',
    header: 'VTP',
    render: (value) => (
      <span className="text-sm text-gray-700 dark:text-gray-300">{value || '-'}</span>
    ),
  },
  {
    key: 'block_name',
    header: 'Block / District',
    render: (value, row) => (
      <div className="flex items-start gap-1.5">
        <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{value || '-'}</p>
          <p className="text-xs text-gray-500">{row.district_name || '-'}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'date',
    header: 'Date',
    render: (value) => (
      <div className="flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
        <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(value)}</span>
      </div>
    ),
  },
  {
    key: 'check_in_time',
    header: 'Check In',
    render: (value) => <TimeCell value={value} />,
  },
  {
    key: 'check_out_time',
    header: 'Check Out',
    render: (value) => <TimeCell value={value} />,
  },
  {
    key: '_hours',
    header: 'Hours',
    render: (_, row) => {
      const hrs = calcWorkHours(row.check_in_time, row.check_out_time);
      return (
        <div className="flex items-center gap-1">
          <Timer className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{hrs || '-'}</span>
        </div>
      );
    },
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => <AttendancePill status={value} />,
  },
];

/* ─── Summary stat card ───────────────────────────────────────────────────── */
const StatTile = ({ label, value, icon: Icon, colorClass }) => (
  <div className={`flex items-center gap-3 rounded-2xl border p-4 ${colorClass}`}>
    <div className="rounded-xl p-2 bg-white/50 dark:bg-black/20">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-2xl font-bold">{value ?? '-'}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  </div>
);

/* ─── Main component ──────────────────────────────────────────────────────── */
const AttendanceStatus = () => {
  /* filter state */
  const [tradeFilter, setTradeFilter] = useState('');
  const [vtpFilter, setVtpFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('');

  /* location master — same pattern as Attendance.jsx */
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingClusters, setLoadingClusters] = useState(false);

  /* table state */
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* summary counts derived from current page data */
  const [summary, setSummary] = useState({ present: 0, absent: 0, on_leave: 0, total: 0 });

  /* debounce refs for text inputs */
  const tradeDebounce = useRef(null);
  const vtpDebounce = useRef(null);
  const [tradeInput, setTradeInput] = useState('');
  const [vtpInput, setVtpInput] = useState('');

  /* ── Fetch ────────────────────────────────────────────────────────────── */
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        page: currentPage,
        limit: pageSize,
      };

      if (statusFilter) payload.status = statusFilter;
      if (tradeFilter.trim()) payload.trade = tradeFilter.trim();
      if (vtpFilter.trim()) payload.vtp_name = vtpFilter.trim();
      if (fromDate) payload.from_date = fromDate;
      if (toDate) payload.to_date = toDate;
      if (selectedBlock) payload.block_cd = Number(selectedBlock);
      if (selectedCluster) payload.cluster_cd = Number(selectedCluster);

      const response = await api.post('/deo/attendance', payload);

      const data = response.data?.data || [];
      const pag = response.data?.pagination || DEFAULT_PAGINATION;

      setRows(data);
      setPagination(pag);

      /* compute summary from current page */
      const counts = { present: 0, absent: 0, on_leave: 0, total: pag.total || data.length };
      data.forEach((row) => {
        const s = (row.status || '').toLowerCase();
        if (s === 'present') counts.present += 1;
        else if (s === 'absent') counts.absent += 1;
        else if (s === 'on_leave') counts.on_leave += 1;
      });
      setSummary(counts);
    } catch (err) {
      console.error('fetchAttendance error:', err);
      const msg = err?.response?.data?.message || 'Failed to load attendance data.';
      setError(msg);
      setRows([]);
      setPagination(DEFAULT_PAGINATION);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, tradeFilter, vtpFilter, fromDate, toDate, selectedBlock, selectedCluster]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  /* ── Load district from dashboard-counts on mount (same as Attendance.jsx) */
  useEffect(() => {
    api.get('/deo/dashboard-counts')
      .then((res) => {
        if (res.data?.district?.district_cd) {
          setSelectedDistrict(String(res.data.district.district_cd));
          setSelectedDistrictName(res.data.district.district_name || '');
        }
      })
      .catch(() => { });
  }, []);

  /* ── Load blocks when district is known (mirrors Attendance.jsx exactly) */
  useEffect(() => {
    if (!selectedDistrict) {
      setBlocks([]);
      setSelectedBlock('');
      setClusters([]);
      setSelectedCluster('');
      return;
    }

    setLoadingBlocks(true);
    api.get('/reports/location-master', { params: { type: 'blocks', district_cd: selectedDistrict } })
      .then((response) => setBlocks(response.data?.data || []))
      .catch(() => setBlocks([]))
      .finally(() => setLoadingBlocks(false));

    setSelectedBlock('');
    setClusters([]);
    setSelectedCluster('');
  }, [selectedDistrict]);

  /* ── Load clusters when block is selected (mirrors Attendance.jsx exactly) */
  useEffect(() => {
    if (!selectedDistrict || !selectedBlock) {
      setClusters([]);
      setSelectedCluster('');
      return;
    }

    setLoadingClusters(true);
    api.get('/reports/location-master', {
      params: { type: 'clusters', district_cd: selectedDistrict, block_cd: selectedBlock },
    })
      .then((response) => setClusters(response.data?.data || []))
      .catch(() => setClusters([]))
      .finally(() => setLoadingClusters(false));

    setSelectedCluster('');
  }, [selectedDistrict, selectedBlock]);

  /* ── Reset page on filter change ──────────────────────────────────────── */
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, tradeFilter, vtpFilter, fromDate, toDate, selectedBlock, selectedCluster, pageSize]);

  /* ── Debounced text filter handlers ───────────────────────────────────── */
  const handleTradeInput = (e) => {
    setTradeInput(e.target.value);
    clearTimeout(tradeDebounce.current);
    tradeDebounce.current = setTimeout(() => setTradeFilter(e.target.value), 500);
  };

  const handleVtpInput = (e) => {
    setVtpInput(e.target.value);
    clearTimeout(vtpDebounce.current);
    vtpDebounce.current = setTimeout(() => setVtpFilter(e.target.value), 500);
  };

  const clearAllFilters = () => {
    setTradeFilter('');
    setVtpFilter('');
    setTradeInput('');
    setVtpInput('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
    setSelectedBlock('');
    setSelectedCluster('');
    setCurrentPage(1);
  };

  const hasActiveFilters = tradeFilter || vtpFilter || statusFilter || fromDate || toDate || selectedBlock || selectedCluster;

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Status</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track VT teacher daily attendance across your district
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchAttendance}
          disabled={loading}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ── Summary Tiles ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label="Total Records"
          value={pagination.total}
          icon={GraduationCap}
          colorClass="border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200"
        />
        <StatTile
          label="Present"
          value={summary.present}
          icon={CheckCircle2}
          colorClass="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
        />
        <StatTile
          label="Absent"
          value={summary.absent}
          icon={UserX}
          colorClass="border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
        />
        <StatTile
          label="On Leave"
          value={summary.on_leave}
          icon={XCircle}
          colorClass="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300"
        />
      </div>

      {/* ── Filters ── */}
      <Card variant="elevated">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-primary-500" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filters</h2>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear all
            </button>
          )}
        </div>

        {/* Row 1 — text filters + status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Trade */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Trade
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="e.g. IT-ITeS, Electrical…"
                value={tradeInput}
                onChange={handleTradeInput}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>
          </div>

          {/* VTP Name */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              VTP Name
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search VTP…"
                value={vtpInput}
                onChange={handleVtpInput}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Page size */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Records / Page
            </label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size} / page</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2 — date range + location */}
        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 dark:border-gray-700 sm:grid-cols-2 lg:grid-cols-4">
          {/* From date */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              From Date
            </label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>
          </div>

          {/* To date */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              To Date
            </label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-gray-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              />
            </div>
          </div>

          {/* Block */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Block
            </label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              disabled={!selectedDistrict || loadingBlocks}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="">All Blocks</option>
              {blocks.map((b) => (
                <option key={b.block_cd} value={b.block_cd}>{b.block_name}</option>
              ))}
            </select>
          </div>

          {/* Cluster */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Cluster
            </label>
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              disabled={!selectedBlock || loadingClusters}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="">All Clusters</option>
              {clusters.map((c) => (
                <option key={c.cluster_cd} value={c.cluster_cd}>{c.cluster_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Active:</span>
            {tradeFilter && (
              <FilterChip label={`Trade: ${tradeFilter}`} onRemove={() => { setTradeFilter(''); setTradeInput(''); }} />
            )}
            {vtpFilter && (
              <FilterChip label={`VTP: ${vtpFilter}`} onRemove={() => { setVtpFilter(''); setVtpInput(''); }} />
            )}
            {statusFilter && (
              <FilterChip label={`Status: ${statusFilter}`} onRemove={() => setStatusFilter('')} />
            )}
            {fromDate && (
              <FilterChip label={`From: ${fromDate}`} onRemove={() => setFromDate('')} />
            )}
            {toDate && (
              <FilterChip label={`To: ${toDate}`} onRemove={() => setToDate('')} />
            )}
            {selectedBlock && (
              <FilterChip
                label={`Block: ${blocks.find((b) => String(b.block_cd) === String(selectedBlock))?.block_name || selectedBlock}`}
                onRemove={() => setSelectedBlock('')}
              />
            )}
            {selectedCluster && (
              <FilterChip
                label={`Cluster: ${clusters.find((c) => String(c.cluster_cd) === String(selectedCluster))?.cluster_name || selectedCluster}`}
                onRemove={() => setSelectedCluster('')}
              />
            )}
          </div>
        )}
      </Card>

      {/* ── Data Table ── */}
      <Card variant="elevated">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Records</h2>
            {selectedDistrictName && (
              <span className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-300">
                <MapPin className="h-3 w-3" />
                {selectedDistrictName}
              </span>
            )}
          </div>
          <Badge variant="primary" outline>
            {pagination.total ?? 0} Records
          </Badge>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300">
            <span className="inline-flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </span>
            <Button variant="ghost" size="sm" onClick={fetchAttendance}>Retry</Button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && rows.length === 0 && (
          <div className="space-y-3 py-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        )}

        {!loading || rows.length > 0 ? (
          <>
            <Table
              data={rows}
              columns={COLUMNS}
              keyExtractor={(row, idx) => row.id || idx}
              emptyState={
                <div className="py-16 text-center">
                  <UserCheck className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
                  <p className="font-medium text-gray-500 dark:text-gray-400">No attendance records found</p>
                  <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">Try adjusting your filters</p>
                </div>
              }
            />
            <div className="mt-4">
              <Pagination
                currentPage={pagination.page || currentPage}
                totalPages={pagination.total_pages || 1}
                pageSize={pagination.limit || pageSize}
                totalItems={pagination.total || 0}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        ) : null}
      </Card>
    </div>
  );
};

/* ─── Filter chip ─────────────────────────────────────────────────────────── */
const FilterChip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 ring-1 ring-primary-200 dark:bg-primary-900/20 dark:text-primary-300 dark:ring-primary-800">
    {label}
    <button type="button" onClick={onRemove} className="ml-0.5 hover:text-primary-900 dark:hover:text-white">
      <X className="h-3 w-3" />
    </button>
  </span>
);

export default AttendanceStatus;
