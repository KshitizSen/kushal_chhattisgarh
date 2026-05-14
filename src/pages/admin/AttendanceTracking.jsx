import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle,
  FileSearch,
  MapPin,
  RefreshCw,
  Route,
  Search,
  ShieldCheck,
  UserCheck,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';
import { getAdminAttendanceTracking } from '../../services/adminService';

const PAGE_SIZE_OPTIONS = [10, 15, 30, 50];

const MONTH_OPTIONS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const STATUS_CONFIG = {
  approved: {
    label: 'Approved',
    tone: 'green',
    icon: CheckCircle,
    dot: 'bg-green-500',
    text: 'text-green-700 dark:text-green-300',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-500',
    ring: 'ring-green-100 dark:ring-green-900/40',
    connector: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    tone: 'red',
    icon: XCircle,
    dot: 'bg-red-500',
    text: 'text-red-700 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-500',
    ring: 'ring-red-100 dark:ring-red-900/40',
    connector: 'bg-red-500',
  },
  pending: {
    label: 'Pending',
    tone: 'orange',
    icon: AlertCircle,
    dot: 'bg-orange-500',
    text: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-400',
    ring: 'ring-orange-100 dark:ring-orange-900/40',
    connector: 'bg-gray-300 dark:bg-gray-700',
  },
};

const getCurrentMonth = () => new Date().getMonth() + 1;
const getCurrentYear = () => new Date().getFullYear();

const buildYearOptions = () => {
  const currentYear = getCurrentYear();
  return Array.from({ length: 7 }, (_, index) => currentYear - 5 + index);
};

const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.pending;

const getMonthLabel = (month) => MONTH_OPTIONS.find((item) => item.value === Number(month))?.label || month;

const displayValue = (value) => (value === null || value === undefined || value === '' ? 'N/A' : value);

const StatusPill = ({ status }) => {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
};

