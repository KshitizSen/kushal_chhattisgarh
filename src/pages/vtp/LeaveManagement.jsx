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
  Wallet,
  Ban,
  Info,
  School,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useVtpStore from '../../store/vtpStore';
import vtpService from '../../services/vtpService';
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
  const {
    leaves,
    pagination,
    leaveLoading,
    fetchLeaves,
    approveLeave,
    rejectLeave,
    balances,
    balanceSummary,
    balanceLoading,
    fetchBalances,
  } = useVtpStore();

  // ── Local UI State ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');   // '' = all
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'balances'

  // ── Action Modal State ──────────────────────────────────────────────────
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedLeaveBalance, setSelectedLeaveBalance] = useState(null);

  // ── Data Fetching ─────────────────────────────────────────────────────
  const loadData = useCallback(() => {
    fetchLeaves({ page, status: statusFilter });
  }, [fetchLeaves, page, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === 'balances') {
      fetchBalances();
    }
  }, [activeTab, fetchBalances]);

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
      l.school_name?.toLowerCase().includes(q) ||
      l.vt_phone?.toString().includes(q)
    );
  });

  // ── Handlers ────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!selectedLeave) return;
    setActionLoading(true);
    const res = await approveLeave(selectedLeave.leave_id);
    if (res.success) {
      toast.success(res.message);
      setIsApproveModalOpen(false);
      setSelectedLeave(null);
    } else {
      toast.error(res.message || 'Failed to approve leave');
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    if (!selectedLeave || !rejectReason.trim()) return;
    setActionLoading(true);
    const res = await rejectLeave(selectedLeave.leave_id, rejectReason.trim());
    if (res.success) {
      toast.success(res.message);
      setIsRejectModalOpen(false);
      setSelectedLeave(null);
      setRejectReason('');
    } else {
      toast.error(res.message || 'Failed to reject leave');
    }
    setActionLoading(false);
  };

  const checkBalanceBeforeApprove = async (leave) => {
    setSelectedLeave(leave);
    setActionLoading(true);
    try {
      const res = await vtpService.checkLeaveBalance(leave.leave_id);
      if (res.data?.success) {
        setSelectedLeaveBalance(res.data.data);
      }
    } catch (err) {
      console.error('Failed to check balance:', err);
    } finally {
      setActionLoading(false);
      setIsApproveModalOpen(true);
    }
  };

  // ── Table Columns ─────────────────────────────────────────────────────
  const columns = [
    {
      key: 'teacher_name',
      header: 'Teacher',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold flex-shrink-0">
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
      key: 'school_name',
      header: 'School',
      render: (value, row) => (
        <div className="max-w-[180px]">
          <div className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            <School className="h-3.5 w-3.5 text-gray-400" />
            <span className="truncate">{value || '—'}</span>
          </div>
          <p className="text-[10px] text-gray-400 ml-4.5">UDISE: {row.udise_code || '—'}</p>
        </div>
      ),
    },
    {
      key: 'leave_type',
      header: 'Type',
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
      key: 'principal_status',
      header: 'HM Status',
      render: (value) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={value} />
          <span className="text-[10px] text-gray-400 text-center">Principal Layer</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'VTP Status',
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <StatusBadge status={value} />
          {row.leave_approved && (
            <div className="flex items-center justify-center gap-1 mt-0.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 px-2 py-0.5 border border-emerald-200 dark:from-emerald-900/30 dark:to-teal-900/30 dark:border-emerald-800 shadow-sm">
              <CheckCircle className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Finalized
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div className="flex flex-col gap-1.5 min-w-[100px]">
          {row.status === 'pending' && (
            <>
              <Button
                variant="success"
                size="sm"
                leftIcon={<CheckCircle className="h-3.5 w-3.5" />}
                onClick={() => checkBalanceBeforeApprove(row)}
                className="w-full"
              >
                Approve
              </Button>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<XCircle className="h-3.5 w-3.5" />}
                onClick={() => { setSelectedLeave(row); setIsRejectModalOpen(true); }}
                className="w-full"
              >
                Reject
              </Button>
            </>
          )}
          {row.status === 'approved' && !row.leave_approved && (
            <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/10 p-1.5 rounded border border-amber-100 text-center">
              Awaiting Principal
            </div>
          )}
          {row.leave_approved && (
            <Badge variant="success" outline size="sm" className="w-full justify-center">
              <CheckCircle className="h-3 w-3 mr-1 inline" /> Completed
            </Badge>
          )}
          {row.status === 'rejected' && (
            <Badge variant="danger" outline size="sm" className="w-full justify-center">
              <XCircle className="h-3 w-3 mr-1 inline" /> Rejected
            </Badge>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            VT Leave Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve leave requests for your organization's teachers
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={() => loadData()}
          loading={leaveLoading}
        >
          Refresh Data
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit shadow-inner">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'requests'
            ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
        >
          Leave Requests
        </button>
        <button
          onClick={() => setActiveTab('balances')}
          className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === 'balances'
            ? 'bg-white dark:bg-gray-700 text-indigo-600 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
        >
          <Wallet className="h-4 w-4" />
          VT Leave Balances
        </button>
      </div>

      {/* Requests Content */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <Card variant="elevated">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by teacher, school, or UDISE..."
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
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 min-w-[160px]"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </Card>

          <Card variant="elevated">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-indigo-500" />
                Requests Overview
              </h2>
              <Badge variant="primary" outline>
                {pagination.total} Total Records
              </Badge>
            </div>

            {leaveLoading ? (
              <div className="py-20">
                <Loader text="Fetching leave records..." />
              </div>
            ) : (
              <Table
                data={filteredLeaves}
                columns={columns}
                emptyState={
                  <div className="text-center py-16">
                    <div className="h-16 w-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarDays className="h-8 w-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">No leave requests found</p>
                    <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
                  </div>
                }
              />
            )}

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <Button
                  variant="ghost" size="sm"
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  {[...Array(pagination.total_pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${page === i + 1
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
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
        </div>
      )}

      {/* Balances Content */}
      {activeTab === 'balances' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="elevated" className="bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                  <Wallet className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Total VTs</p>
                  <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-200">{balanceSummary.totalTeachers || 0}</p>
                </div>
              </div>
            </Card>
            <Card variant="elevated" className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Healthy Balance (≥10)</p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">{balanceSummary.healthyBalance || 0}</p>
                </div>
              </div>
            </Card>
            <Card variant="elevated" className="bg-amber-50 dark:bg-amber-900/10 border-amber-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-amber-600 font-medium">Low Balance</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-200">{balanceSummary.lowBalance || 0}</p>
                </div>
              </div>
            </Card>
            <Card variant="elevated" className="bg-rose-50 dark:bg-rose-900/10 border-rose-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                  <Ban className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-rose-600 font-medium">Zero Balance</p>
                  <p className="text-2xl font-bold text-rose-900 dark:text-rose-200">{balanceSummary.zeroBalance || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card variant="elevated">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Teacher Leave Balances (EL - Earned Leave)</h2>
            {balanceLoading ? (
              <div className="py-20 text-center">
                <Loader text="Calculating balances..." />
              </div>
            ) : (
              <Table
                data={balances}
                columns={[
                  {
                    key: 'teacherName',
                    header: 'Teacher',
                    render: (value, row) => (
                      <div className="flex items-center gap-3 min-w-[160px]">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold flex-shrink-0">
                          {(value || row.vt_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{value || row.vt_name || '—'}</p>
                          <p className="text-xs text-gray-500">{row.trade || '—'}</p>
                          {row.phone && <p className="text-xs text-gray-400">{row.phone}</p>}
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'leaveStats',
                    header: 'Leave Requests',
                    render: (stats) => (
                      <div className="flex flex-col gap-1 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                            {stats?.pending || 0} Pending
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                            {stats?.approved || 0} Approved
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                            {stats?.rejected || 0} Rejected
                          </span>
                        </div>
                        {stats?.lastLeaveDate && (
                          <p className="text-xs text-gray-400">
                            Last: {fmtDate(stats.lastLeaveDate)}
                            {stats.lastLeaveType && ` (${stats.lastLeaveType})`}
                          </p>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'balance',
                    header: 'Available EL',
                    render: (bal) => {
                      const rem = parseFloat(bal?.remainingBalance || 0);
                      return (
                        <div className="text-center">
                          <p className={`text-2xl font-bold ${rem >= 10 ? 'text-emerald-600' : rem >= 5 ? 'text-amber-600' : 'text-rose-600'
                            }`}>{rem.toFixed(1)}</p>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">EL</p>
                        </div>
                      );
                    },
                  },
                  {
                    key: 'balance',
                    header: 'EL Breakdown',
                    render: (bal) => (
                      <div className="text-xs space-y-1 min-w-[140px]">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Opening:</span>
                          <span className="font-medium">{parseFloat(bal?.openingBalance || 0).toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Earned:</span>
                          <span className="font-medium text-emerald-600">+{parseFloat(bal?.totalEarned || 0).toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Used:</span>
                          <span className="font-medium text-rose-600">-{parseFloat(bal?.totalUsed || 0).toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-1">
                          <span className="text-gray-500">Closing:</span>
                          <span className="font-bold">{parseFloat(bal?.remainingBalance || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    ),
                  },
                ]}
                emptyState={
                  <div className="text-center py-16">
                    <Wallet className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500">No balance data available for your organization</p>
                  </div>
                }
              />
            )}
          </Card>
        </div>
      )}

      {/* ── Approve Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => { setIsApproveModalOpen(false); setSelectedLeave(null); }}
        title="Approve Leave"
        size="md"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <Button variant="ghost" onClick={() => { setIsApproveModalOpen(false); setSelectedLeave(null); }}>
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
          </div>
        }
      >
        <div className="space-y-5">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-start gap-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-200">Final Review</p>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-300/60">
                You are approving this leave request. If the school principal has already approved, the teacher will be notified immediately.
              </p>
            </div>
          </div>

          {selectedLeave && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500">Teacher</span>
                <span className="font-bold text-gray-900 dark:text-white">{selectedLeave.teacher_name}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500">Dates</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {fmtDate(selectedLeave.from_date)} - {fmtDate(selectedLeave.to_date)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Leave Type</span>
                <Badge variant="primary" size="sm">{selectedLeave.leave_type}</Badge>
              </div>

              {/* Balance Summary */}
              {selectedLeaveBalance && (
                <div className={`mt-4 p-4 rounded-xl ${selectedLeaveBalance.balanceCheck?.sufficient
                  ? 'bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-100/50 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300'
                  }`}>
                  <div className="flex items-center gap-2 mb-2 font-bold text-sm uppercase tracking-tight">
                    <Info className="h-4 w-4" />
                    Balance Verification
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span>Available EL: {selectedLeaveBalance.balanceCheck?.available?.toFixed(1)}</span>
                    <span>Cost: {selectedLeaveBalance.balanceCheck?.required?.toFixed(1)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* ── Reject Modal ──────────────────────────────────────────────────── */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => { setIsRejectModalOpen(false); setSelectedLeave(null); setRejectReason(''); }}
        title="Reject Leave"
        size="md"
        footer={
          <div className="flex gap-3 w-full justify-end">
            <Button variant="ghost" onClick={() => { setIsRejectModalOpen(false); setSelectedLeave(null); setRejectReason(''); }}>
              Close
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={actionLoading}
              disabled={!rejectReason.trim()}
              leftIcon={<XCircle className="h-4 w-4" />}
            >
              Submit Rejection
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-start gap-4">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
              <XCircle className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="font-semibold text-rose-900 dark:text-rose-200">Rejection Notice</p>
              <p className="text-sm text-rose-700/80 dark:text-rose-300/60">
                Please provide a valid reason for rejecting this leave request. This will be visible to the teacher.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
              Reason for Rejection <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Due to urgent training session, leave cannot be granted..."
              className="w-full h-32 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeaveManagement;
