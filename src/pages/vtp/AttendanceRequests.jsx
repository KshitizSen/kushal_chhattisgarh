import React, { useCallback, useEffect, useState } from 'react';
import {
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import vtpService from '../../services/vtpService';
import useAuthStore from '../../store/authStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    : '—';

const fmtDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    : '—';

// ── Component ─────────────────────────────────────────────────────────────────
const AttendanceRequests = () => {
  const { user } = useAuthStore();

  // ── List & pagination state ───────────────────────────────────────────
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, total_pages: 1, page: 1, limit: 20 });

  // ── Filter state ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // '' = all
  const [page, setPage] = useState(1);

  // ── Action state ──────────────────────────────────────────────────────
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Build payload ─────────────────────────────────────────────────────
  const buildPayload = useCallback((limit = 20, p = page, status = statusFilter) => {
    const payload = { limit, page: p };
    if (status) payload.status = status;
    return payload;
  }, [page, statusFilter]);

  // ── Fetch list ────────────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const payload = buildPayload();
      const res = await vtpService.getOnDutyRequests(payload);

      if (res.data?.status || res.data?.success) {
        const data = res.data.data || [];
        setRequests(data);

        const pag = res.data.pagination || {};
        setPagination({
          total: pag.totalRecords ?? pag.total ?? res.data.total ?? 0,
          total_pages: pag.totalPages ?? pag.total_pages ?? res.data.total_pages ?? 1,
          page: pag.currentPage ?? pag.page ?? res.data.page ?? 1,
          limit: pag.limit ?? res.data.limit ?? 20,
        });

        // Background fetch for all statuses counts if a filter is active
        if (statusFilter) {
          fetchCounts();
        } else {
          const s = { pending: 0, approved: 0, rejected: 0 };
          data.forEach((r) => {
            if (r.vtp_status === 'pending') s.pending++;
            if (r.vtp_status === 'approved') s.approved++;
            if (r.vtp_status === 'rejected') s.rejected++;
          });
          setCounts({ ...s, total: pag.totalRecords ?? pag.total ?? res.data.total ?? 0 });
        }
      } else {
        toast.error(res.data?.message || 'Failed to load requests');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error loading requests');
    } finally {
      setLoading(false);
    }
  }, [buildPayload, statusFilter]);

  // ── Fetch all-status counts ───────────────────────────────────────────
  const fetchCounts = useCallback(async () => {
    try {
      const payload = buildPayload(100, 1, '');
      const res = await vtpService.getOnDutyRequests(payload);

      if (res.data?.status || res.data?.success) {
        const all = res.data.data || [];
        const s = { pending: 0, approved: 0, rejected: 0 };
        all.forEach((r) => {
          if (r.vtp_status === 'pending') s.pending++;
          if (r.vtp_status === 'approved') s.approved++;
          if (r.vtp_status === 'rejected') s.rejected++;
        });

        const pag = res.data.pagination || {};
        setCounts({ ...s, total: pag.totalRecords ?? pag.total ?? res.data.total ?? 0 });
      }
    } catch (_) { /* silently ignore count fetch errors */ }
  }, [buildPayload]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // ── Client-side search ────────────────────────────────────────────────
  const filteredRequests = requests.filter((r) => {
    const q = searchQuery.toLowerCase();
    const name = r.user_name || r.vt_name || '';
    const reason = r.reason || '';
    const phone = r.mobile || r.phone || '';
    const udise = r.udise_code || '';
    const trade = r.trade || '';
    return (
      name.toLowerCase().includes(q) ||
      reason.toLowerCase().includes(q) ||
      phone.toString().includes(q) ||
      udise.toString().includes(q) ||
      trade.toLowerCase().includes(q)
    );
  });

  // ── Approve handler ───────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const id = selectedRequest.id || selectedRequest.od_id;
      await vtpService.updateOnDutyStatus(id, 'approved');

      toast.success(`Request approved successfully`);
      setIsApproveModalOpen(false);
      setSelectedRequest(null);
      fetchRequests();
      fetchCounts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject handler ────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const id = selectedRequest.id || selectedRequest.od_id;
      await vtpService.updateOnDutyStatus(id, 'rejected');

      toast.success(`Request rejected successfully`);
      setIsRejectModalOpen(false);
      setSelectedRequest(null);
      fetchRequests();
      fetchCounts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────
  const columns = [
    {
      key: 'user_name',
      header: 'Teacher',
      render: (value, row) => {
        const name = row.user_name || row.vt_name || '—';
        const phone = row.mobile || row.phone || '—';
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
              {name.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{name}</p>
              <p className="text-xs text-gray-500">{phone}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      render: (_, row) => (
        <Badge variant="primary" size="sm" outline>
          {row.od_type || 'On Duty'}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: 'Duration',
      render: (_, row) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {fmtDate(row.from_date)} → {fmtDate(row.to_date)}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (value) => (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-[150px]" title={value}>
          {value || '—'}
        </p>
      ),
    },
    {
      key: 'created_at',
      header: 'Applied On',
      render: (value) => (
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          {fmtDate(value)}
        </div>
      ),
    },
    {
      key: 'hm_status',
      header: 'HM Status',
      render: (_, row) => <StatusBadge status={row.hm_status || 'pending'} />,
    },
    {
      key: 'vtp_status',
      header: 'VTP Status',
      render: (_, row) => <StatusBadge status={row.vtp_status || 'pending'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex flex-col gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Eye className="h-3.5 w-3.5" />}
            onClick={() => { setSelectedRequest(row); setIsViewModalOpen(true); }}
          >
            View
          </Button>
          {row.vtp_status === 'pending' && (
            <div className="flex gap-1.5">
              <Button
                variant="success"
                size="sm"
                className="flex-1"
                leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                onClick={() => { setSelectedRequest(row); setIsApproveModalOpen(true); }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                leftIcon={<XCircle className="h-3.5 w-3.5" />}
                onClick={() => { setSelectedRequest(row); setIsRejectModalOpen(true); }}
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Attendance Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and approve OnDuty attendance requests
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={() => { fetchRequests(); fetchCounts(); }}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pending Requests', value: counts.pending, color: 'yellow', Icon: Clock },
          { label: 'Approved', value: counts.approved, color: 'green', Icon: CheckCircle },
          { label: 'Rejected', value: counts.rejected, color: 'red', Icon: XCircle },
        ].map(({ label, value, color, Icon }) => (
          <Card
            key={label}
            variant="elevated"
            padding="sm"
            className={`bg-gradient-to-br from-${color}-50 to-${color}-100 dark:from-${color}-900/20 dark:to-${color}-900/10 cursor-pointer`}
            onClick={() => setStatusFilter(
              color === 'yellow' ? 'pending' : color === 'green' ? 'approved' : 'rejected'
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium text-${color}-700 dark:text-${color}-300`}>{label}</p>
                <p className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
              </div>
              <div className={`p-2.5 rounded-2xl bg-${color}-100 dark:bg-${color}-900/30`}>
                <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pending Alert Banner */}
      {counts.pending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-800 dark:text-yellow-200">
            <span className="font-semibold">{counts.pending}</span> request
            {counts.pending > 1 ? 's' : ''} awaiting your approval.
          </p>
        </motion.div>
      )}

      {/* Filters */}
      <Card variant="elevated">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by teacher name, reason..."
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
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            {statusFilter && (
              <button
                onClick={() => setStatusFilter('')}
                className="text-xs text-primary-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Requests Table */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            OnDuty Requests
            {statusFilter && (
              <span className="ml-2 text-sm font-normal text-gray-500 capitalize">
                ({statusFilter})
              </span>
            )}
          </h2>
          <Badge variant="primary" outline>
            {pagination.total} Total
          </Badge>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader text="Loading requests..." />
          </div>
        ) : (
          <Table
            data={filteredRequests}
            columns={columns}
            emptyState={
              <div className="text-center py-12">
                <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No requests found</p>
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

      {/* ── View Details Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedRequest(null); }}
        title="OnDuty Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">VT Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedRequest.user_name || selectedRequest.vt_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mobile:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedRequest.mobile || selectedRequest.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">School UDISE:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedRequest.udise_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trade:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedRequest.trade}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Request Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">OD Type:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedRequest.od_type || 'On Duty'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">From Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{fmtDate(selectedRequest.from_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">To Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{fmtDate(selectedRequest.to_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Reason</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{selectedRequest.reason || 'No reason provided.'}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Approval Flow</h3>
              <div className="space-y-4 text-sm">

                {/* HM Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">HM Status</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${getStatusColor(selectedRequest.hm_status)}`}>
                        {selectedRequest.hm_status === 'approved' && '✅ '}
                        {selectedRequest.hm_status === 'rejected' && '❌ '}
                        {selectedRequest.hm_status === 'pending' && '⏳ '}
                        {selectedRequest.hm_status || 'pending'}
                      </span>
                    </div>
                    {selectedRequest.hm_status !== 'pending' && (
                      <div className="text-xs text-gray-500 mt-1">
                        By: {selectedRequest.hm_approved_by_name || 'Headmaster'} <br />
                        At: {fmtDateTime(selectedRequest.hm_action_at)}
                      </div>
                    )}
                  </div>
                </div>

                {/* VTP Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">VTP Status</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${getStatusColor(selectedRequest.vtp_status)}`}>
                        {selectedRequest.vtp_status === 'approved' && '✅ '}
                        {selectedRequest.vtp_status === 'rejected' && '❌ '}
                        {selectedRequest.vtp_status === 'pending' && '⏳ '}
                        {selectedRequest.vtp_status || 'pending'}
                      </span>
                    </div>
                    {selectedRequest.vtp_status !== 'pending' && (
                      <div className="text-xs text-gray-500 mt-1">
                        By: {selectedRequest.vtp_approved_by_name || 'VTP Admin'} <br />
                        At: {fmtDateTime(selectedRequest.vtp_action_at)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Status */}
                <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/10 rounded-lg border border-primary-100 dark:border-primary-900/30">
                  <span className="font-semibold text-primary-900 dark:text-primary-100">Final Status</span>
                  <span className={`text-sm font-semibold px-2 py-0.5 rounded-full border capitalize ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status === 'approved' && '✅ '}
                    {selectedRequest.status === 'rejected' && '❌ '}
                    {selectedRequest.status === 'pending' && '⏳ '}
                    {selectedRequest.status || 'pending'}
                  </span>
                </div>

              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Approve Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => { setIsApproveModalOpen(false); setSelectedRequest(null); }}
        title="Approve Request"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setIsApproveModalOpen(false); setSelectedRequest(null); }}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleApprove}
              loading={actionLoading}
              leftIcon={<CheckCircle className="h-4 w-4" />}
            >
              Approve Request
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <CheckCircle className="h-10 w-10 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Approve this request?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone.</p>
            </div>
          </div>

          {selectedRequest && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2 text-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                  {(selectedRequest.user_name || selectedRequest.vt_name || '?').charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedRequest.user_name || selectedRequest.vt_name}
                  </p>
                  <p className="text-xs text-gray-500">{selectedRequest.mobile || selectedRequest.phone}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium capitalize">
                  {selectedRequest.od_type || 'On Duty'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">
                  {`${fmtDate(selectedRequest.from_date)} → ${fmtDate(selectedRequest.to_date)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reason:</span>
                <span className="font-medium max-w-[200px] text-right truncate">{selectedRequest.reason || '—'}</span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Reject Modal ──────────────────────────────────────────────────── */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => { setIsRejectModalOpen(false); setSelectedRequest(null); }}
        title="Reject Request"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setIsRejectModalOpen(false); setSelectedRequest(null); }}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={actionLoading}
              leftIcon={<XCircle className="h-4 w-4" />}
            >
              Reject Request
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <XCircle className="h-10 w-10 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Reject this request?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">The teacher will be notified of this rejection.</p>
            </div>
          </div>

          {selectedRequest && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2 text-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                  {(selectedRequest.user_name || selectedRequest.vt_name || '?').charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedRequest.user_name || selectedRequest.vt_name}
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reason for Request:</span>
                <span className="font-medium max-w-[200px] text-right truncate">{selectedRequest.reason || '—'}</span>
              </div>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default AttendanceRequests;
