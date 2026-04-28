import React, { useCallback, useEffect, useState } from 'react';
import {
  CalendarCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  UserX,
  Timer,
  Edit3,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';

// ── Helpers ──────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0];

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

// Build "YYYY-MM-DD,YYYY-MM-DD" range string used by the API
const buildDateRange = (from, to) => `${from},${to}`;

// Derive a week's Monday–Sunday from a given date
const weekRange = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0=Sun
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return { from: mon.toISOString().split('T')[0], to: sun.toISOString().split('T')[0] };
};

// ── Component ─────────────────────────────────────────────────────────────────
const Attendance = () => {
  // ── Tab & date state ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('today');   // today | date | week | month | date_range
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [dateRangeFrom, setDateRangeFrom] = useState(todayStr());
  const [dateRangeTo, setDateRangeTo] = useState(todayStr());

  // ── Filter state ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');   // '' = all
  const [page, setPage] = useState(1);
  const LIMIT = 50;

  // ── Data state ────────────────────────────────────────────────────
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ present: 0, late: 0, absent: 0, leave: 0, half_day: 0 });
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1 });
  const [loading, setLoading] = useState(false);

  // ── Modal state ───────────────────────────────────────────────────
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // ── Build payload from current tab + filters ──────────────────────
  const buildPayload = useCallback(() => {
    const base = {
      status: statusFilter || undefined,
      limit: LIMIT,
      page,
    };

    switch (activeTab) {
      case 'today':
        return { ...base, filter_type: 'date', filter_value: todayStr() };

      case 'date':
        return { ...base, filter_type: 'date', filter_value: selectedDate };

      case 'week': {
        const { from, to } = weekRange(selectedDate);
        return { ...base, filter_type: 'date_range', filter_value: buildDateRange(from, to) };
      }

      case 'month': {
        const d = new Date(selectedDate);
        const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        const to = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${lastDay}`;
        return { ...base, filter_type: 'date_range', filter_value: buildDateRange(from, to) };
      }

      case 'date_range':
        return {
          ...base,
          filter_type: 'date_range',
          filter_value: buildDateRange(dateRangeFrom, dateRangeTo),
        };

      default:
        return base;
    }
  }, [activeTab, selectedDate, dateRangeFrom, dateRangeTo, statusFilter, page]);

  // ── Fetch ─────────────────────────────────────────────────────────
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const payload = buildPayload();
      const res = await api.post('/attendance/headmaster', payload);

      if (res.data?.status) {
        const data = res.data.data || [];
        setRecords(data);
        setPagination(res.data.pagination || { total: 0, total_pages: 1 });

        // Compute summary from returned records
        const s = { present: 0, late: 0, absent: 0, leave: 0, half_day: 0 };
        data.forEach((r) => {
          const st = r.status?.toLowerCase();
          if (st === 'present')  s.present++;
          else if (st === 'late')     s.late++;
          else if (st === 'absent')   s.absent++;
          else if (st === 'leave')    s.leave++;
          else if (st === 'half_day') s.half_day++;
        });
        setSummary(s);
      } else {
        toast.error(res.data?.message || 'Failed to load attendance');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error loading attendance');
    } finally {
      setLoading(false);
    }
  }, [buildPayload]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, selectedDate, dateRangeFrom, dateRangeTo, statusFilter]);

  // ── Helpers ───────────────────────────────────────────────────────
  const handleDateChange = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // ── Client-side search filter (server handles status + date) ──────
  const filteredData = records.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.vt_name?.toLowerCase().includes(q) ||
      r.trade?.toLowerCase().includes(q) ||
      r.school_name?.toLowerCase().includes(q) ||
      r.vt_phone?.includes(q)
    );
  });

  // ── Table columns ─────────────────────────────────────────────────
  const formatTime = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const calcWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '—';
    const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60); // minutes
    if (diff <= 0) return '—';
    const h = Math.floor(diff / 60);
    const m = Math.round(diff % 60);
    return `${h}h ${m}m`;
  };

  const columns = [
    {
      key: 'vt_name',
      header: 'Teacher',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
            {value?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value || '—'}</p>
            <p className="text-xs text-gray-500">{row.trade || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'school_name',
      header: 'School',
      render: (value, row) => (
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{value || '—'}</p>
          <p className="text-xs text-gray-500">{row.block_name}, {row.district_name}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (value) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {value ? new Date(value).toLocaleDateString('en-IN') : '—'}
        </span>
      ),
    },
    {
      key: 'check_in_time',
      header: 'Check In',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{formatTime(value)}</span>
        </div>
      ),
    },
    {
      key: 'check_out_time',
      header: 'Check Out',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{formatTime(value)}</span>
        </div>
      ),
    },
    {
      key: 'check_out_time',
      header: 'Work Hours',
      render: (value, row) => (
        <div className="flex items-center gap-1">
          <Timer className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{calcWorkHours(row.check_in_time, value)}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
  ];

  const tabs = [
    { id: 'today',      label: 'Today',        icon: CalendarCheck },
    { id: 'date',       label: 'By Date',      icon: Calendar },
    { id: 'week',       label: 'This Week',    icon: Timer },
    { id: 'month',      label: 'This Month',   icon: AlertCircle },
    { id: 'date_range', label: 'Date Range',   icon: Filter },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Attendance Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage VT teacher attendance records
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={fetchAttendance}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Present',  value: summary.present,  color: 'green',  Icon: UserCheck },
          { label: 'Late',     value: summary.late,     color: 'yellow', Icon: Clock },
          { label: 'Absent',   value: summary.absent,   color: 'red',    Icon: UserX },
          { label: 'On Leave', value: summary.leave,    color: 'blue',   Icon: AlertCircle },
        ].map(({ label, value, color, Icon }) => (
          <Card
            key={label}
            variant="elevated"
            className={`bg-gradient-to-br from-${color}-50 to-${color}-100 dark:from-${color}-900/20 dark:to-${color}-900/10`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium text-${color}-700 dark:text-${color}-300`}>{label}</p>
                <p className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
              </div>
              <div className={`p-3 rounded-2xl bg-${color}-100 dark:bg-${color}-900/30`}>
                <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Date Controls */}
      {(activeTab === 'date' || activeTab === 'week' || activeTab === 'month') && (
        <Card variant="elevated">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" leftIcon={<ChevronLeft className="h-4 w-4" />}
              onClick={() => handleDateChange(-1)}>Prev</Button>
            <div className="flex-1 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {activeTab === 'week'
                    ? (() => { const { from, to } = weekRange(selectedDate); return `${from} → ${to}`; })()
                    : activeTab === 'month'
                    ? new Date(selectedDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                    : formatDate(selectedDate)}
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="ml-2 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                />
              </div>
            </div>
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}
              onClick={() => handleDateChange(1)}>Next</Button>
          </div>
        </Card>
      )}

      {/* Date Range Picker */}
      {activeTab === 'date_range' && (
        <Card variant="elevated">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
              <input
                type="date"
                value={dateRangeFrom}
                onChange={(e) => setDateRangeFrom(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              />
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">To</label>
              <input
                type="date"
                value={dateRangeTo}
                min={dateRangeFrom}
                onChange={(e) => setDateRangeTo(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
              Sending: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{buildDateRange(dateRangeFrom, dateRangeTo)}</code>
            </p>
          </div>
        </Card>
      )}

      {/* Today label */}
      {activeTab === 'today' && (
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <CalendarCheck className="h-5 w-5" />
          <span>Today: {formatDate(todayStr())}</span>
          <Badge variant="primary" size="sm">Live</Badge>
        </div>
      )}

      {/* Filters */}
      <Card variant="elevated">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, trade or email..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
              <option value="half_day">Half Day</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activeTab === 'today' ? "Today's Attendance" :
             activeTab === 'week'  ? 'This Week\'s Attendance' :
             activeTab === 'month' ? 'This Month\'s Attendance' :
             activeTab === 'date_range' ? 'Attendance — Date Range' :
             `Attendance for ${formatDate(selectedDate)}`}
          </h2>
          <div className="flex items-center gap-3">
            <Badge variant="primary" outline>
              {pagination.total} Records
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader text="Loading attendance data..." />
          </div>
        ) : (
          <Table
            data={filteredData}
            columns={columns}
            emptyState={
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No attendance records found</p>
              </div>
            }
          />
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost" size="sm"
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {pagination.total_pages}
            </span>
            <Button
              variant="ghost" size="sm"
              rightIcon={<ChevronRight className="h-4 w-4" />}
              disabled={page === pagination.total_pages}
              onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Attendance;
