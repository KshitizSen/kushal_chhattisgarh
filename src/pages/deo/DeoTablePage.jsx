/* eslint-disable react-hooks/set-state-in-effect */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CalendarCheck,
  Clock,
  Filter,
  GraduationCap,
  MapPin,
  Search,
  School,
  Timer,
  Users,
} from 'lucide-react';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import Table from '../../components/common/Table';
import api from '../../services/api';

const attendanceRows = [
  {
    id: 1,
    vt_name: 'Bhagvatee Sahu',
    trade: 'Apparel & Home Furnishing',
    school_name: 'GOVT HSS KAPADAH',
    udise: '22081301906',
    block_name: 'Pandariya',
    district_name: 'Kabirdham',
    date: '2026-04-30',
    check_in_time: '2026-04-30T09:05:00',
    check_out_time: '2026-04-30T16:12:00',
    status: 'present',
  },
  {
    id: 2,
    vt_name: 'Ramesh Kumar',
    trade: 'IT/ITeS',
    school_name: 'GOVT HSS KAPADAH',
    udise: '22081301906',
    block_name: 'Pandariya',
    district_name: 'Kabirdham',
    date: '2026-04-30',
    check_in_time: '2026-04-30T09:42:00',
    check_out_time: '2026-04-30T16:05:00',
    status: 'late',
  },
  {
    id: 3,
    vt_name: 'Sunita Devi',
    trade: 'Beauty & Wellness',
    school_name: 'GOVT HS PANDARIYA',
    udise: '22081302001',
    block_name: 'Pandariya',
    district_name: 'Kabirdham',
    date: '2026-04-30',
    check_in_time: '2026-04-30T08:55:00',
    check_out_time: '2026-04-30T15:58:00',
    status: 'present',
  },
  {
    id: 4,
    vt_name: 'Ajay Singh',
    trade: 'Electronics',
    school_name: 'GOVT HS LORMI',
    udise: '22081401503',
    block_name: 'Lormi',
    district_name: 'Mungeli',
    date: '2026-04-30',
    check_in_time: null,
    check_out_time: null,
    status: 'absent',
  },
  {
    id: 5,
    vt_name: 'Priya Sharma',
    trade: 'Retail',
    school_name: 'GOVT HS LORMI',
    udise: '22081401503',
    block_name: 'Lormi',
    district_name: 'Mungeli',
    date: '2026-04-30',
    check_in_time: null,
    check_out_time: null,
    status: 'leave',
  },
];

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN') : '-');
const formatTime = (value) => (value ? new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-');

const DEFAULT_PAGINATION = {
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 50,
};

const createInitialPagination = (limit) => ({
  ...DEFAULT_PAGINATION,
  limit: limit || DEFAULT_PAGINATION.limit,
});

const calcWorkHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '-';
  const diff = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60);
  if (diff <= 0) return '-';
  return `${Math.floor(diff / 60)}h ${Math.round(diff % 60)}m`;
};

const personCell = (name, subtitle) => (
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-600">
      {name?.charAt(0) || '?'}
    </div>
    <div>
      <p className="font-medium text-gray-900 dark:text-white">{name || '-'}</p>
      <p className="text-xs text-gray-500">{subtitle || '-'}</p>
    </div>
  </div>
);

const schoolCell = (name, row) => (
  <div>
    <p className="font-medium text-gray-900 dark:text-white">{name || '-'}</p>
    <p className="text-xs text-gray-500">{row.udise_code ? `UDISE: ${row.udise_code}` : `${row.block_name}, ${row.district_name}`}</p>
  </div>
);

const attendanceColumns = [
  { key: 'vt_name', header: 'Teacher', render: (value, row) => personCell(value, row.trade) },
  {
    key: 'school_name',
    header: 'School',
    render: (value, row) => (
      <div>
        <p className="text-sm text-gray-700 dark:text-gray-300">{value || '-'}</p>
        <p className="text-xs text-gray-500">{row.block_name}, {row.district_name}</p>
      </div>
    ),
  },
  { key: 'date', header: 'Date', render: formatDate },
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
    key: 'work_hours',
    header: 'Work Hours',
    render: (_, row) => (
      <div className="flex items-center gap-1">
        <Timer className="h-4 w-4 text-gray-400" />
        <span className="text-sm">{calcWorkHours(row.check_in_time, row.check_out_time)}</span>
      </div>
    ),
  },
  { key: 'status', header: 'Status', render: (value) => <StatusBadge status={value} /> },
];

