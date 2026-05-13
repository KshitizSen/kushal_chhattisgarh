import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Users,
  AlertCircle,
  UserCheck,
  Briefcase,
  Phone,
  MapPin,
  School,
  CreditCard,
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

// ── Approval status pill (same as Principal) ─────────────────────────────────
const ApprovalPill = ({ status }) => {
  const map = {
    pending: { variant: 'warning', label: 'Pending', Icon: Clock },
    accepted: { variant: 'success', label: 'Approved', Icon: ShieldCheck },
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
const VtApprovals = () => {
  const [vts, setVts] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedVt, setSelectedVt] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch VTs scoped to logged-in VTP ────────────────────────────────────
  const fetchVts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/vtp/vts?status=${statusFilter}`);
      if (res.data?.status) {
        setVts(res.data.data || []);
        setCounts(res.data.counts || { total: 0, pending: 0, accepted: 0, rejected: 0 });
      } else {
        toast.error(res.data?.message || 'Failed to load VTs');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Error loading VTs');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchVts(); }, [fetchVts]);

  // ── Client-side search ───────────────────────────────────────────────────
  const filteredVts = useMemo(() => {
    if (!searchQuery.trim()) return vts;
    const q = searchQuery.toLowerCase();
    return vts.filter(v =>
      v.name?.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.trade?.toLowerCase().includes(q) ||
      String(v.phone || '').includes(q) ||
      v.school_name?.toLowerCase().includes(q)
    );
  }, [vts, searchQuery]);

  // ── Approve ───────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!selectedVt) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/vtp/${selectedVt.id}/approve`);
      if (res.data?.status) {
        toast.success(res.data.message || `${selectedVt.name} approved successfully`);
        setIsApproveModalOpen(false);
        setSelectedVt(null);
        fetchVts();
      } else {
        toast.error(res.data?.message || 'Approval failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve VT');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!selectedVt || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/vtp/${selectedVt.id}/reject`, { reason: rejectReason.trim() });
      if (res.data?.status) {
        toast.success(res.data.message || `${selectedVt.name} rejected`);
        setIsRejectModalOpen(false);
        setSelectedVt(null);
        setRejectReason('');
        fetchVts();
      } else {
        toast.error(res.data?.message || 'Rejection failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject VT');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Table columns (matches Principal TeacherApproval) ────────────────────
  const columns = [
    {
      key: 'name',
      header: 'Teacher Name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
            {value?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value || '—'}</p>
            <p className="text-xs text-gray-500">{row.email || '—'}</p>
            <p className="text-xs text-gray-400">{row.phone || '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'trade',
      header: 'Trade',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-700 dark:text-gray-300 text-sm">{value || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'school_name',
      header: 'School',
      render: (value, row) => (
        <div>
          <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
            <School className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>{value || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            <MapPin className="h-3 w-3" />
            <span>{row.block_name}, {row.district_name}</span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">UDISE: {row.udise_code || '—'}</div>
        </div>
      ),
    },
    {
      key: 'vt_approval_status',
      header: 'HM (Principal)',
      render: (value) => <ApprovalPill status={value} />,
    },
    {
      key: 'vtp_approval_status',
      header: 'VTP Status',
      render: (value) => <ApprovalPill status={value} />,
    },
    {
      key: 'is_active',
      header: 'Active',
      render: (value) => (
        <Badge variant={value ? 'success' : 'default'} size="sm" outline>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex flex-col gap-2">
          {row.vtp_approval_status === 'pending' && (
            <>
              <Button
                variant="success"
                size="sm"
                leftIcon={<CheckCircle className="h-4 w-4" />}
                onClick={() => { setSelectedVt(row); setIsApproveModalOpen(true); }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle className="h-4 w-4" />}
                onClick={() => { setSelectedVt(row); setIsRejectModalOpen(true); }}
              >
                Reject
              </Button>
            </>
          )}
          {row.vtp_approval_status === 'accepted' && (
            <Badge variant="success" outline rounded>
              <UserCheck className="h-4 w-4 mr-1" />
              Accepted
            </Badge>
          )}
          {row.vtp_approval_status === 'rejected' && (
            <Badge variant="danger" outline rounded>
              <XCircle className="h-4 w-4 mr-1" />
              Rejected
            </Badge>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" text="Loading VT requests..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            VT Approvals
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve Vocational Teachers assigned to your VTP organization
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={fetchVts}
          loading={loading}
        >
          Refresh List
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          variant="elevated"
          className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 cursor-pointer"
          onClick={() => setStatusFilter('pending')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{counts.pending}</p>
            </div>
            <div className="p-3 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card
          variant="elevated"
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 cursor-pointer"
          onClick={() => setStatusFilter('accepted')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved Teachers</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{counts.accepted}</p>
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

      {/* Pending Alert Banner */}
      {counts.pending > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-800 dark:text-yellow-200">
            <span className="font-semibold">{counts.pending}</span> VT teacher
            {counts.pending > 1 ? 's are' : ' is'} awaiting your VTP approval.
            Please review their applications.
          </p>
        </motion.div>
      )}

      {/* Filters */}
      <Card variant="elevated">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, email, trade or school..."
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
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* VT Table */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            VT Registrations
          </h2>
          <Badge variant="primary" outline>
            {filteredVts.length} record{filteredVts.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <Table
          data={filteredVts}
          columns={columns}
          emptyState={
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No VT requests found</p>
            </div>
          }
        />
      </Card>

      {/* ── Approve Modal ─────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => { setIsApproveModalOpen(false); setSelectedVt(null); }}
        title="Approve VT"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => { setIsApproveModalOpen(false); setSelectedVt(null); }}
            >
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
              <p className="font-medium text-gray-900 dark:text-white">
                Are you sure you want to approve this teacher?
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Account becomes active only after <strong>both</strong> Headmaster and VTP approve.
              </p>
            </div>
          </div>

          {selectedVt && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                  {selectedVt.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedVt.name}</p>
                  <p className="text-sm text-gray-500">{selectedVt.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Trade:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedVt.trade || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {selectedVt.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">School:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedVt.school_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Aadhar:</span>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    {selectedVt.vt_aadhar || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">HM Status:</span>
                  <ApprovalPill status={selectedVt.vt_approval_status} />
                </div>
                <div>
                  <span className="text-gray-500">VTP Status:</span>
                  <ApprovalPill status={selectedVt.vtp_approval_status} />
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Reject Modal ──────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => { setIsRejectModalOpen(false); setSelectedVt(null); setRejectReason(''); }}
        title="Reject VT"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => { setIsRejectModalOpen(false); setSelectedVt(null); setRejectReason(''); }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={actionLoading}
              disabled={!rejectReason.trim()}
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
              <p className="font-medium text-gray-900 dark:text-white">
                Reject this teacher registration?
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please provide a reason for rejection.
              </p>
            </div>
          </div>

          {selectedVt && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg">
                  {selectedVt.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedVt.name}</p>
                  <p className="text-sm text-gray-500">{selectedVt.email}</p>
                </div>
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

export default VtApprovals;
