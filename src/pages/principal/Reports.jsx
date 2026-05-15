import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileText, Download, CheckCircle, XCircle, Clock, AlertCircle,
  RefreshCw, Search, Filter, FilePlus, ShieldCheck, ShieldX, ShieldAlert,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();
const YEARS = [currentYear, currentYear - 1, currentYear - 2];

const ApprovalPill = ({ status }) => {
  const map = {
    pending: { variant: 'warning', label: 'Pending', Icon: Clock },
    approved: { variant: 'success', label: 'Approved', Icon: ShieldCheck },
    rejected: { variant: 'danger', label: 'Rejected', Icon: ShieldX },
  };
  const s = map[status] || { variant: 'default', label: status || '—', Icon: ShieldAlert };
  const { variant, label, Icon } = s;
  return (
    <Badge variant={variant} size="sm" outline>
      <Icon className="h-3 w-3 mr-1 inline" />
      {label}
    </Badge>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const Reports = () => {
  const [reports, setReports] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending_my_action: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [generateLoading, setGenerateLoading] = useState(null); // user_id being generated
  const [downloadLoading, setDownloadLoading] = useState(null); // user_id being downloaded
  const [actionLoading, setActionLoading] = useState(false);

  const [approveModal, setApproveModal] = useState({ open: false, report: null });
  const [rejectModal, setRejectModal] = useState({ open: false, report: null });
  const [remarks, setRemarks] = useState('');

  // ── Fetch reports list ───────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/monthly-vt-reports', {
        params: { month: selectedMonth, year: selectedYear, page: currentPage, limit: 15 },
      });
      if (res.data?.status) {
        setReports(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalItems(res.data.pagination?.totalItems || 0);
      } else {
        toast.error(res.data?.message || 'Failed to load reports');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error loading reports');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear, currentPage]);

  // ── Fetch dashboard counts ────────────────────────────────────────────────
  const fetchCounts = useCallback(async () => {
    try {
      const res = await api.get('/reports/dashboard-pending-counts', {
        params: { month: selectedMonth, year: selectedYear },
      });
      if (res.data?.status) setCounts(res.data.data);
    } catch (_) { /* non-critical */ }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchReports();
    fetchCounts();
  }, [fetchReports, fetchCounts]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [selectedMonth, selectedYear]);

  // ── Client-side search ───────────────────────────────────────────────────
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(r =>
      r.vt_name?.toLowerCase().includes(q) ||
      r.school_name?.toLowerCase().includes(q) ||
      r.trade?.toLowerCase().includes(q)
    );
  }, [reports, searchQuery]);

  // ── Generate report ───────────────────────────────────────────────────────
  const handleGenerate = async (report) => {
    setGenerateLoading(report.user_id);
    try {
      const res = await api.post('/reports/generate-monthly-vt-report', {
        user_id: report.user_id,
        month: selectedMonth,
        year: selectedYear,
      });
      if (res.data?.status) {
        toast.success('Report generated successfully');
        fetchReports();
      } else {
        toast.error(res.data?.message || 'Generation failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to generate report');
    } finally {
      setGenerateLoading(null);
    }
  };

  // ── Download PDF ──────────────────────────────────────────────────────────
  const handleDownload = async (report) => {
    setDownloadLoading(report.user_id);
    try {
      const res = await api.get('/reports/download-vt-pdf', {
        params: { user_id: report.user_id, month: selectedMonth, year: selectedYear },
        responseType: 'blob',
      });
      console.log("#@@@@", res.data);

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `VT_Report_${report.vt_name || report.user_id}_${MONTHS[selectedMonth - 1]}_${selectedYear}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to download PDF');
    } finally {
      setDownloadLoading(null);
    }
  };

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    const report = approveModal.report;
    if (!report) return;
    setActionLoading(true);
    try {
      const res = await api.post('/reports/approve', {
        vtUserId: report.user_id,
        month: selectedMonth,
        year: selectedYear,
        status: 'approved',
        remarks: remarks.trim(),
      });
      if (res.data?.status) {
        toast.success('Report approved successfully');
        setApproveModal({ open: false, report: null });
        setRemarks('');
        fetchReports();
        fetchCounts();
      } else {
        toast.error(res.data?.message || 'Approval failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve report');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleReject = async () => {
    const report = rejectModal.report;
    if (!report || !remarks.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.post('/reports/approve', {
        vtUserId: report.user_id,
        month: selectedMonth,
        year: selectedYear,
        status: 'rejected',
        remarks: remarks.trim(),
      });
      if (res.data?.status) {
        toast.success('Report rejected');
        setRejectModal({ open: false, report: null });
        setRemarks('');
        fetchReports();
        fetchCounts();
      } else {
        toast.error(res.data?.message || 'Rejection failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject report');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'vt_name',
      header: 'VT / School',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.vt_name || '—'}</p>
          <p className="text-xs text-gray-500">{row.school_name || '—'}</p>
          <p className="text-xs text-gray-400">{row.block_name}</p>
        </div>
      ),
    },
    {
      key: 'trade',
      header: 'Trade / VTP',
      render: (value, row) => (
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{row.trade || '—'}</p>
          <p className="text-xs text-gray-500">{row.vtp_name || '—'}</p>
        </div>
      ),
    },
    {
      key: 'report_month',
      header: 'Period',
      render: (_, row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {MONTHS[(row.report_month || selectedMonth) - 1]} {row.report_year || selectedYear}
        </span>
      ),
    },
    {
      key: 'has_snapshot',
      header: 'Report',
      render: (hasSnapshot, row) => (
        <div className="flex flex-col gap-1">
          <Button
            variant={hasSnapshot ? 'outline' : 'primary'}
            size="sm"
            leftIcon={hasSnapshot ? <RefreshCw className="h-3 w-3" /> : <FilePlus className="h-3 w-3" />}
            loading={generateLoading === row.user_id}
            onClick={() => handleGenerate(row)}
            disabled={row.is_locked}
          >
            {hasSnapshot ? 'Re-generate' : 'Generate'}
          </Button>
          {hasSnapshot && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Download className="h-3 w-3" />}
              loading={downloadLoading === row.user_id}
              onClick={() => handleDownload(row)}
            >
              Download PDF
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'hm_approval_status',
      header: 'My Approval',
      render: (value) => <ApprovalPill status={value} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex flex-col gap-2">
          {row.hm_approval_status === 'pending' && (
            <>
              <Button
                variant="success"
                size="sm"
                leftIcon={<CheckCircle className="h-3 w-3" />}
                onClick={() => { setApproveModal({ open: true, report: row }); setRemarks(''); }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle className="h-3 w-3" />}
                onClick={() => { setRejectModal({ open: true, report: row }); setRemarks(''); }}
              >
                Reject
              </Button>
            </>
          )}
          {row.hm_approval_status === 'approved' && (
            <Badge variant="success" outline rounded>
              <ShieldCheck className="h-3 w-3 mr-1" /> Approved
            </Badge>
          )}
          {row.hm_approval_status === 'rejected' && (
            <Badge variant="danger" outline rounded>
              <XCircle className="h-3 w-3 mr-1" /> Rejected
            </Badge>
          )}
        </div>
      ),
    },
  ];

  if (loading && reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" text="Loading monthly reports..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly Attendance Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate and approve monthly VT attendance reports for your school
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={() => { fetchReports(); fetchCounts(); }}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Month / Year selector */}
      <Card variant="elevated">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 text-sm"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 text-sm"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="elevated" className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending My Action</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{counts.pending_my_action}</p>
            </div>
            <div className="p-3 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>
        <Card variant="elevated" className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved by Me</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{counts.approved}</p>
            </div>
            <div className="p-3 rounded-2xl bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
        <Card variant="elevated" className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{counts.rejected}</p>
            </div>
            <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Alert Banner */}
      {counts.pending_my_action > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-800 dark:text-yellow-200">
            <span className="font-semibold">{counts.pending_my_action}</span> report
            {counts.pending_my_action !== 1 ? 's are' : ' is'} awaiting your approval for {MONTHS[selectedMonth - 1]} {selectedYear}.
          </p>
        </motion.div>
      )}

      {/* Search Filter */}
      <Card variant="elevated">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by VT name, school or trade..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Reports Table */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            VT Monthly Reports — {MONTHS[selectedMonth - 1]} {selectedYear}
          </h2>
          <Badge variant="primary" outline>{totalItems} record{totalItems !== 1 ? 's' : ''}</Badge>
        </div>
        <Table
          data={filteredReports}
          columns={columns}
          emptyState={
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No reports found for this period</p>
              <p className="text-xs text-gray-400 mt-1">Reports are created when you click "Generate" for each VT</p>
            </div>
          }
        />
        {totalPages > 1 && (
          <div className="mt-4 flex justify-end">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={15}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>

      {/* ── Approve Modal ──────────────────────────────────────────────────────── */}
      <Modal
        isOpen={approveModal.open}
        onClose={() => { setApproveModal({ open: false, report: null }); setRemarks(''); }}
        title="Approve Monthly Report"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setApproveModal({ open: false, report: null }); setRemarks(''); }}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleApprove}
              loading={actionLoading}
              leftIcon={<CheckCircle className="h-4 w-4" />}
            >
              Confirm Approval
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Approve this monthly attendance report?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">This will move the report to DEO for next-level approval.</p>
            </div>
          </div>
          {approveModal.report && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2">
              <p className="font-semibold text-gray-900 dark:text-white">{approveModal.report.vt_name}</p>
              <p className="text-sm text-gray-500">{approveModal.report.school_name} · {approveModal.report.trade}</p>
              <p className="text-sm text-gray-500">
                Period: {MONTHS[(approveModal.report.report_month || selectedMonth) - 1]} {approveModal.report.report_year || selectedYear}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Remarks (optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add optional remarks..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* ── Reject Modal ───────────────────────────────────────────────────────── */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => { setRejectModal({ open: false, report: null }); setRemarks(''); }}
        title="Reject Monthly Report"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setRejectModal({ open: false, report: null }); setRemarks(''); }}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={actionLoading}
              disabled={!remarks.trim()}
              leftIcon={<XCircle className="h-4 w-4" />}
            >
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Reject this report?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Please provide a reason for rejection.</p>
            </div>
          </div>
          {rejectModal.report && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="font-semibold text-gray-900 dark:text-white">{rejectModal.report.vt_name}</p>
              <p className="text-sm text-gray-500">{rejectModal.report.school_name} · {rejectModal.report.trade}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reports;