const ApprovalNode = ({ label, status, icon: Icon, stepLabel, showConnector }) => {
  const config = getStatusConfig(status);

  return (
    <div className="relative flex min-w-[7rem] flex-1 flex-col items-center text-center">
      <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 bg-white shadow-sm ring-4 dark:bg-gray-950 ${config.border} ${config.ring}`}>
        <Icon className={`h-7 w-7 ${config.text}`} />
      </div>
      {showConnector && (
        <div className={`absolute left-[calc(50%+1.75rem)] top-8 hidden h-0.5 w-[calc(100%-3.5rem)] md:block ${config.connector}`} />
      )}
      <p className={`mt-3 text-sm font-bold ${config.text}`}>
        {stepLabel}. {label}
      </p>
      <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">{config.label}</p>
    </div>
  );
};

const TrackingTimeline = ({ report }) => {
  if (!report) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900">
        <FileSearch className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">Select filters to trace an attendance file.</p>
      </div>
    );
  }

  const isComplete =
    report.hm_approval_status === 'approved' &&
    report.vtp_approval_status === 'approved' &&
    report.deo_approval_status === 'approved';

  const steps = [
    { stepLabel: '1A', label: 'Principal / HM', status: report.hm_approval_status, icon: UserCheck },
    { stepLabel: '1B', label: 'VTP Approval', status: report.vtp_approval_status, icon: Building2 },
    { stepLabel: '2', label: 'DEO Approval', status: report.deo_approval_status, icon: ShieldCheck },
    { stepLabel: '3', label: 'Completed', status: isComplete ? 'approved' : 'pending', icon: CheckCircle },
  ];

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="relative bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-6 py-7 text-center dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-white text-blue-600 shadow-sm dark:border-blue-900 dark:bg-gray-950 dark:text-blue-300">
            <FileSearch className="h-7 w-7" />
          </span>
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold leading-tight text-gray-950 dark:text-white">Trace Attendance File</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {report.school_name} | {getMonthLabel(report.report_month)} {report.report_year}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-7">
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((step, index) => (
            <ApprovalNode
              key={step.label}
              label={step.label}
              status={step.status}
              icon={step.icon}
              stepLabel={step.stepLabel}
              showConnector={index < steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const AttendanceTracking = () => {
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [selectedYear, setSelectedYear] = useState(getCurrentYear);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('');
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [summary, setSummary] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const yearOptions = useMemo(() => buildYearOptions(), []);

  const fetchTrackingReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getAdminAttendanceTracking({
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        status: statusFilter,
        month: selectedMonth,
        year: selectedYear,
        district_cd: selectedDistrict,
        block_cd: selectedBlock,
        cluster_cd: selectedCluster,
      });

      const rows = result.data || [];
      setReports(rows);
      setSummary(result.summary || {});
      setPagination({
        total: result.total || 0,
        totalPages: result.total_pages || 1,
      });
      setSelectedReportId((current) => (rows.some((row) => row.id === current) ? current : rows[0]?.id || null));
    } catch (error) {
      setReports([]);
      setSummary({});
      setPagination({ total: 0, totalPages: 1 });
      toast.error(error.response?.data?.message || 'Failed to load attendance tracking');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, selectedMonth, selectedYear, statusFilter, selectedDistrict, selectedBlock, selectedCluster]);

  useEffect(() => {
    api.get('/reports/location-master', { params: { type: 'districts' } })
      .then((response) => setDistricts(response.data?.data || []))
      .catch(() => setDistricts([]));
  }, []);

  useEffect(() => {
    if (!selectedDistrict) {
      setBlocks([]);
      setSelectedBlock('');
      setClusters([]);
      setSelectedCluster('');
      return;
    }

    api.get('/reports/location-master', { params: { type: 'blocks', district_cd: selectedDistrict } })
      .then((response) => setBlocks(response.data?.data || []))
      .catch(() => setBlocks([]));

    setSelectedBlock('');
    setClusters([]);
    setSelectedCluster('');
  }, [selectedDistrict]);

  useEffect(() => {
    if (!selectedDistrict || !selectedBlock) {
      setClusters([]);
      setSelectedCluster('');
      return;
    }

    api.get('/reports/location-master', {
      params: { type: 'clusters', district_cd: selectedDistrict, block_cd: selectedBlock },
    })
      .then((response) => setClusters(response.data?.data || []))
      .catch(() => setClusters([]));

    setSelectedCluster('');
  }, [selectedDistrict, selectedBlock]);

  useEffect(() => {
    fetchTrackingReports();
  }, [fetchTrackingReports]);

  const selectedReport = useMemo(
    () => reports.find((report) => report.id === selectedReportId) || reports[0] || null,
    [reports, selectedReportId]
  );

  const summaryCards = useMemo(() => [
    { label: 'Total Files', value: summary.total_reports || 0, icon: FileSearch, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'HM Approved', value: summary.hm_approved || 0, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'VTP Approved', value: summary.vtp_approved || 0, icon: Building2, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'DEO Approved', value: summary.deo_approved || 0, icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Rejected', value: summary.rejected_reports || 0, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
  ], [summary]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleYearChange = (event) => {
    setSelectedYear(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance Tracking</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track monthly attendance approval from Principal/HM, VTP, and DEO.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            aria-label="Select report month"
          >
            {MONTH_OPTIONS.map((month) => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            aria-label="Select report year"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            aria-label="Select page size"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
          <Button
            variant="primary"
            leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={fetchTrackingReports}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} variant="filled" padding="md">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${bg} ${color}`}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <TrackingTimeline report={selectedReport} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by school, UDISE, district, or block..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          aria-label="Filter by approval status"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select
          value={selectedDistrict}
          onChange={(event) => { setSelectedDistrict(event.target.value); setCurrentPage(1); }}
          className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          <option value="">All Districts</option>
          {districts.map((district) => (
            <option key={district.district_cd} value={district.district_cd}>{district.district_name}</option>
          ))}
        </select>
        <select
          value={selectedBlock}
          onChange={(event) => { setSelectedBlock(event.target.value); setCurrentPage(1); }}
          disabled={!selectedDistrict}
          className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          <option value="">All Blocks</option>
          {blocks.map((block) => (
            <option key={block.block_cd} value={block.block_cd}>{block.block_name}</option>
          ))}
        </select>
        <select
          value={selectedCluster}
          onChange={(event) => { setSelectedCluster(event.target.value); setCurrentPage(1); }}
          disabled={!selectedBlock}
          className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          <option value="">All Clusters</option>
          {clusters.map((cluster) => (
            <option key={cluster.cluster_cd} value={cluster.cluster_cd}>{cluster.cluster_name}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="py-12 text-center">
            <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-primary-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading attendance approvals...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center">
            <Route className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No monthly attendance files found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">School</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Month</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Principal / HM</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">VTP</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">DEO</th>
                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr
                    key={report.id}
                    className={`border-b border-gray-100 transition hover:bg-blue-50/60 dark:border-gray-800 dark:hover:bg-blue-900/10 ${
                      selectedReport?.id === report.id ? 'bg-blue-50/80 dark:bg-blue-900/20' : index % 2 === 1 ? 'bg-gray-50/60 dark:bg-gray-800/30' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                          <FileSearch className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{displayValue(report.school_name)}</span>
                          <span className="block text-xs text-gray-500">UDISE {displayValue(report.udise_code)}</span>
                          <span className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            {displayValue(report.district_name)} | {displayValue(report.block_name)}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {getMonthLabel(report.report_month)} {report.report_year}
                    </td>
                    <td className="px-5 py-4"><StatusPill status={report.hm_approval_status} /></td>
                    <td className="px-5 py-4"><StatusPill status={report.vtp_approval_status} /></td>
                    <td className="px-5 py-4"><StatusPill status={report.deo_approval_status} /></td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant={selectedReport?.id === report.id ? 'primary' : 'ghost'}
                        size="sm"
                        leftIcon={<Route className="h-4 w-4" />}
                        onClick={() => setSelectedReportId(report.id)}
                      >
                        Trace
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={Math.max(pagination.totalPages, 1)}
        totalItems={pagination.total}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default AttendanceTracking;
