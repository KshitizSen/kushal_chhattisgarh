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
  ClipboardList,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import principalService from '../../services/principalService';
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

const calcDays = (from, to) => {
  if (!from || !to) return '—';
  const diff = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24) + 1;
  return `${diff} day${diff !== 1 ? 's' : ''}`;
};

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
  const [actionLoading, setActionLoading] = useState(false);

  // ── Tab state ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('onduty'); // 'onduty' | 'regularization'

  // ── Build payload ─────────────────────────────────────────────────────
  const buildPayload = useCallback((limit = 20, p = page, status = statusFilter) => {
    const payload = { limit, page: p };
    if (status) payload.status = status;
    if (user?.udise_code) payload.udise_code = user.udise_code;
    return payload;
  }, [page, statusFilter, user]);

  // ── Fetch list ────────────────────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const payload = buildPayload();
      const res = activeTab === 'onduty'
        ? await principalService.getOnDutyRequests(payload)
        : await principalService.getRegularizationRequests(payload);

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
            if (r.status === 'pending') s.pending++;
            if (r.status === 'approved') s.approved++;
            if (r.status === 'rejected') s.rejected++;
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
  }, [activeTab, buildPayload, statusFilter]);

  // ── Fetch all-status counts ───────────────────────────────────────────
  const fetchCounts = useCallback(async () => {
    try {
      const payload = buildPayload(100, 1, '');
      const res = activeTab === 'onduty'
        ? await principalService.getOnDutyRequests(payload)
        : await principalService.getRegularizationRequests(payload);

      if (res.data?.status || res.data?.success) {
        const all = res.data.data || [];
        const s = { pending: 0, approved: 0, rejected: 0 };
        all.forEach((r) => {
          if (r.status === 'pending') s.pending++;
          if (r.status === 'approved') s.approved++;
          if (r.status === 'rejected') s.rejected++;
        });

        const pag = res.data.pagination || {};
        setCounts({ ...s, total: pag.totalRecords ?? pag.total ?? res.data.total ?? 0 });
      }
    } catch (_) { /* silently ignore count fetch errors */ }
  }, [activeTab, buildPayload]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Reset to page 1 and clear status filter when tab changes
  useEffect(() => {
    setPage(1);
    setStatusFilter('');
    setSearchQuery('');
  }, [activeTab]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // ── Client-side search ────────────────────────────────────────────────
  const filteredRequests = requests.filter((r) => {
    const q = searchQuery.toLowerCase();
    const name = r.teacher_name || r.vt_name || r.user_name || '';
    const reason = r.reason || '';
    const phone = r.vt_phone || r.phone || '';
    return (
      name.toLowerCase().includes(q) ||
      reason.toLowerCase().includes(q) ||
      phone.toString().includes(q)
    );
  });

  // ── Approve handler ───────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const id = selectedRequest.id || selectedRequest.od_id || selectedRequest.reg_id;

      if (activeTab === 'onduty') {
        await principalService.updateOnDutyStatus(id, 'approved');
      } else {
        await principalService.updateRegularizationStatus(id, 'approved');
      }

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
      const id = selectedRequest.id || selectedRequest.od_id || selectedRequest.reg_id;

      if (activeTab === 'onduty') {
        await principalService.updateOnDutyStatus(id, 'rejected');
      } else {
        await principalService.updateRegularizationStatus(id, 'rejected');
      }

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

  // ── Table columns ─────────────────────────────────────────────────────
  const columns = [
    {
      key: 'teacher_name',
      header: 'Teacher',
      render: (value, row) => {
        const name = value || row.vt_name || row.user_name || '—';
        const phone = row.vt_phone || row.mobile || '—';
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
      render: (value, row) => (
        <Badge variant="primary" size="sm" outline>
          {activeTab === 'onduty' ? (row.od_type || 'On Duty') : 'Regularization'}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: activeTab === 'onduty' ? 'Duration' : 'Date',
      render: (value, row) => {
        if (activeTab === 'onduty') {
          return (
            <div className="flex flex-col">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {fmtDate(row.from_date)} → {fmtDate(row.to_date)}
              </span>
              <span className="text-xs text-gray-500">{calcDays(row.from_date, row.to_date)}</span>
            </div>
          );
        } else {
          return (
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {fmtDate(row.date)}
            </span>
          );
        }
      },
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
                onClick={() => { setSelectedRequest(row); setIsApproveModalOpen(true); }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle className="h-3.5 w-3.5" />}
                onClick={() => { setSelectedRequest(row); setIsRejectModalOpen(true); }}
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
            Attendance Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and approve VT teacher attendance requests
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
            <span className="font-semibold">{counts.pending}</span> request
            {counts.pending > 1 ? 's' : ''} awaiting your approval.
          </p>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('onduty')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'onduty'
            ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
        >
          <ClipboardList className="h-4 w-4" />
          OnDuty Requests
        </button>
        <button
          onClick={() => setActiveTab('regularization')}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'regularization'
            ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
        >
          <CalendarDays className="h-4 w-4" />
          Regularization Requests
        </button>
      </div>

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

      {/* Requests Table */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activeTab === 'onduty' ? 'OnDuty Requests' : 'Regularization Requests'}
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
            <Loader text={`Loading ${activeTab === 'onduty' ? 'OnDuty' : 'Regularization'} requests...`} />
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
                  {(selectedRequest.teacher_name || selectedRequest.vt_name || selectedRequest.user_name || '?').charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedRequest.teacher_name || selectedRequest.vt_name || selectedRequest.user_name}
                  </p>
                  <p className="text-xs text-gray-500">{selectedRequest.vt_phone || selectedRequest.mobile}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium capitalize">
                  {activeTab === 'onduty' ? (selectedRequest.od_type || 'On Duty') : 'Regularization'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{activeTab === 'onduty' ? 'Duration:' : 'Date:'}</span>
                <span className="font-medium">
                  {activeTab === 'onduty'
                    ? `${fmtDate(selectedRequest.from_date)} → ${fmtDate(selectedRequest.to_date)}`
                    : fmtDate(selectedRequest.date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reason:</span>
                <span className="font-medium max-w-xs text-right">{selectedRequest.reason || '—'}</span>
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
                  {(selectedRequest.teacher_name || selectedRequest.vt_name || selectedRequest.user_name || '?').charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedRequest.teacher_name || selectedRequest.vt_name || selectedRequest.user_name}
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Reason for Request:</span>
                <span className="font-medium max-w-xs text-right">{selectedRequest.reason || '—'}</span>
              </div>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default AttendanceRequests;
