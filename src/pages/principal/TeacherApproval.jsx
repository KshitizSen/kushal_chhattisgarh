import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  AlertCircle,
  UserCheck,
  Clock,
  Briefcase,
  Phone,
  RefreshCw,
  MapPin,
  School,
  CreditCard,
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

const TeacherApproval = () => {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch VT registrations (re-fetches when statusFilter changes) ──
  const fetchPendingTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/vt/list?status=${statusFilter}`);

      if (res.data?.status) {
        setPendingTeachers(res.data.data || []);
        setCounts(res.data.counts || { total: 0, pending: 0, accepted: 0, rejected: 0 });
      } else {
        toast.error(res.data?.message || 'Failed to load teachers');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error loading teachers';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPendingTeachers();
  }, [fetchPendingTeachers]);

  // ── Counts from API response ─────────────────────────────────────
  const pendingCount = counts.pending;
  const approvedCount = counts.accepted;
  const rejectedCount = counts.rejected;

  // ── Filtering (search only — status is handled by API) ───────────
  const filteredTeachers = pendingTeachers.filter((teacher) => {
    const q = searchQuery.toLowerCase();
    return (
      teacher.name?.toLowerCase().includes(q) ||
      teacher.email?.toLowerCase().includes(q) ||
      teacher.trade?.toLowerCase().includes(q) ||
      teacher.school_name?.toLowerCase().includes(q)
    );
  });

  // ── Approve ──────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!selectedTeacher) return;
    setActionLoading(true);
    try {
      console.log(selectedTeacher.id);

      const res = await api.patch(`/vt/${selectedTeacher.id}/approve`);
      console.log(res);

      if (res.data?.status) {
        toast.success(`${selectedTeacher.name} approved successfully`);
        setIsApproveModalOpen(false);
        setSelectedTeacher(null);
        fetchPendingTeachers();
      } else {
        toast.error(res.data?.message || 'Failed to approve');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to approve teacher');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Reject ───────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!selectedTeacher || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/vt/${selectedTeacher.id}/reject`, {
        reason: rejectReason,
      });
      if (res.data?.status) {
        toast.success(`${selectedTeacher.name} rejected`);
        setIsRejectModalOpen(false);
        setSelectedTeacher(null);
        setRejectReason('');
        fetchPendingTeachers();
      } else {
        toast.error(res.data?.message || 'Failed to reject');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject teacher');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Table columns ────────────────────────────────────────────────
  const columns = [
    {
      key: 'name',
      header: 'Teacher Name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold flex-shrink-0">
            {value?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500">{row.email}</p>
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
        </div>
      ),
    },
    {
      key: 'udise_code',
      header: 'UDISE Code',
      render: (value) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">{value || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Registered',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300 text-sm">
            {value ? new Date(value).toLocaleDateString('en-IN') : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: 'vt_approval_status',
      header: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex flex-col gap-2">
          {row.vt_approval_status === 'pending' && (
            <>
              <Button
                variant="success"
                size="sm"
                leftIcon={<CheckCircle className="h-4 w-4" />}
                onClick={() => {
                  setSelectedTeacher(row);
                  setIsApproveModalOpen(true);
                }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle className="h-4 w-4" />}
                onClick={() => {
                  setSelectedTeacher(row);
                  setIsRejectModalOpen(true);
                }}
              >
                Reject
              </Button>
            </>
          )}
          {row.vt_approval_status === 'accepted' && (
            <Badge variant="success" outline rounded>
              <UserCheck className="h-4 w-4 mr-1" />
              Accepted
            </Badge>
          )}
          {row.vt_approval_status === 'rejected' && (
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
        <Loader size="lg" text="Loading teacher requests..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Teacher Approval
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage vocational teacher registrations and approvals
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={fetchPendingTeachers}
          loading={loading}
        >
          Refresh List
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="elevated" className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Approvals
              </p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {pendingCount}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Approved Teachers
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {approvedCount}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card variant="elevated" className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Rejected
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {rejectedCount}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <p className="text-yellow-800 dark:text-yellow-200">
            <span className="font-semibold">{pendingCount}</span> VT teacher
            {pendingCount > 1 ? 's are' : ' is'} awaiting your approval.
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

      {/* Teachers Table */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pending VT Registrations
          </h2>
          <Badge variant="primary" outline>
            {filteredTeachers.length} record{filteredTeachers.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        <Table
          data={filteredTeachers}
          columns={columns}
          emptyState={
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No teacher requests found
              </p>
            </div>
          }
        />
      </Card>

      {/* Approve Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedTeacher(null);
        }}
        title="Approve Teacher"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsApproveModalOpen(false);
                setSelectedTeacher(null);
              }}
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
                This will allow to mark attendance and activities of teacher.
              </p>
            </div>
          </div>
          {selectedTeacher && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                  {selectedTeacher.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedTeacher.name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedTeacher.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Trade:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTeacher.trade || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTeacher.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">School:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTeacher.school_name || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Aadhar:</span>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    {selectedTeacher.vt_aadhar || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedTeacher(null);
          setRejectReason('');
        }}
        title="Reject Teacher"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsRejectModalOpen(false);
                setSelectedTeacher(null);
                setRejectReason('');
              }}
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
          {selectedTeacher && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg">
                  {selectedTeacher.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedTeacher.name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedTeacher.email}</p>
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

export default TeacherApproval;
