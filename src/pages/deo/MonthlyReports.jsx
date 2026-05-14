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

const ApprovalPill = ({ status, label }) => {
  const map = {
    pending:  { variant: 'warning', Icon: Clock       },
    approved: { variant: 'success', Icon: ShieldCheck },
    rejected: { variant: 'danger',  Icon: ShieldX     },
  };
  const s = map[status] || { variant: 'default', Icon: ShieldAlert };
  const { variant, Icon } = s;
  return (
    <Badge variant={variant} size="sm" outline>
      <Icon className="h-3 w-3 mr-1 inline" />
      {label || status || '—'}
    </Badge>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const MonthlyReports = () => {
  const [reports, setReports]             = useState([]);
  const [counts, setCounts]               = useState({ total: 0, pending_my_action: 0, approved: 0, rejected: 0 });
  const [loading, setLoading]             = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear]   = useState(currentYear);
  const [schoolFilter, setSchoolFilter]   = useState('');
  const [blockFilter, setBlockFilter]     = useState('');
  const [statusFilter, setStatusFilter]   = useState('all');
  const [searchQuery, setSearchQuery]     = useState('');
  const [currentPage, setCurrentPage]     = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [totalItems, setTotalItems]       = useState(0);

  // ── Location hierarchy ──────────────────────────────────────────────────────
  const [districts, setDistricts]       = useState([]);
  const [blocks, setBlocks]             = useState([]);
  const [clusters, setClusters]         = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock]       = useState('');
  const [selectedCluster, setSelectedCluster]   = useState('');
  const [loadingBlocks, setLoadingBlocks]       = useState(false);
  const [loadingClusters, setLoadingClusters]   = useState(false);

  const [downloadLoading, setDownloadLoading] = useState(null);
  const [actionLoading, setActionLoading]     = useState(false);
  const [approveModal, setApproveModal] = useState({ open: false, report: null });
  const [rejectModal, setRejectModal]   = useState({ open: false, report: null });
  const [remarks, setRemarks]           = useState('');

  // ── Fetch reports ─────────────────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        month: selectedMonth, year: selectedYear,
        page: currentPage, limit: 15,
      };
      if (blockFilter)      params.block_name   = blockFilter;
      if (schoolFilter)     params.udise_code   = schoolFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (selectedDistrict) params.district_cd  = selectedDistrict;
      if (selectedBlock)    params.block_cd     = selectedBlock;
      if (selectedCluster)  params.cluster_cd   = selectedCluster;

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
  }, [selectedMonth, selectedYear, blockFilter, schoolFilter, statusFilter, currentPage, selectedDistrict, selectedBlock, selectedCluster]);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await api.get('/reports/dashboard-pending-counts', {
        params: { month: selectedMonth, year: selectedYear },
      });
      if (res.data?.status) setCounts(res.data.data);
    } catch (_) {}
  }, [selectedMonth, selectedYear]);

  // ── Load districts on mount ───────────────────────────────────────────────
  useEffect(() => {
    api.get('/reports/location-master', { params: { type: 'districts' } })
      .then(r => { if (r.data?.status) setDistricts(r.data.data || []); })
      .catch(() => {});
  }, []);

  // ── Load blocks when district changes ────────────────────────────────────
  useEffect(() => {
    if (!selectedDistrict) { setBlocks([]); setSelectedBlock(''); setClusters([]); setSelectedCluster(''); return; }
    setLoadingBlocks(true);
    api.get('/reports/location-master', { params: { type: 'blocks', district_cd: selectedDistrict } })
      .then(r => { if (r.data?.status) setBlocks(r.data.data || []); })
      .catch(() => {})
      .finally(() => setLoadingBlocks(false));
    setSelectedBlock(''); setClusters([]); setSelectedCluster('');
  }, [selectedDistrict]);

  // ── Load clusters when block changes ─────────────────────────────────────
  useEffect(() => {
    if (!selectedBlock) { setClusters([]); setSelectedCluster(''); return; }
    setLoadingClusters(true);
    api.get('/reports/location-master', { params: { type: 'clusters', district_cd: selectedDistrict, block_cd: selectedBlock } })
      .then(r => { if (r.data?.status) setClusters(r.data.data || []); })
      .catch(() => {})
      .finally(() => setLoadingClusters(false));
    setSelectedCluster('');
  }, [selectedBlock, selectedDistrict]);

  useEffect(() => { fetchReports(); fetchCounts(); }, [fetchReports, fetchCounts]);
  useEffect(() => { setCurrentPage(1); }, [selectedMonth, selectedYear, blockFilter, schoolFilter, statusFilter, selectedDistrict, selectedBlock, selectedCluster]);

  // ── Client-side search ────────────────────────────────────────────────────
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter(r =>
      r.vt_name?.toLowerCase().includes(q) ||
      r.school_name?.toLowerCase().includes(q) ||
      r.trade?.toLowerCase().includes(q) ||
      r.vtp_name?.toLowerCase().includes(q)
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
        toast.success('Report approved');
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
          <p className="text-xs text-gray-400">{row.block_name}</p>
        </div>
      ),
    },
    {
      key: 'trade',
      header: 'Trade / VTP',
      render: (_, row) => (
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{row.trade || '—'}</p>
          <p className="text-xs text-gray-500">{row.vtp_name || '—'}</p>
        </div>
      ),
    },
    {
      key: 'hm_approval_status',
      header: 'Principal',
      render: (value) => <ApprovalPill status={value} label={value === 'approved' ? 'HM Approved' : value === 'rejected' ? 'HM Rejected' : 'HM Pending'} />,
    },
    {
      key: 'deo_approval_status',
      header: 'My Approval (DEO)',
      render: (value) => <ApprovalPill status={value} label={value === 'approved' ? 'Approved' : value === 'rejected' ? 'Rejected' : 'Pending'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => {
        const hmApproved = row.hm_approval_status === 'approved';
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

            {/* Approve */}
            {row.deo_approval_status === 'pending' && (
              <>
                <div title={!hmApproved ? 'Not approved by Principal/HM' : ''}>
                  <Button
                    variant="success"
                    size="sm"
                    leftIcon={<CheckCircle className="h-3 w-3" />}
                    disabled={!hmApproved}
                    onClick={() => { setApproveModal({ open: true, report: row }); setRemarks(''); }}
                  >
                    Approve
                  </Button>
                </div>
                {!hmApproved && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Awaiting HM approval
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
            {row.deo_approval_status === 'approved' && (
              <Badge variant="success" outline rounded size="sm">
                <ShieldCheck className="h-3 w-3 mr-1" /> Approved
              </Badge>
            )}
            {row.deo_approval_status === 'rejected' && (
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly VT Attendance Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve VT monthly attendance reports in your district
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending My Action</p>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved by Me</p>
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
            {counts.pending_my_action !== 1 ? 's have' : ' has'} HM approval and are waiting for your DEO approval.
          </p>
        </motion.div>
      )}

      {/* Filters */}
      <Card variant="elevated">
        {/* Row 1: Month / Year / Status / Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <option value="pending_my_action">Pending My Action</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <Input
            placeholder="Search VT, school, trade..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Row 2: District / Block / Cluster (cascading) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {/* District */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d.district_cd} value={d.district_cd}>{d.district_name}</option>
              ))}
            </select>
          </div>

          {/* Block */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Block {loadingBlocks && <span className="text-primary-500">(loading...)</span>}
            </label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              disabled={!selectedDistrict || loadingBlocks}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Blocks</option>
              {blocks.map((b) => (
                <option key={b.block_cd} value={b.block_cd}>{b.block_name}</option>
              ))}
            </select>
          </div>

          {/* Cluster */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Cluster {loadingClusters && <span className="text-primary-500">(loading...)</span>}
            </label>
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              disabled={!selectedBlock || loadingClusters}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All Clusters</option>
              {clusters.map((c) => (
                <option key={c.cluster_cd} value={c.cluster_cd}>{c.cluster_name}</option>
              ))}
            </select>
          </div>
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

      {/* ── Approve Modal ──────────────────────────────────────────────────────── */}
      <Modal
        isOpen={approveModal.open}
        onClose={() => { setApproveModal({ open: false, report: null }); setRemarks(''); }}
        title="Approve Monthly Report (DEO)"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setApproveModal({ open: false, report: null }); setRemarks(''); }}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleApprove} loading={actionLoading} leftIcon={<CheckCircle className="h-4 w-4" />}>
              Confirm DEO Approval
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <CheckCircle className="h-10 w-10 text-green-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Approve this report at DEO level?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Report will move to VTP for final approval.</p>
            </div>
          </div>
          {approveModal.report && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-1">
              <p className="font-semibold text-gray-900 dark:text-white">{approveModal.report.vt_name}</p>
              <p className="text-sm text-gray-500">{approveModal.report.school_name} · {approveModal.report.trade}</p>
              <div className="flex gap-2 mt-1">
                <ApprovalPill status={approveModal.report.hm_approval_status} label="HM Approved" />
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
        title="Reject Monthly Report (DEO)"
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
              <p className="font-medium text-gray-900 dark:text-white">Reject this report?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Please provide a reason.</p>
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

export default MonthlyReports;
