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

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

const calcDays = (from, to) => {
  if (!from || !to) return '—';
  const diff = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24) + 1;
  return `${diff} day${diff !== 1 ? 's' : ''}`;
};

// ── Component ─────────────────────────────────────────────────────────────────
const LeaveManagement = () => {
  // ── List & pagination state ───────────────────────────────────────────
  const [leaves, setLeaves]             = useState([]);
  const [counts, setCounts]             = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading]           = useState(false);
  const [pagination, setPagination]     = useState({ total: 0, total_pages: 1, page: 1, limit: 20 });

  // ── Filter state ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');   // '' = all
  const [page, setPage]                 = useState(1);

  // ── Action state ──────────────────────────────────────────────────────
  const [selectedLeave, setSelectedLeave]         = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen]   = useState(false);
  const [rejectReason, setRejectReason]             = useState('');
  const [actionLoading, setActionLoading]           = useState(false);

  // ── Fetch leave list ──────────────────────────────────────────────────
  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set('status', statusFilter);

      const res = await api.get(`/headmaster/leaves?${params.toString()}`);

      if (res.data?.success) {
        const data = res.data.data || [];
        setLeaves(data);
        setPagination({
          total:       res.data.total       ?? 0,
          total_pages: res.data.total_pages ?? 1,
          page:        res.data.page        ?? 1,
          limit:       res.data.limit       ?? 20,
        });

        // Compute counts from the FULL dataset (fetch all statuses for summary cards)
        // We do a separate all-status fetch only for counts if a filter is active
        if (statusFilter) {
          // Fetch unfiltered counts in the background
          const countRes = await api.get('/headmaster/leaves?limit=1');
          if (countRes.data?.success) {
            buildCounts(countRes.data.data, data, statusFilter);
          }
        } else {
          const s = { pending: 0, approved: 0, rejected: 0 };
          data.forEach((l) => {
            if (l.status === 'pending')  s.pending++;
            if (l.status === 'approved') s.approved++;
            if (l.status === 'rejected') s.rejected++;
          });
          setCounts({ ...s, total: res.data.total ?? 0 });
        }
      } else {
        toast.error(res.data?.message || 'Failed to load leave requests');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error loading leave requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  // ── Fetch all-status counts (sidebar cards always reflect full picture) ──
  const fetchCounts = useCallback(async () => {
    try {
      const res = await api.get('/headmaster/leaves?limit=100');
      if (res.data?.success) {
        const all = res.data.data || [];
        const s   = { pending: 0, approved: 0, rejected: 0 };
        all.forEach((l) => {
          if (l.status === 'pending')  s.pending++;
          if (l.status === 'approved') s.approved++;
          if (l.status === 'rejected') s.rejected++;
        });
        setCounts({ ...s, total: res.data.total ?? 0 });
      }
    } catch (_) { /* silently ignore count fetch errors */ }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // Always keep counts up-to-date even when a filter is active
  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // ── Client-side search (server handles status filter) ─────────────────
  const filteredLeaves = leaves.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.teacher_name?.toLowerCase().includes(q) ||
      l.leave_type?.toLowerCase().includes(q) ||
      l.vt_phone?.toString().includes(q) ||
      l.vt_aadhar?.toString().includes(q)
    );
  });

  // ── Approve handler ───────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!selectedLeave) return;
    setActionLoading(true);
    try {
      await api.patch(`/leaves/${selectedLeave.leave_id}/status`, { status: 'approved' });
      toast.success(`Leave request approved for ${selectedLeave.teacher_name}`);
      setIsApproveModalOpen(false);
      setSelectedLeave(null);
      fetchLeaves();
      fetchCounts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve leave');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject handler ────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!selectedLeave || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await api.patch(`/leaves/${selectedLeave.leave_id}/status`, {
        status: 'rejected',
        reason: rejectReason.trim(),
      });
      toast.success(`Leave request rejected for ${selectedLeave.teacher_name}`);
      setIsRejectModalOpen(false);
      setSelectedLeave(null);
      setRejectReason('');
      fetchLeaves();
      fetchCounts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject leave');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────
  const columns = [
    {
      key: 'teacher_name',
      header: 'Teacher',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
            {value?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value || '—'}</p>
            <p className="text-xs text-gray-500">{row.vt_phone || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'leave_type',
      header: 'Leave Type',
      render: (value) => (
        <Badge variant="primary" size="sm" outline>
          {value || '—'}
        </Badge>
      ),
    },
    {
      key: 'from_date',
      header: 'Duration',
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {fmtDate(value)} → {fmtDate(row.to_date)}
          </span>
          <span className="text-xs text-gray-500">{calcDays(value, row.to_date)}</span>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (value) => (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-xs">
          {value || '—'}
        </p>
      ),
    },
    {
      key: 'applied_at',
      header: 'Applied On',
      render: (value) => (
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          {fmtDate(value)}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex flex-col gap-1.5">
          {row.status === 'pending' && (
            <>
              <Button
                variant="success"
                size="sm"
                leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                onClick={() => { setSelectedLeave(row); setIsApproveModalOpen(true); }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle className="h-3.5 w-3.5" />}
                onClick={() => { setSelectedLeave(row); setIsRejectModalOpen(true); }}
              >
                Reject
              </Button>
            </>
          )}
          {row.status === 'approved' && (
            <Badge variant="success" outline size="sm">
              <CheckCircle className="h-3 w-3 mr-1 inline" /> Approved
            </Badge>
          )}
          {row.status === 'rejected' && (
            <Badge variant="danger" outline size="sm">
              <XCircle className="h-3 w-3 mr-1 inline" /> Rejected
            </Badge>
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
            Leave Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and approve VT teacher leave requests
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={() => { fetchLeaves(); fetchCounts(); }}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Pending Requests', value: counts.pending,  color: 'yellow', Icon: Clock },
          { label: 'Approved',         value: counts.approved, color: 'green',  Icon: CheckCircle },
          { label: 'Rejected',         value: counts.rejected, color: 'red',    Icon: XCircle },
        ].map(({ label, value, color, Icon }) => (
          <Card
            key={label}
            variant="elevated"
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
              <div className={`p-3 rounded-2xl bg-${color}-100 dark:bg-${color}-900/30`}>
                <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
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
            <span className="font-semibold">{counts.pending}</span> leave request
            {counts.pending > 1 ? 's' : ''} awaiting your approval.
          </p>
        </motion.div>
      )}

      {/* Filters */}
      <Card variant="elevated">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by teacher name, code, or leave type..."
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

      {/* Leave Requests Table */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Leave Requests
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
            <Loader text="Loading leave requests..." />
          </div>
        ) : (
          <Table
            data={filteredLeaves}
            columns={columns}
            emptyState={
              <div className="text-center py-12">
                <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No leave requests found</p>
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

      {/* ── Approve Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => { setIsApproveModalOpen(false); setSelectedLeave(null); }}
        title="Approve Leave Request"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setIsApproveModalOpen(false); setSelectedLeave(null); }}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleApprove}
              loading={actionLoading}
              leftIcon={<CheckCircle className="h-4 w-4" />}
            >
              Approve Leave
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <CheckCircle className="h-10 w-10 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Approve this leave request?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone.</p>
            </div>
          </div>

          {selectedLeave && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2 text-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                  {selectedLeave.teacher_name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedLeave.teacher_name}</p>
                  <p className="text-xs text-gray-500">{selectedLeave.teacher_code}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Leave Type:</span>
                <span className="font-medium capitalize">{selectedLeave.leave_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium">
                  {fmtDate(selectedLeave.from_date)} → {fmtDate(selectedLeave.to_date)}
                  <span className="ml-1 text-gray-500">({calcDays(selectedLeave.from_date, selectedLeave.to_date)})</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reason:</span>
                <span className="font-medium max-w-xs text-right">{selectedLeave.reason || '—'}</span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Reject Modal ──────────────────────────────────────────────────── */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => { setIsRejectModalOpen(false); setSelectedLeave(null); setRejectReason(''); }}
        title="Reject Leave Request"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setIsRejectModalOpen(false); setSelectedLeave(null); setRejectReason(''); }}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={actionLoading}
              disabled={!rejectReason.trim()}
              leftIcon={<XCircle className="h-4 w-4" />}
            >
              Reject Leave
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <AlertCircle className="h-10 w-10 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Reject this leave request?</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Please provide a reason for rejection.</p>
            </div>
          </div>

          {selectedLeave && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg flex-shrink-0">
                {selectedLeave.teacher_name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedLeave.teacher_name}</p>
                <p className="text-sm text-gray-500">
                  {calcDays(selectedLeave.from_date, selectedLeave.to_date)} — {selectedLeave.leave_type}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
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

export default LeaveManagement;
