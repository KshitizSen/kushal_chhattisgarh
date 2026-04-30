import React, { useMemo, useState } from 'react';
import {
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
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';

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

const vtpRows = [
  { id: 1, name: 'Kushal Skill Foundation', contact: 'Amit Verma', phone: '9876543210', email: 'amit@ksf.org', schools: 12, teachers: 24, district: 'Kabirdham', status: 'active' },
  { id: 2, name: 'Chhattisgarh Vocational Services', contact: 'Neha Sinha', phone: '9876543211', email: 'neha@cvs.org', schools: 8, teachers: 15, district: 'Mungeli', status: 'active' },
  { id: 3, name: 'Future Skills Partner', contact: 'Rohit Patel', phone: '9876543212', email: 'rohit@fsp.org', schools: 5, teachers: 9, district: 'Bilaspur', status: 'pending' },
  { id: 4, name: 'Rural Training Network', contact: 'Seema Yadav', phone: '9876543213', email: 'seema@rtn.org', schools: 3, teachers: 6, district: 'Raipur', status: 'inactive' },
];

const schoolRows = [
  { id: 1, school_name: 'GOVT HSS KAPADAH', udise: '22081301906', block_name: 'Pandariya', district_name: 'Kabirdham', principal: 'Dr. Rajesh Kumar', vtp: 'Kushal Skill Foundation', teachers: 2, status: 'active' },
  { id: 2, school_name: 'GOVT HS PANDARIYA', udise: '22081302001', block_name: 'Pandariya', district_name: 'Kabirdham', principal: 'Sneha Verma', vtp: 'Kushal Skill Foundation', teachers: 1, status: 'active' },
  { id: 3, school_name: 'GOVT HS LORMI', udise: '22081401503', block_name: 'Lormi', district_name: 'Mungeli', principal: 'Anjali Gupta', vtp: 'Chhattisgarh Vocational Services', teachers: 2, status: 'pending' },
  { id: 4, school_name: 'GOVT HSS SAHASPUR', udise: '22081501201', block_name: 'Sahaspur', district_name: 'Kabirdham', principal: 'Vikram Singh', vtp: 'Future Skills Partner', teachers: 1, status: 'active' },
];

const teacherRows = [
  { id: 1, vt_name: 'Bhagvatee Sahu', trade: 'Apparel & Home Furnishing', school_name: 'GOVT HSS KAPADAH', vtp: 'Kushal Skill Foundation', phone: '8103741144', email: 'bhagvatee@example.com', status: 'approved' },
  { id: 2, vt_name: 'Ramesh Kumar', trade: 'IT/ITeS', school_name: 'GOVT HSS KAPADAH', vtp: 'Kushal Skill Foundation', phone: '9876543210', email: 'ramesh@example.com', status: 'pending' },
  { id: 3, vt_name: 'Sunita Devi', trade: 'Beauty & Wellness', school_name: 'GOVT HS PANDARIYA', vtp: 'Kushal Skill Foundation', phone: '7898765432', email: 'sunita@example.com', status: 'approved' },
  { id: 4, vt_name: 'Ajay Singh', trade: 'Electronics', school_name: 'GOVT HS LORMI', vtp: 'Chhattisgarh Vocational Services', phone: '6234567890', email: 'ajay@example.com', status: 'rejected' },
  { id: 5, vt_name: 'Priya Sharma', trade: 'Retail', school_name: 'GOVT HS LORMI', vtp: 'Chhattisgarh Vocational Services', phone: '9012345678', email: 'priya@example.com', status: 'pending' },
];

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-IN') : '-');
const formatTime = (value) => (value ? new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '-');

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
    <p className="text-xs text-gray-500">{row.udise ? `UDISE: ${row.udise}` : `${row.block_name}, ${row.district_name}`}</p>
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
    columns: attendanceColumns,
  },
  vtps: {
    title: "VTP's",
    subtitle: 'Vocational training provider list',
    searchPlaceholder: 'Search VTP by name, contact, email or district...',
    icon: Building2,
    rows: vtpRows,
    columns: [
      { key: 'name', header: 'VTP Name', render: (value, row) => personCell(value, row.email) },
      { key: 'contact', header: 'Contact Person', render: (value, row) => <div><p>{value}</p><p className="text-xs text-gray-500">{row.phone}</p></div> },
      { key: 'district', header: 'District', render: (value) => <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4 text-gray-400" />{value}</span> },
      { key: 'schools', header: 'Schools' },
      { key: 'teachers', header: 'VT Teachers' },
      { key: 'status', header: 'Status', render: (value) => <StatusBadge status={value} /> },
    ],
  },
  schools: {
    title: 'VT School',
    subtitle: 'Schools mapped with vocational trades and VTPs',
    searchPlaceholder: 'Search school by name, UDISE, block, principal or VTP...',
    icon: School,
    rows: schoolRows,
    columns: [
      { key: 'school_name', header: 'School', render: schoolCell },
      { key: 'block_name', header: 'Block', render: (value, row) => <div><p>{value}</p><p className="text-xs text-gray-500">{row.district_name}</p></div> },
      { key: 'principal', header: 'Principal' },
      { key: 'vtp', header: 'VTP' },
      { key: 'teachers', header: 'VT Teachers' },
      { key: 'status', header: 'Status', render: (value) => <StatusBadge status={value} /> },
    ],
  },
  teachers: {
    title: 'VT Teacher',
    subtitle: 'Vocational teacher details with school and VTP mapping',
    searchPlaceholder: 'Search teacher by name, trade, school, VTP or phone...',
    icon: GraduationCap,
    rows: teacherRows,
    columns: [
      { key: 'vt_name', header: 'Teacher', render: (value, row) => personCell(value, row.trade) },
      { key: 'school_name', header: 'School' },
      { key: 'vtp', header: 'VTP' },
      { key: 'phone', header: 'Phone' },
      { key: 'email', header: 'Email' },
      { key: 'status', header: 'Status', render: (value) => <StatusBadge status={value} /> },
    ],
  },
};

const DeoTablePage = ({ type }) => {
  const config = pageConfig[type] || pageConfig.attendance;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const Icon = config.icon;

  const statuses = useMemo(() => [...new Set(config.rows.map((row) => row.status).filter(Boolean))], [config.rows]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return config.rows.filter((row) => {
      const matchesSearch = !query || Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(query));
      const matchesStatus = !statusFilter || row.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [config.rows, searchQuery, statusFilter]);

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
          <Badge variant="primary" outline>{filteredRows.length} Records</Badge>
        </div>
        <Table
          data={filteredRows}
          columns={config.columns}
          emptyState={
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500 dark:text-gray-400">No records found</p>
            </div>
          }
        />
      </Card>
    </div>
  );
};

export default DeoTablePage;
