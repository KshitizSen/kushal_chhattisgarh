import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileText, Download, CheckCircle, XCircle, Clock, AlertCircle,
  RefreshCw, Search, Filter, ShieldCheck, ShieldX, ShieldAlert,
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
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const currentDate  = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear  = currentDate.getFullYear();
const YEARS        = [currentYear, currentYear - 1, currentYear - 2];

const ApprovalPill = ({ status, short }) => {
  const map = {
    pending:  { variant: 'warning', Icon: Clock       },
    approved: { variant: 'success', Icon: ShieldCheck },
    rejected: { variant: 'danger',  Icon: ShieldX     },
  };
  const s = map[status] || { variant: 'default', Icon: ShieldAlert };
  const { variant, Icon } = s;
  const label = short
    ? (status === 'approved' ? '✓' : status === 'rejected' ? '✕' : '…')
    : (status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Pending');
  return (
    <Badge variant={variant} size="sm" outline>
      <Icon className="h-3 w-3 mr-1 inline" />
      {label}
    </Badge>
  );
};

// Returns the first blocking authority text, or null if VTP can approve
const getBlockingAuthority = (report) => {
  if (report.hm_approval_status !== 'approved')  return 'Not approved by Principal/HM';
  if (report.deo_approval_status !== 'approved') return 'Not approved by DEO';
  return null;
};

// ── Component ─────────────────────────────────────────────────────────────────
const MonthlyAttendanceReports = () => {
  const [reports, setReports]             = useState([]);
  const [counts, setCounts]               = useState({ total: 0, pending_my_action: 0, approved: 0, rejected: 0 });
  const [loading, setLoading]             = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear]   = useState(currentYear);
  const [statusFilter, setStatusFilter]   = useState('all');
  const [searchQuery, setSearchQuery]     = useState('');
  const [currentPage, setCurrentPage]     = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [totalItems, setTotalItems]       = useState(0);

  const [downloadLoading, setDownloadLoading] = useState(null);
  const [actionLoading, setActionLoading]     = useState(false);
  const [approveModal, setApproveModal] = useState({ open: false, report: null });
  const [rejectModal, setRejectModal]   = useState({ open: false, report: null });
  const [remarks, setRemarks]           = useState('');

  // ── Fetch reports ─────────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = { month: selectedMonth, year: selectedYear, page: currentPage, limit: 15 };
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/reports/monthly-vt-reports', { params });
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
  }, [selectedMonth, selectedYear, statusFilter, currentPage]);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await api.get('/reports/dashboard-pending-counts', {
        params: { month: selectedMonth, year: selectedYear },
      });
      if (res.data?.status) setCounts(res.data.data);
    } catch (_) {}
  }, [selectedMonth, selectedYear]);

  useEffect(() => { fetchReports(); fetchCounts(); }, [fetchReports, fetchCounts]);
  useEffect(() => { setCurrentPage(1); }, [selectedMonth, selectedYear, statusFilter]);

  // ── Client-side search ────────────────────────────────────────────────────
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(r =>
      r.vt_name?.toLowerCase().includes(q) ||
      r.school_name?.toLowerCase().includes(q) ||
      r.trade?.toLowerCase().includes(q) ||
      r.district_name?.toLowerCase().includes(q)
    );
  }, [reports, searchQuery]);

  // ── Download PDF ──────────────────────────────────────────────────────────
  const handleDownload = async (report) => {
    setDownloadLoading(report.user_id);
    try {
      const res = await api.get('/reports/download-vt-pdf', {
        params: { user_id: report.user_id, month: selectedMonth, year: selectedYear },
        responseType: 'blob',
      });
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
        month: selectedMonth, year: selectedYear,
        status: 'approved', remarks: remarks.trim(),
      });
      if (res.data?.status) {
        toast.success('Report approved — workflow complete!');
        setApproveModal({ open: false, report: null }); setRemarks('');
        fetchReports(); fetchCounts();
      } else {
        toast.error(res.data?.message || 'Approval failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve');
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
        month: selectedMonth, year: selectedYear,
        status: 'rejected', remarks: remarks.trim(),
      });
      if (res.data?.status) {
        toast.success('Report rejected');
        setRejectModal({ open: false, report: null }); setRemarks('');
        fetchReports(); fetchCounts();
      } else {
        toast.error(res.data?.message || 'Rejection failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'vt_name',
      header: 'VT / School',
      render: (_, row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{row.vt_name || '—'}</p>
          <p className="text-xs text-gray-500">{row.school_name || '—'}</p>
          <p className="text-xs text-gray-400">{row.block_name}, {row.district_name}</p>
        </div>
      ),
    },
    {
      key: 'trade',
      header: 'Trade',
      render: (value) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">{value || '—'}</span>
      ),
    },
    {
      key: 'approval_trail',
      header: 'Approval Trail',
      render: (_, row) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 w-8">HM:</span>
            <ApprovalPill status={row.hm_approval_status} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 w-8">DEO:</span>
            <ApprovalPill status={row.deo_approval_status} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 w-8">VTP:</span>
            <ApprovalPill status={row.vtp_approval_status} />
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => {
        const blocker = getBlockingAuthority(row);
        return (
          <div className="flex flex-col gap-1.5">
            {/* View PDF */}
            {row.has_snapshot && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Download className="h-3 w-3" />}
                loading={downloadLoading === row.user_id}
                onClick={() => handleDownload(row)}
              >
                View PDF
              </Button>
            )}

            {/* VTP Approve / locked check */}
            {row.vtp_approval_status === 'pending' && (
              <>
                <div title={blocker || ''}>
                  <Button
                    variant="success"
                    size="sm"
                    leftIcon={<CheckCircle className="h-3 w-3" />}
                    disabled={!!blocker}
                    onClick={() => { setApproveModal({ open: true, report: row }); setRemarks(''); }}
                  >
                    Final Approve
                  </Button>
                </div>
                {blocker && (
                  <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    {blocker}
                  </p>
                )}
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

            {row.vtp_approval_status === 'approved' && row.is_locked && (
              <Badge variant="success" outline rounded size="sm">
                <ShieldCheck className="h-3 w-3 mr-1" /> Fully Approved
              </Badge>
            )}
            {row.vtp_approval_status === 'approved' && !row.is_locked && (
              <Badge variant="success" outline rounded size="sm">
                <ShieldCheck className="h-3 w-3 mr-1" /> VTP Approved
              </Badge>
            )}
            {row.vtp_approval_status === 'rejected' && (
              <Badge variant="danger" outline rounded size="sm">
                <XCircle className="h-3 w-3 mr-1" /> Rejected
              </Badge>
            )}
          </div>
        );
      },
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
            Final approval of VT monthly attendance reports across your VTP
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          variant="elevated"
          className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 cursor-pointer"
          onClick={() => setStatusFilter('pending_my_action')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Final Approval</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{counts.pending_my_action}</p>
            </div>
            <div className="p-3 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>
        <Card
          variant="elevated"
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 cursor-pointer"
          onClick={() => setStatusFilter('approved')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Fully Approved</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{counts.approved}</p>
            </div>
            <div className="p-3 rounded-2xl bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
        <Card
          variant="elevated"
          className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 cursor-pointer"
          onClick={() => setStatusFilter('rejected')}
        >
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
            {counts.pending_my_action !== 1 ? 's have' : ' has'} passed both HM and DEO approval and need{counts.pending_my_action !== 1 ? '' : 's'} your final VTP approval.
          </p>
        </motion.div>
      )}

      {/* Filters */}
      <Card variant="elevated">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary-500"
            >
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary-500"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="pending_my_action">Ready for My Approval</option>
              <option value="approved">Fully Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div className="mt-3">
          <Input
            placeholder="Search by VT name, school, trade or district..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Reports Table */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Reports — {MONTHS[selectedMonth - 1]} {selectedYear}
          </h2>
          <Badge variant="primary" outline>{totalItems} record{totalItems !== 1 ? 's' : ''}</Badge>
        </div>
        <Table
          data={filteredReports}
          columns={columns}
          emptyState={
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No reports found for selected filters</p>
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

      {/* ── Final Approve Modal ────────────────────────────────────────────────── */}
      <Modal
        isOpen={approveModal.open}
        onClose={() => { setApproveModal({ open: false, report: null }); setRemarks(''); }}
        title="Final VTP Approval"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setApproveModal({ open: false, report: null }); setRemarks(''); }}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleApprove} loading={actionLoading} leftIcon={<CheckCircle className="h-4 w-4" />}>
              Confirm Final Approval
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <ShieldCheck className="h-10 w-10 text-green-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Final VTP approval for this report?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This is the final step. The report will be fully approved and locked.
              </p>
            </div>
          </div>
          {approveModal.report && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2">
              <p className="font-semibold text-gray-900 dark:text-white">{approveModal.report.vt_name}</p>
              <p className="text-sm text-gray-500">{approveModal.report.school_name} · {approveModal.report.trade}</p>
              <div className="flex gap-2 flex-wrap mt-1">
                <ApprovalPill status={approveModal.report.hm_approval_status} />
                <ApprovalPill status={approveModal.report.deo_approval_status} />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Remarks (optional)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add optional remarks..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* ── Reject Modal ───────────────────────────────────────────────────────── */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() => { setRejectModal({ open: false, report: null }); setRemarks(''); }}
        title="Reject Monthly Report (VTP)"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setRejectModal({ open: false, report: null }); setRemarks(''); }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReject} loading={actionLoading} disabled={!remarks.trim()} leftIcon={<XCircle className="h-4 w-4" />}>
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Reject this report at VTP level?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Please provide a reason for rejection.</p>
            </div>
          </div>
          {rejectModal.report && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="font-semibold text-gray-900 dark:text-white">{rejectModal.report.vt_name}</p>
              <p className="text-sm text-gray-500">{rejectModal.report.school_name}</p>
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
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MonthlyAttendanceReports;