const pageConfig = {
  attendance: {
    title: 'Attendance',
    subtitle: 'Track VT teacher attendance records across schools',
    searchPlaceholder: 'Search by teacher, trade, school or UDISE...',
    icon: CalendarCheck,
    rows: attendanceRows,
    statusKey: 'status',
    columns: attendanceColumns,
  },
  vtps: {
    title: "VTP's",
    subtitle: 'Vocational training provider list',
    searchPlaceholder: 'Search VTP by name, contact, email or district...',
    icon: Building2,
    statusKey: 'status',
    idKey: 'vtp_id',
    api: {
      endpoint: '/deo/vtps',
      limit: 10,
      statusParam: 'status',
    },
    mapRow: (row) => ({
      ...row,
      status: row.status || 'active',
    }),
    columns: [
      { key: 'serial_no', header: 'No.' },
      { key: 'vtp_name', header: 'VTP Name', render: (value, row) => personCell(value, row.email) },
      { key: 'vc_name', header: 'Contact Person', render: (value, row) => <div><p>{value || '-'}</p><p className="text-xs text-gray-500">{row.mobile || '-'}</p></div> },
      { key: 'district_name', header: 'District', render: (value) => <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-gray-400" />{value || '-'}</span> },
      { key: 'schools_count', header: 'Schools' },
      { key: 'teachers_count', header: 'VT Teachers' },
      { key: 'status', header: 'Status', render: (value) => <StatusBadge status={value || 'inactive'} /> },
    ],
  },
  schools: {
    title: 'VT School',
    subtitle: 'Pending school reports for DEO review',
    searchPlaceholder: 'Search school by name, UDISE, block or district...',
    icon: School,
    statusKey: 'deo_approval_status',
    idKey: 'report_id',
    api: {
      endpoint: '/deo/school-reports',
      params: { status: 'pending' },
      limit: 50,
      statusParam: 'status',
    },
    mapRow: (row) => ({
      ...row,
      deo_approval_status: row.deo_approval_status || 'pending',
      hm_approval_status: row.hm_approval_status || 'pending',
      vtp_approval_status: row.vtp_approval_status || 'pending',
    }),
    columns: [
      { key: 'school_name', header: 'School', render: schoolCell },
      { key: 'block_name', header: 'Block', render: (value, row) => <div><p>{value}</p><p className="text-xs text-gray-500">{row.district_name}</p></div> },
      { key: 'hm_approval_status', header: 'HM Status', render: (value) => <StatusBadge status={value || 'pending'} /> },
      { key: 'vtp_approval_status', header: 'VTP Status', render: (value) => <StatusBadge status={value || 'pending'} /> },
      { key: 'deo_approval_status', header: 'DEO Status', render: (value) => <StatusBadge status={value || 'pending'} /> },
    ],
  },
  teachers: {
    title: 'VT Teacher',
    subtitle: 'Vocational teacher details with school and VTP mapping',
    searchPlaceholder: 'Search teacher by name, trade, school, VTP or phone...',
    icon: GraduationCap,
    statusKey: 'status',
    idKey: 'id',
    api: {
      endpoint: '/deo/vt-teachers',
      limit: 10,
      statusParam: 'status',
    },
    mapRow: (row) => ({
      ...row,
      status: row.status || 'pending',
    }),
    columns: [
      { key: 'serial_no', header: 'No.' },
      { key: 'vt_name', header: 'Teacher', render: (value, row) => personCell(value, row.trade) },
      { key: 'school_name', header: 'School', render: schoolCell },
      { key: 'vtp_name', header: 'VTP' },
      { key: 'phone', header: 'Phone' },
      { key: 'email', header: 'Email' },
      { key: 'status', header: 'Status', render: (value) => <StatusBadge status={value || 'pending'} /> },
    ],
  },
};

const DeoTablePage = ({ type }) => {
  const config = pageConfig[type] || pageConfig.attendance;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [apiRows, setApiRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(createInitialPagination(config.api?.limit));
  const [currentPage, setCurrentPage] = useState(1);

  const Icon = config.icon;
  const isApiPage = Boolean(config.api);
  const rows = isApiPage ? apiRows : config.rows;
  const statusKey = config.statusKey || 'status';

  const fetchRows = useCallback(async () => {
    if (!config.api) return;

    setLoading(true);
    setError('');

    const pageLimit = pagination.limit || config.api.limit || DEFAULT_PAGINATION.limit;
    const requestParams = {
      ...config.api.params,
      page: currentPage,
      limit: pageLimit,
    };

    if (searchQuery.trim()) {
      requestParams.search = searchQuery.trim();
    }

    if (statusFilter) {
      requestParams[config.api.statusParam || 'status'] = statusFilter;
    }

    try {
      const response = await api.get(config.api.endpoint, { params: requestParams });
      const responseRows = response.data?.data || [];
      const serverPagination = {
        ...createInitialPagination(pageLimit),
        ...(response.data?.pagination || {}),
      };

      const mappedRows = responseRows.map((row, index) => {
        const mapped = config.mapRow ? config.mapRow(row) : row;
        const serialNo = ((serverPagination.currentPage || 1) - 1) * (serverPagination.limit || pageLimit) + index + 1;
        const rowId = mapped.id || mapped[config.idKey] || row.id || row.report_id || row.udise_code || serialNo;

        return {
          ...mapped,
          id: rowId,
          serial_no: serialNo,
        };
      });

      setApiRows(mappedRows);
      setPagination(serverPagination);
    } catch (fetchError) {
      console.error(`Failed to fetch ${config.title}:`, fetchError);
      setApiRows([]);
      setPagination(createInitialPagination(config.api.limit));
      setError(`${config.title} list could not be loaded.`);
    } finally {
      setLoading(false);
    }
  }, [config, currentPage, pagination.limit, searchQuery, statusFilter]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    setSearchQuery('');
    setStatusFilter('');
    setCurrentPage(1);
    setApiRows([]);
    setPagination(createInitialPagination(config.api?.limit));
    setError('');
  }, [type]);

  useEffect(() => {
    if (!isApiPage) return;
    setCurrentPage(1);
  }, [searchQuery, statusFilter, isApiPage]);

  const statuses = useMemo(
    () => [...new Set(rows.map((row) => row[statusKey]).filter(Boolean))],
    [rows, statusKey]
  );

  const filteredRows = useMemo(() => {
    if (isApiPage) return rows;

    const query = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch = !query || Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(query));
      const matchesStatus = !statusFilter || row[statusKey] === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [isApiPage, rows, searchQuery, statusFilter, statusKey]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-300">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{config.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{config.subtitle}</p>
          </div>
        </div>
      </div>

      <Card variant="elevated">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder={config.searchPlaceholder}
              leftIcon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <option value="">All Status</option>
              {statuses.map((status) => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card variant="elevated">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{config.title} List</h2>
          <Badge variant="primary" outline>{isApiPage ? pagination.totalItems : filteredRows.length} Records</Badge>
        </div>
        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300">
            <span className="inline-flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </span>
            <Button variant="ghost" size="sm" onClick={fetchRows}>Retry</Button>
          </div>
        )}
        <Table
          data={filteredRows}
          columns={config.columns}
          keyExtractor={(row, index) => row.id || row.udise_code || index}
          emptyState={
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500 dark:text-gray-400">{loading ? 'Loading records...' : 'No records found'}</p>
            </div>
          }
        />
        {isApiPage && (
          <div className="mt-4">
            <Pagination
              currentPage={pagination.currentPage || currentPage}
              totalPages={pagination.totalPages || 1}
              pageSize={pagination.limit || DEFAULT_PAGINATION.limit}
              totalItems={pagination.totalItems || 0}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export { DeoTablePage };
export default DeoTablePage;
