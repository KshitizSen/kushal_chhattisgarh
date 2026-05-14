/* eslint-disable react-hooks/set-state-in-effect */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Download,
  FileText,
  Filter,
  MapPin,
  RefreshCw,
  School,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';

const INITIAL_SCHOOLS = [
  {
    id: 1,
    name: 'GOVT HSS KAPADAH',
    udise: '22081301906',
    block: 'PANDARIYA',
    cluster: 'KAPADAH',
    reportStatus: 'pending',
    vts: [
      {
        id: 1,
        name: 'BHAGVATEE SAHU',
        trade: 'Apparel & Home Furnishing',
        phone: '8103741144',
        reportStatus: 'approved',
        reports: [
          { id: 101, month: 'Mar 2026', status: 'approved', submittedAt: '2026-03-28' },
          { id: 102, month: 'Apr 2026', status: 'pending', submittedAt: '2026-04-25' },
        ],
      },
      {
        id: 2,
        name: 'RAMESH KUMAR',
        trade: 'IT/ITeS',
        phone: '9876543210',
        reportStatus: 'pending',
        reports: [
          { id: 201, month: 'Mar 2026', status: 'approved', submittedAt: '2026-03-29' },
          { id: 202, month: 'Apr 2026', status: 'pending', submittedAt: '2026-04-26' },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'GOVT HS PANDARIYA',
    udise: '22081302001',
    block: 'PANDARIYA',
    cluster: 'PANDARIYA',
    reportStatus: 'approved',
    vts: [
      {
        id: 3,
        name: 'SUNITA DEVI',
        trade: 'Beauty & Wellness',
        phone: '7898765432',
        reportStatus: 'approved',
        reports: [
          { id: 301, month: 'Mar 2026', status: 'approved', submittedAt: '2026-03-27' },
          { id: 302, month: 'Apr 2026', status: 'approved', submittedAt: '2026-04-24' },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'GOVT HS LORMI',
    udise: '22081401503',
    block: 'LORMI',
    cluster: 'LORMI',
    reportStatus: 'rejected',
    vts: [
      {
        id: 4,
        name: 'AJAY SINGH',
        trade: 'Electronics',
        phone: '6234567890',
        reportStatus: 'rejected',
        reports: [
          { id: 401, month: 'Mar 2026', status: 'approved', submittedAt: '2026-03-30' },
          { id: 402, month: 'Apr 2026', status: 'rejected', submittedAt: '2026-04-22' },
        ],
      },
      {
        id: 5,
        name: 'PRIYA SHARMA',
        trade: 'Retail',
        phone: '9012345678',
        reportStatus: 'pending',
        reports: [
          { id: 501, month: 'Apr 2026', status: 'pending', submittedAt: '2026-04-27' },
        ],
      },
    ],
  },
  {
    id: 4,
    name: 'GOVT HSS SAHASPUR',
    udise: '22081501201',
    block: 'SAHASPUR',
    cluster: 'SAHASPUR',
    reportStatus: 'pending',
    vts: [
      {
        id: 6,
        name: 'DEEPAK VERMA',
        trade: 'Agriculture',
        phone: '8765432109',
        reportStatus: 'pending',
        reports: [
          { id: 601, month: 'Apr 2026', status: 'pending', submittedAt: '2026-04-28' },
        ],
      },
    ],
  },
];

const STATUS = {
  pending: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
  approved: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  rejected: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  not_generated: { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-400' },
};

const ATTENDANCE_STATUS = {
  A: { label: 'Absent', className: 'bg-orange-50 text-orange-700 ring-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:ring-orange-900/40' },
  P: { label: 'Present', className: 'bg-green-50 text-green-700 ring-green-100 dark:bg-green-900/20 dark:text-green-300 dark:ring-green-900/40' },
  GH: { label: 'Government Holiday', className: 'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:ring-blue-900/40' },
  H: { label: 'Holiday', className: 'bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700' },
};

const DEFAULT_PAGINATION = {
  totalItems: 0,
  totalPages: 1,
  currentPage: 1,
  limit: 10,
};
const PAGE_SIZE_OPTIONS = [10, 15, 30, 50];

const MONTH_OPTIONS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const getCurrentMonth = () => String(new Date().getMonth() + 1);
const getCurrentYear = () => String(new Date().getFullYear());

const buildYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 7 }, (_, index) => String(currentYear - 5 + index));
};

const getMonthLabel = (monthValue) => MONTH_OPTIONS.find((month) => month.value === String(monthValue))?.label || monthValue;

const getMonthlySummaryParam = (year, month) => `${year}-${String(month).padStart(2, '0')}`;

const formatReportDate = (year, month, day) => {
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return `${day}/${month}/${year}`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const normalizeAttendanceStatus = (value) => {
  const status = typeof value === 'string' ? value.toUpperCase() : value?.status?.toUpperCase();
  if (status === 'PRESENT') return 'P';
  if (status === 'ABSENT') return 'A';
  if (status === 'HOLIDAY') return 'H';
  if (status === 'GOVERNMENT_HOLIDAY') return 'GH';
  return status || 'A';
};

const formatAttendanceTime = (value) => {
  if (!value) return '-';
  if (typeof value === 'string' && /^\d{1,2}:\d{2}(\s?[AP]M)?$/i.test(value.trim())) {
    return value.trim();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const buildAttendanceRows = (attendance = {}, year, month) => (
  Object.entries(attendance)
    .sort(([dayA], [dayB]) => Number(dayA) - Number(dayB))
    .map(([day, value], index) => {
      const record = typeof value === 'string' ? { status: value } : value || {};
      return {
        serial: index + 1,
        day,
        date: formatReportDate(year, month, day),
        status: normalizeAttendanceStatus(record),
        checkIn: formatAttendanceTime(record.check_in || record.checkIn || record.check_in_time),
        checkOut: formatAttendanceTime(record.check_out || record.checkOut || record.check_out_time),
      };
    })
);

const StatusPill = ({ status }) => {
  const config = STATUS[status] || STATUS.pending;
  const label = status ? status.replace(/_/g, ' ') : 'pending';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span className="capitalize">{label}</span>
    </span>
  );
};

const AttendanceStatusPill = ({ status }) => {
  const config = ATTENDANCE_STATUS[status] || ATTENDANCE_STATUS.A;

  return (
    <span className={`inline-flex min-w-10 justify-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${config.className}`}>
      {status}
    </span>
  );
};

const ActionIcon = ({ icon: Icon, label, onClick, variant = 'default', disabled = false, loading = false }) => {
  const color = {
    default: 'text-gray-500 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800',
    approve: 'text-green-600 bg-green-50/70 hover:bg-green-100 hover:text-green-700 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/35',
    reject: 'text-red-600 bg-red-50/70 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/35',
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`rounded-lg p-2 transition-all duration-150 ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'} ${color}`}
      aria-label={label}
      disabled={disabled || loading}
    >
      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
    </button>
  );
};

const Attendance = () => {
  const [schools, setSchools] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);
  const [selectedYear, setSelectedYear] = useState(getCurrentYear);
  const [dashboardCounts, setDashboardCounts] = useState(null);
  const [countsLoading, setCountsLoading] = useState(false);
  const [countsError, setCountsError] = useState('');
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDistrictName, setSelectedDistrictName] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [loadingClusters, setLoadingClusters] = useState(false);
  const [expandedSchool, setExpandedSchool] = useState(null);
  const [schoolVts, setSchoolVts] = useState({});
  const [schoolVtsLoading, setSchoolVtsLoading] = useState({});
  const [schoolVtsError, setSchoolVtsError] = useState({});
  const [selectedSchoolCodes, setSelectedSchoolCodes] = useState([]);
  const [downloadLoadingId, setDownloadLoadingId] = useState(null);
  const [actionModal, setActionModal] = useState({ open: false, type: null, target: null, level: null });
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [attendanceReportModal, setAttendanceReportModal] = useState({
    open: false,
    vt: null,
    school: null,
    report: null,
    loading: false,
    error: '',
  });
  const yearOptions = useMemo(() => buildYearOptions(), []);

  const fetchDashboardCounts = useCallback(async () => {
    setCountsLoading(true);
    setCountsError('');
    try {
      const response = await api.get('/deo/dashboard-counts', {
        params: {
          month: Number(selectedMonth),
          year: Number(selectedYear),
        },
      });
      setDashboardCounts(response.data?.data || null);
      if (response.data?.district?.district_cd) {
        setSelectedDistrict(String(response.data.district.district_cd));
        setSelectedDistrictName(response.data.district.district_name || '');
      }
    } catch (error) {
      console.error('Failed to fetch DEO dashboard counts:', error);
      setCountsError('Dashboard counts could not be loaded.');
    } finally {
      setCountsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchDashboardCounts();
  }, [fetchDashboardCounts]);

  const fetchSchoolReports = useCallback(async () => {
    setReportsLoading(true);
    setReportsError('');
    try {
      const params = {
        month: Number(selectedMonth),
        year: Number(selectedYear),
        page: currentPage,
        limit: pageSize,
      };

      if (filter) {
        params.status = filter;
      }
      if (selectedDistrict) {
        params.district_cd = selectedDistrict;
      }
      if (selectedBlock) {
        params.block_cd = selectedBlock;
      }
      if (selectedCluster) {
        params.cluster_cd = selectedCluster;
      }

      const response = await api.get('/deo/school-reports', { params });
      const rows = response.data?.data || [];
      if (response.data?.district?.district_cd) {
        setSelectedDistrict(String(response.data.district.district_cd));
        setSelectedDistrictName(response.data.district.district_name || '');
      }

      setSchools(
        rows.map((row) => ({
          id: row.udise_code,
          name: row.school_name,
          udise: row.udise_code,
          block: row.block_name,
          district: row.district_name,
          reportStatus: row.deo_approval_status || 'pending',
          reportId: row.report_id,
          reportMonth: row.report_month,
          reportYear: row.report_year,
          hmApprovalStatus: row.hm_approval_status,
          vtpApprovalStatus: row.vtp_approval_status,
          hmRemarks: row.hm_remarks,
          vtpRemarks: row.vtp_remarks,
          deoRemarks: row.deo_remarks,
        }))
      );
      setPagination(response.data?.pagination || { ...DEFAULT_PAGINATION, limit: pageSize });
      setExpandedSchool(null);
    } catch (error) {
      console.error('Failed to fetch DEO school reports:', error);
      setSchools([]);
      setPagination({ ...DEFAULT_PAGINATION, limit: pageSize });
      setReportsError('School reports could not be loaded.');
    } finally {
      setReportsLoading(false);
    }
  }, [currentPage, filter, pageSize, selectedMonth, selectedYear, selectedDistrict, selectedBlock, selectedCluster]);

  useEffect(() => {
    fetchSchoolReports();
  }, [fetchSchoolReports]);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, selectedBlock, selectedCluster]);

  useEffect(() => {
    setSchoolVts({});
    setSchoolVtsLoading({});
    setSchoolVtsError({});
  }, [selectedMonth, selectedYear]);

  const counts = useMemo(() => {
    const reports = dashboardCounts?.reports || {};
    return {
      total: dashboardCounts?.total_schools ?? 0,
      vts: dashboardCounts?.total_vts ?? 0,
      pending: reports.pending ?? 0,
      approved: reports.approved ?? 0,
      rejected: reports.rejected ?? 0,
    };
  }, [dashboardCounts]);

  const filteredSchools = useMemo(() => {
    const query = search.trim().toLowerCase();
    return schools.filter((school) => {
      const matchesSearch =
        !query ||
        school.name.toLowerCase().includes(query) ||
        String(school.udise).includes(query) ||
        school.block?.toLowerCase().includes(query) ||
        school.district?.toLowerCase().includes(query);
      return matchesSearch;
    });
  }, [schools, search]);

  useEffect(() => {
    const visibleUdiseCodes = new Set(filteredSchools.map((school) => String(school.udise)));
    setSelectedSchoolCodes((prev) => prev.filter((udise) => visibleUdiseCodes.has(udise)));
  }, [filteredSchools]);

  const allVisibleSelected = filteredSchools.length > 0
    && filteredSchools.every((school) => selectedSchoolCodes.includes(String(school.udise)));

  const refreshPageData = useCallback(() => {
    fetchDashboardCounts();
    fetchSchoolReports();
  }, [fetchDashboardCounts, fetchSchoolReports]);

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
    setCurrentPage(1);
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setFilter(value);
    setCurrentPage(1);
  };

  const fetchSchoolVts = useCallback(async (school) => {
    const udiseCode = String(school.udise);

    setSchoolVtsLoading((prev) => ({ ...prev, [udiseCode]: true }));
    setSchoolVtsError((prev) => ({ ...prev, [udiseCode]: '' }));

    try {
      const response = await api.get('/deo/schools-vts', {
        params: {
          udise_code: udiseCode,
          month: Number(selectedMonth),
          year: Number(selectedYear),
        },
      });
      const selectedSchool = response.data?.data?.find((item) => String(item.udise_code) === udiseCode) || response.data?.data?.[0];
      const vts = selectedSchool?.vts || [];

      setSchoolVts((prev) => ({
        ...prev,
        [udiseCode]: vts.map((vt) => ({
          id: vt.vt_staff_id || vt.user_id || `${udiseCode}-${vt.vt_mob || vt.vt_name}`,
          userId: vt.user_id,
          vtStaffId: vt.vt_staff_id,
          name: vt.vt_name || 'VT name not available',
          trade: vt.trade || 'Trade not available',
          phone: vt.vt_mob || 'Mobile not available',
          email: vt.vt_email,
          vtpName: vt.vtp_name,
          hmApprovalStatus: vt.hm_approval_status || school.hmApprovalStatus || 'pending',
          vtpApprovalStatus: vt.vtp_approval_status || school.vtpApprovalStatus || 'pending',
          deoApprovalStatus: vt.deo_approval_status || school.reportStatus || 'pending',
          reportStatus: vt.deo_approval_status || school.reportStatus || 'pending',
        })),
      }));
    } catch (error) {
      console.error('Failed to fetch school VTs:', error);
      setSchoolVts((prev) => ({ ...prev, [udiseCode]: [] }));
      setSchoolVtsError((prev) => ({ ...prev, [udiseCode]: 'Vocational teachers could not be loaded.' }));
    } finally {
      setSchoolVtsLoading((prev) => ({ ...prev, [udiseCode]: false }));
    }
  }, [selectedMonth, selectedYear]);

  const handleToggleSchool = (school) => {
    const udiseCode = String(school.udise);

    if (expandedSchool === school.id) {
      setExpandedSchool(null);
      return;
    }

    setExpandedSchool(school.id);

    if (!schoolVts[udiseCode]) {
      fetchSchoolVts(school);
    }
  };

  const handleAction = async (status) => {
    const { target, level } = actionModal;
    if (!target) return;

    if (level === 'bulk') {
      setBulkActionLoading(true);
      setActionError('');
      try {
        const payload = {
          udise_codes: (target.schools || []).map((school) => Number(school.udise)),
          month: Number(selectedMonth),
          year: Number(selectedYear),
          status,
          remarks: remarks.trim(),
        };

        const response = await api.post('/reports/approve-bulk', payload);
        if (!response.data?.status) {
          throw new Error(response.data?.message || 'Bulk action failed.');
        }

        toast.success(response.data?.message || 'Selected schools updated successfully.');
        setActionModal({ open: false, type: null, target: null, level: null });
        setSelectedSchoolCodes([]);
        setRemarks('');
        setExpandedSchool(null);
        setSchoolVts({});
        refreshPageData();
      } catch (error) {
        console.error('Failed to run bulk approval action:', error);
        setActionError(error?.response?.data?.message || error.message || 'Bulk action failed.');
      } finally {
        setBulkActionLoading(false);
      }
      return;
    }

    const vtIdentifier = actionModal.level === 'vt'
      ? target.vt?.userId || target.vt?.vtStaffId
      : null;

    setActionLoading(true);
    setActionError('');
    try {
      const payload = {
        udise_code: Number(target.udise),
        month: Number(selectedMonth),
        year: Number(selectedYear),
        status,
        remarks: remarks.trim(),
      };

      if (vtIdentifier) {
        payload.vtUserId = Number(vtIdentifier);
      }

      await api.post('/reports/approve', payload);

      setActionModal({ open: false, type: null, target: null, level: null });
      setRemarks('');
      setExpandedSchool(null);
      setSchoolVts({});
      refreshPageData();
    } catch (error) {
      console.error('Failed to update report approval:', error);
      setActionError('Report status could not be updated.');
    } finally {
      setActionLoading(false);
    }
  };

  const openAction = (type, target, level) => {
    setActionModal({ open: true, type, target, level });
    setRemarks('');
    setActionError('');
  };

  const handleToggleSchoolSelection = (udiseCode) => {
    const code = String(udiseCode);
    setSelectedSchoolCodes((prev) => (
      prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]
    ));
  };

  const handleToggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedSchoolCodes([]);
      return;
    }
    setSelectedSchoolCodes(filteredSchools.map((school) => String(school.udise)));
  };

  const handleOpenBulkAction = (type) => {
    const selectedSchools = filteredSchools.filter((school) => selectedSchoolCodes.includes(String(school.udise)));
    if (!selectedSchools.length) {
      toast.error('Please select at least one school.');
      return;
    }
    setActionModal({ open: true, type, target: { schools: selectedSchools }, level: 'bulk' });
    setRemarks('');
    setActionError('');
  };

  const parseDownloadFileName = (contentDisposition, fallbackName) => {
    if (!contentDisposition) return fallbackName;
    const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utfMatch?.[1]) {
      try {
        return decodeURIComponent(utfMatch[1]);
      } catch (_) {
        return utfMatch[1];
      }
    }
    const normalMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    return normalMatch?.[1] || fallbackName;
  };

  const handleDownloadPdf = async (school, vt) => {
    const vtIdentifier = vt.userId || vt.vtStaffId;
    if (!vtIdentifier) {
      toast.error('Teacher account is not linked.');
      return;
    }

    setDownloadLoadingId(String(vtIdentifier));
    try {
      const response = await api.get('/reports/download-vt-pdf', {
        params: {
          user_id: vtIdentifier,
          month: Number(selectedMonth),
          year: Number(selectedYear),
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const fallbackName = `VT_Attendance_${(vt.name || 'VT').replace(/\s+/g, '_')}_${selectedMonth}_${selectedYear}.pdf`;
      const fileName = parseDownloadFileName(response.headers?.['content-disposition'], fallbackName);

      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error(error?.response?.data?.message || 'PDF download failed.');
    } finally {
      setDownloadLoadingId(null);
    }
  };

  const openAttendanceReport = async (school, vt) => {
    const vtIdentifier = vt.userId || vt.vtStaffId;

    setAttendanceReportModal({
      open: true,
      vt,
      school,
      report: null,
      loading: true,
      error: '',
    });

    if (!vtIdentifier) {
      setAttendanceReportModal((prev) => ({
        ...prev,
        loading: false,
        error: 'Attendance report is unavailable because this vocational teacher is not linked with a user account.',
      }));
      return;
    }

    try {
      const response = await api.get('/reports/monthly-summary', {
        params: {
          udise_code: school.udise,
          month: getMonthlySummaryParam(selectedYear, selectedMonth),
          vtUserId: vtIdentifier,
        },
      });

      const report = response.data?.data?.[0] || null;
      setAttendanceReportModal((prev) => ({
        ...prev,
        report,
        loading: false,
        error: report ? '' : 'No attendance report found for this vocational teacher.',
      }));
    } catch (error) {
      console.error('Failed to fetch monthly attendance report:', error);
      setAttendanceReportModal((prev) => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Attendance report could not be loaded.',
      }));
    }
  };

  const closeAttendanceReport = () => {
    setAttendanceReportModal({
      open: false,
      vt: null,
      school: null,
      report: null,
      loading: false,
      error: '',
    });
  };

  const attendanceRows = useMemo(
    () => buildAttendanceRows(attendanceReportModal.report?.attendance, selectedYear, selectedMonth),
    [attendanceReportModal.report, selectedMonth, selectedYear]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">Attendance</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review school-wise VT reports and attendance approvals
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(event) => handleMonthChange(event.target.value)}
            className="rounded-[1.25rem] border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            aria-label="Select month"
          >
            {MONTH_OPTIONS.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(event) => handleYearChange(event.target.value)}
            className="rounded-[1.25rem] border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            aria-label="Select year"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="rounded-[1.25rem] border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            aria-label="Select page size"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RefreshCw className={`h-4 w-4 ${countsLoading || reportsLoading ? 'animate-spin' : ''}`} />}
            onClick={refreshPageData}
            disabled={countsLoading || reportsLoading}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {[
          { label: 'Total Schools', value: counts.total, Icon: School, bg: 'bg-blue-500', status: '' },
          { label: 'Total VTs', value: counts.vts, Icon: Users, bg: 'bg-indigo-500', status: '' },
          { label: 'Pending', value: counts.pending, Icon: AlertCircle, bg: 'bg-yellow-500', status: 'pending' },
          { label: 'Approved', value: counts.approved, Icon: CheckCircle, bg: 'bg-green-500', status: 'approved' },
          { label: 'Rejected', value: counts.rejected, Icon: XCircle, bg: 'bg-red-500', status: 'rejected' },
        ].map(({ label, value, Icon, bg, status }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleStatusChange(filter === status ? '' : status)}
            className={`flex items-center gap-3 rounded-[1.5rem] border bg-white p-4 text-left transition-all dark:bg-gray-900 ${
              filter === status && status
                ? 'border-primary-400 ring-2 ring-primary-100 dark:ring-primary-900/40'
                : 'border-gray-200 hover:shadow-sm dark:border-gray-800'
            }`}
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white ${bg}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-2xl font-bold leading-none text-gray-900 dark:text-white">{value}</span>
              <span className="mt-1 block text-xs text-gray-500">{label}</span>
            </span>
          </button>
        ))}
      </div>

      {counts.pending > 0 && (
        <div className="flex items-center gap-3 rounded-[1.5rem] border border-yellow-200 bg-yellow-50 px-5 py-4 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            <span className="font-semibold">{counts.pending}</span> school reports awaiting your review.
          </p>
        </div>
      )}

      {countsError && (
        <div className="flex items-center gap-3 rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{countsError}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by school, UDISE, block or district..."
            className="w-full rounded-[1.25rem] border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="hidden h-5 w-5 text-gray-400 sm:block" />
          <select
            value={filter}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="rounded-[1.25rem] border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">District</label>
          <select
            value={selectedDistrict}
            disabled
            className="w-full cursor-not-allowed rounded-[1.25rem] border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="">{selectedDistrictName || 'Loading district...'}</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Block</label>
          <select
            value={selectedBlock}
            onChange={(event) => setSelectedBlock(event.target.value)}
            disabled={!selectedDistrict || loadingBlocks}
            className="w-full rounded-[1.25rem] border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="">All Blocks</option>
            {blocks.map((block) => (
              <option key={block.block_cd} value={block.block_cd}>
                {block.block_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Cluster</label>
          <select
            value={selectedCluster}
            onChange={(event) => setSelectedCluster(event.target.value)}
            disabled={!selectedBlock || loadingClusters}
            className="w-full rounded-[1.25rem] border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="">All Clusters</option>
            {clusters.map((cluster) => (
              <option key={cluster.cluster_cd} value={cluster.cluster_cd}>
                {cluster.cluster_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {selectedSchoolCodes.length} school{selectedSchoolCodes.length !== 1 ? 's' : ''} selected
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="success"
            size="sm"
            leftIcon={<CheckCircle className="h-4 w-4" />}
            disabled={!selectedSchoolCodes.length || bulkActionLoading}
            onClick={() => handleOpenBulkAction('approve')}
          >
            Approve All
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<XCircle className="h-4 w-4" />}
            disabled={!selectedSchoolCodes.length || bulkActionLoading}
            onClick={() => handleOpenBulkAction('reject')}
          >
            Reject All
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {reportsLoading ? (
          <div className="py-12 text-center">
            <RefreshCw className="mx-auto mb-3 h-8 w-8 animate-spin text-primary-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading school reports...</p>
          </div>
        ) : reportsError ? (
          <div className="py-12 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-300" />
            <p className="text-sm text-red-500 dark:text-red-300">{reportsError}</p>
          </div>
        ) : filteredSchools.length === 0 ? (
          <div className="py-12 text-center">
            <School className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                <tr>
                  <th className="w-14 px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      checked={allVisibleSelected}
                      onChange={handleToggleSelectAllVisible}
                      aria-label="Select all schools"
                    />
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Se no</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">School</th>
                  <th className="w-[170px] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">UDISE</th>
                  <th className="w-[150px] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Block</th>
                  <th className="w-[190px] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.map((school, index) => (
                  <React.Fragment key={school.id}>
                    <tr
                      className={`border-b border-gray-100 transition hover:bg-blue-50/60 dark:border-gray-800 dark:hover:bg-blue-900/10 ${
                        index % 2 === 1 ? 'bg-gray-50/60 dark:bg-gray-800/30' : ''
                      }`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={selectedSchoolCodes.includes(String(school.udise))}
                          onChange={() => handleToggleSchoolSelection(school.udise)}
                          aria-label={`Select ${school.name}`}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{(currentPage - 1) * pagination.limit + index + 1}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                            <School className="h-5 w-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{school.name}</span>
                            <span className="text-xs text-gray-500">{school.district || 'District not available'}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">{school.udise}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3.5 w-3.5" />
                          {school.block}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleSchool(school)}
                          className="flex w-full items-center justify-between gap-3 rounded-lg py-1 text-left"
                          aria-expanded={expandedSchool === school.id}
                          aria-label={`Toggle vocational teachers for ${school.name}`}
                        >
                          <StatusPill status={school.reportStatus} />
                          <ChevronDown className={`h-4 w-4 text-gray-400 transition ${expandedSchool === school.id ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                    </tr>

                    {expandedSchool === school.id && (
                      <tr>
                        <td className="border-b border-gray-100 bg-gray-50/70 px-4 pb-5 pt-4 dark:border-gray-800 dark:bg-gray-950/30" />
                        <td className="border-b border-gray-100 bg-gray-50/70 px-5 pb-5 pt-4 dark:border-gray-800 dark:bg-gray-950/30" />
                        <td colSpan={4} className="border-b border-gray-100 bg-gray-50/70 px-5 pb-5 pt-4 dark:border-gray-800 dark:bg-gray-950/30">
                          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Vocational Teachers</h2>
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {school.name} | UDISE {school.udise}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:ml-auto sm:justify-end">
                              <Button
                                variant="success"
                                size="sm"
                                leftIcon={<CheckCircle className="h-4 w-4" />}
                                onClick={() => openAction('approve', school, 'school')}
                              >
                                Approve All
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                leftIcon={<XCircle className="h-4 w-4" />}
                                onClick={() => openAction('reject', school, 'school')}
                              >
                                Reject All
                              </Button>
                            </div>
                          </div>

                          <div className="overflow-hidden rounded-[1.25rem] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                            {schoolVtsLoading[String(school.udise)] ? (
                              <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Loading vocational teachers...
                              </div>
                            ) : schoolVtsError[String(school.udise)] ? (
                              <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-red-500 dark:text-red-300">
                                <AlertCircle className="h-4 w-4" />
                                {schoolVtsError[String(school.udise)]}
                              </div>
                            ) : (schoolVts[String(school.udise)] || []).length === 0 ? (
                              <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                No vocational teachers found
                              </div>
                            ) : (
                              schoolVts[String(school.udise)].map((vt) => (
                                <div
                                  key={vt.id}
                                  className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 dark:border-gray-800 sm:flex-row sm:items-center"
                                >
                                  <div className="flex flex-1 items-center gap-3">
                                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                                      {vt.name.charAt(0)}
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{vt.name}</span>
                                      <span className="block truncate text-xs text-gray-500">{vt.trade} | {vt.phone}</span>
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 sm:ml-auto">
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">HM Status</span>
                                      <StatusPill status={vt.hmApprovalStatus} />
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">DEO Status</span>
                                      <StatusPill status={vt.deoApprovalStatus} />
                                    </div>
                                    <div className="flex items-center gap-1 sm:justify-end">
                                      <ActionIcon icon={FileText} label="Reports" onClick={() => openAttendanceReport(school, vt)} />
                                      <ActionIcon
                                        icon={Download}
                                        label="Download Attendance PDF"
                                        loading={downloadLoadingId === String(vt.userId || vt.vtStaffId)}
                                        onClick={() => handleDownloadPdf(school, vt)}
                                      />
                                      <ActionIcon
                                        icon={CheckCircle}
                                        label={vt.hmApprovalStatus === 'approved' ? 'Approve' : 'HM approval pending'}
                                        variant="approve"
                                        disabled={vt.hmApprovalStatus !== 'approved'}
                                        onClick={() => openAction('approve', { ...school, vt }, 'vt')}
                                      />
                                      <ActionIcon
                                        icon={XCircle}
                                        label={vt.hmApprovalStatus === 'approved' ? 'Reject' : 'HM approval pending'}
                                        variant="reject"
                                        disabled={vt.hmApprovalStatus !== 'approved'}
                                        onClick={() => openAction('reject', { ...school, vt }, 'vt')}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalItems > 0 && (
        <div className="rounded-[1.5rem] border border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={Math.max(pagination.totalPages, 1)}
            pageSize={pagination.limit}
            totalItems={pagination.totalItems}
            onPageChange={setCurrentPage}
            size="sm"
          />
        </div>
      )}

      <Modal
        isOpen={actionModal.open}
        onClose={() => {
          setActionModal({ open: false, type: null, target: null, level: null });
          setRemarks('');
          setActionError('');
        }}
        title={actionModal.type === 'approve' ? 'Approve Report' : 'Reject Report'}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setActionModal({ open: false, type: null, target: null, level: null });
                setRemarks('');
                setActionError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant={actionModal.type === 'approve' ? 'success' : 'danger'}
              disabled={actionLoading || bulkActionLoading}
              leftIcon={actionModal.type === 'approve' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              onClick={() => handleAction(actionModal.type === 'approve' ? 'approved' : 'rejected')}
            >
              {(actionLoading || bulkActionLoading) ? 'Saving...' : actionModal.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className={`flex items-center gap-3 rounded-[1.25rem] p-4 ${actionModal.type === 'approve' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            {actionModal.type === 'approve' ? (
              <CheckCircle className="h-8 w-8 flex-shrink-0 text-green-500" />
            ) : (
              <AlertCircle className="h-8 w-8 flex-shrink-0 text-red-500" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {actionModal.type === 'approve' ? 'Approve' : 'Reject'} this report?
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {actionModal.level === 'bulk' ? (
                  <>
                    Selected Schools: <strong>{actionModal.target?.schools?.length || 0}</strong>
                  </>
                ) : (
                  <>
                    School: <strong>{actionModal.target?.name}</strong>
                    {actionModal.target?.vt?.name && (
                      <>
                        <br />
                        VT: <strong>{actionModal.target.vt.name}</strong>
                      </>
                    )}
                  </>
                )}
              </p>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Remarks
            </label>
            <textarea
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Add remarks..."
              rows={3}
              className="w-full resize-none rounded-[1.25rem] border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          {actionError && (
            <div className="rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              {actionError}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={attendanceReportModal.open}
        onClose={closeAttendanceReport}
        title="Attendance Report"
        size="xl"
        footer={
          <Button variant="ghost" onClick={closeAttendanceReport}>
            Close
          </Button>
        }
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-3 rounded-[1.25rem] border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/50 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {attendanceReportModal.report?.name || attendanceReportModal.vt?.name || 'Vocational Teacher'}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {attendanceReportModal.school?.name} | UDISE {attendanceReportModal.school?.udise}
              </p>
              <p className="mt-1 text-xs font-medium text-gray-500">
                {getMonthLabel(selectedMonth)} {selectedYear}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ATTENDANCE_STATUS).map(([status, config]) => (
                <span key={status} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                  <AttendanceStatusPill status={status} />
                  {config.label}
                </span>
              ))}
            </div>
          </div>

          {attendanceReportModal.loading ? (
            <div className="flex items-center justify-center gap-2 rounded-[1.25rem] border border-gray-200 py-12 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading attendance report...
            </div>
          ) : attendanceReportModal.error ? (
            <div className="flex items-center gap-3 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {attendanceReportModal.error}
            </div>
          ) : (
            <div className="overflow-hidden rounded-[1.25rem] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px]">
                  <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                    <tr>
                      <th className="w-20 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Sr. No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Date</th>
                      <th className="w-28 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Status</th>
                      <th className="w-36 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Check-in</th>
                      <th className="w-36 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Checkout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRows.map((row) => (
                      <tr key={row.day} className="border-b border-gray-100 last:border-b-0 dark:border-gray-800">
                        <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">{row.serial}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{row.date}</td>
                        <td className="px-4 py-3"><AttendanceStatusPill status={row.status} /></td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{row.checkIn}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{row.checkOut}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Attendance;
