import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  School, Users, Search, ChevronDown, FileText,
  CheckCircle, XCircle, Clock, AlertCircle, Download, Eye,
  Filter, RefreshCw, MapPin,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_SCHOOLS = [
  {
    id: 1, name: 'GOVT HSS KAPADAH', udise: '22081301906',
    block: 'PANDARIYA', cluster: 'KAPADAH', reportStatus: 'pending',
    vts: [
      { id: 1, name: 'BHAGVATEE', trade: 'Apparel & Home Furnishing', phone: '8103741144', reportStatus: 'approved', reports: [
        { month: 'Mar 2026', status: 'approved', submittedAt: '2026-03-28' },
        { month: 'Apr 2026', status: 'pending', submittedAt: '2026-04-25' },
      ]},
      { id: 2, name: 'RAMESH KUMAR', trade: 'IT/ITeS', phone: '9876543210', reportStatus: 'pending', reports: [
        { month: 'Mar 2026', status: 'approved', submittedAt: '2026-03-29' },
        { month: 'Apr 2026', status: 'pending', submittedAt: '2026-04-26' },
      ]},
    ],
  },
  {
    id: 2, name: 'GOVT HS PANDARIYA', udise: '22081302001',
    block: 'PANDARIYA', cluster: 'PANDARIYA', reportStatus: 'approved',
    vts: [
      { id: 3, name: 'SUNITA DEVI', trade: 'Beauty & Wellness', phone: '7898765432', reportStatus: 'approved', reports: [
        { month: 'Mar 2026', status: 'approved', submittedAt: '2026-03-27' },
        { month: 'Apr 2026', status: 'approved', submittedAt: '2026-04-24' },
      ]},
    ],
  },
  {
    id: 3, name: 'GOVT HS LORMI', udise: '22081401503',
    block: 'LORMI', cluster: 'LORMI', reportStatus: 'rejected',
    vts: [
      { id: 4, name: 'AJAY SINGH', trade: 'Electronics', phone: '6234567890', reportStatus: 'rejected', reports: [
        { month: 'Mar 2026', status: 'approved', submittedAt: '2026-03-30' },
        { month: 'Apr 2026', status: 'rejected', submittedAt: '2026-04-22' },
      ]},
      { id: 5, name: 'PRIYA SHARMA', trade: 'Retail', phone: '9012345678', reportStatus: 'pending', reports: [
        { month: 'Apr 2026', status: 'pending', submittedAt: '2026-04-27' },
      ]},
    ],
  },
  {
    id: 4, name: 'GOVT HSS SAHASPUR', udise: '22081501201',
    block: 'SAHASPUR', cluster: 'SAHASPUR', reportStatus: 'pending',
    vts: [
      { id: 6, name: 'DEEPAK VERMA', trade: 'Agriculture', phone: '8765432109', reportStatus: 'pending', reports: [
        { month: 'Apr 2026', status: 'pending', submittedAt: '2026-04-28' },
      ]},
    ],
  },
];

// ── Status UI helper ──────────────────────────────────────────────────────────
const STATUS = {
  pending:  { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
  approved: { bg: 'bg-green-50 dark:bg-green-900/20',   text: 'text-green-700 dark:text-green-300',   dot: 'bg-green-500' },
  rejected: { bg: 'bg-red-50 dark:bg-red-900/20',       text: 'text-red-700 dark:text-red-300',       dot: 'bg-red-500' },
};

const StatusPill = ({ status }) => {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      <span className="capitalize">{status}</span>
    </span>
  );
};

// ── Action icon button (36px min touch target) ────────────────────────────────
const ActionIcon = ({ icon: Icon, label, onClick, variant = 'default' }) => {
  const colors = {
    default: 'text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700',
    approve: 'text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
    reject:  'text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20',
  };
  return (
    <button onClick={onClick} title={label}
      className={`p-1.5 rounded-lg transition-colors ${colors[variant]}`}>
      <Icon className="h-4 w-4" />
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
const DeoDashboard = () => {
  const [schools, setSchools]         = useState(MOCK_SCHOOLS);
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState('');
  const [expanded, setExpanded]       = useState(null);
  const [reportModal, setReportModal] = useState({ open: false, vt: null, report: null });
  const [actionModal, setActionModal] = useState({ open: false, type: null, target: null, level: null });
  const [reason, setReason]           = useState('');

  // Counts
  const counts = useMemo(() => {
    const c = { total: schools.length, vts: 0, pending: 0, approved: 0, rejected: 0 };
    schools.forEach(s => { c[s.reportStatus]++; c.vts += s.vts.length; });
    return c;
  }, [schools]);

  // Filtered
  const list = useMemo(() => {
    const q = search.toLowerCase();
    return schools.filter(s =>
      (s.name.toLowerCase().includes(q) || s.udise.includes(q)) &&
      (!filter || s.reportStatus === filter)
    );
  }, [schools, search, filter]);

  // Approval handler
  const handleAction = (status) => {
    const { target, level } = actionModal;
    setSchools(prev => prev.map(s => {
      if (level === 'school' && s.id === target.id) return { ...s, reportStatus: status };
      if (level === 'vt') return { ...s, vts: s.vts.map(v => v.id === target.id ? { ...v, reportStatus: status } : v) };
      return s;
    }));
    setActionModal({ open: false, type: null, target: null, level: null });
    setReason('');
  };

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">DEO Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Monitor schools, review VT reports & manage approvals</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>Refresh</Button>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Schools', value: counts.total,    Icon: School,      bg: 'bg-blue-500',   f: '' },
          { label: 'Total VTs',     value: counts.vts,      Icon: Users,       bg: 'bg-indigo-500', f: '' },
          { label: 'Pending',       value: counts.pending,  Icon: Clock,       bg: 'bg-yellow-500', f: 'pending' },
          { label: 'Approved',      value: counts.approved, Icon: CheckCircle, bg: 'bg-green-500',  f: 'approved' },
          { label: 'Rejected',      value: counts.rejected, Icon: XCircle,     bg: 'bg-red-500',    f: 'rejected' },
        ].map(({ label, value, Icon, bg, f }) => (
          <button key={label} onClick={() => setFilter(filter === f ? '' : f)}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left
              ${filter === f && f
                ? 'border-primary-400 ring-2 ring-primary-200 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:shadow-sm'}`}>
            <div className={`p-2 rounded-xl ${bg} text-white flex-shrink-0`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Pending Alert ──────────────────────────────────────────────── */}
      {counts.pending > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <span className="font-semibold">{counts.pending}</span> school report{counts.pending > 1 ? 's' : ''} awaiting your review.
          </p>
        </motion.div>
      )}

      {/* ── Search & Filter ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by school name or UDISE code..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400 hidden sm:block" />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          {filter && (
            <button onClick={() => setFilter('')} className="text-xs text-primary-600 hover:underline whitespace-nowrap">Clear</button>
          )}
        </div>
      </div>

      {/* ── School List ────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
        {/* Column header */}
        <div className="hidden sm:grid grid-cols-[1fr_140px_110px_100px_32px] px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span>School</span><span>UDISE</span><span>Block</span><span>Status</span><span />
        </div>

        {list.length === 0 ? (
          <div className="py-12 text-center">
            <School className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No schools found matching your criteria</p>
          </div>
        ) : (
          list.map((school, idx) => (
            <div key={school.id}
              className={`border-b border-gray-100 dark:border-gray-800 last:border-0 ${idx % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-800/20' : ''}`}>

              {/* School row */}
              <button onClick={() => setExpanded(expanded === school.id ? null : school.id)}
                className="w-full grid grid-cols-1 sm:grid-cols-[1fr_140px_110px_100px_32px] items-center px-4 py-3 text-left hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors gap-y-1">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex-shrink-0">
                    <School className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-snug">{school.name}</p>
                    <p className="text-xs text-gray-400 leading-snug">{school.vts.length} VT{school.vts.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">{school.udise}</span>
                <span className="text-xs text-gray-500 hidden sm:flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{school.block}
                </span>
                <StatusPill status={school.reportStatus} />
                <motion.div animate={{ rotate: expanded === school.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </motion.div>
              </button>

              {/* Expanded content */}
              <AnimatePresence initial={false}>
                {expanded === school.id && (
                  <motion.div key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden">
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                      {/* School-level actions */}
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vocational Teachers</h4>
                        {school.reportStatus === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => setActionModal({ open: true, type: 'approve', target: school, level: 'school' })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-900/30 transition-colors">
                              <CheckCircle className="h-3.5 w-3.5" /> Approve All
                            </button>
                            <button onClick={() => setActionModal({ open: true, type: 'reject', target: school, level: 'school' })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-300 dark:bg-red-900/30 transition-colors">
                              <XCircle className="h-3.5 w-3.5" /> Reject All
                            </button>
                          </div>
                        )}
                      </div>

                      {/* VT list */}
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                        {school.vts.map(vt => (
                          <VTRow key={vt.id} vt={vt}
                            onView={r => setReportModal({ open: true, vt, report: r })}
                            onApprove={() => setActionModal({ open: true, type: 'approve', target: vt, level: 'vt' })}
                            onReject={() => setActionModal({ open: true, type: 'reject', target: vt, level: 'vt' })} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* ── Report Viewer Modal ─────────────────────────────────────────── */}
      <Modal isOpen={reportModal.open} onClose={() => setReportModal({ open: false, vt: null, report: null })}
        title="Report Preview" size="md">
        {reportModal.vt && reportModal.report && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div><span className="text-gray-500">Teacher:</span> <span className="font-medium">{reportModal.vt.name}</span></div>
              <div><span className="text-gray-500">Trade:</span> <span className="font-medium">{reportModal.vt.trade}</span></div>
              <div><span className="text-gray-500">Month:</span> <span className="font-medium">{reportModal.report.month}</span></div>
              <div><span className="text-gray-500">Status:</span> <StatusPill status={reportModal.report.status} /></div>
            </div>
            <div className="p-5 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center text-gray-400 text-sm max-h-72 overflow-y-auto">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>Report preview — connect API for real data</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" leftIcon={<Download className="h-4 w-4" />}>PDF</Button>
              <Button variant="ghost" size="sm" leftIcon={<Download className="h-4 w-4" />}>Excel</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Action Modal ────────────────────────────────────────────────── */}
      <Modal isOpen={actionModal.open}
        onClose={() => { setActionModal({ open: false, type: null, target: null, level: null }); setReason(''); }}
        title={actionModal.type === 'approve' ? 'Approve Report' : 'Reject Report'} size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setActionModal({ open: false, type: null, target: null, level: null }); setReason(''); }}>Cancel</Button>
            <Button variant={actionModal.type === 'approve' ? 'success' : 'danger'}
              disabled={actionModal.type === 'reject' && !reason.trim()}
              leftIcon={actionModal.type === 'approve' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              onClick={() => handleAction(actionModal.type === 'approve' ? 'approved' : 'rejected')}>
              {actionModal.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </>
        }>
        <div className="space-y-4">
          <div className={`flex items-center gap-3 p-4 rounded-xl ${actionModal.type === 'approve' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            {actionModal.type === 'approve'
              ? <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
              : <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0" />}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {actionModal.type === 'approve' ? 'Approve' : 'Reject'} this report?
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {actionModal.level === 'school' ? 'School' : 'Teacher'}: <strong>{actionModal.target?.name}</strong>
              </p>
            </div>
          </div>
          {actionModal.type === 'reject' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Provide a reason for rejection..." rows={3}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500" />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// VT ROW — balanced density with inline report expansion
// ═══════════════════════════════════════════════════════════════════════════════
const VTRow = ({ vt, onView, onApprove, onReject }) => {
  const [showReports, setShowReports] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Teacher row */}
      <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
          {vt.name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug truncate">{vt.name}</p>
          <p className="text-xs text-gray-400 leading-snug truncate">{vt.trade} · {vt.phone}</p>
        </div>

        {/* Status */}
        <StatusPill status={vt.reportStatus} />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <ActionIcon icon={FileText} label="Toggle reports" onClick={() => setShowReports(!showReports)} />
          {vt.reportStatus === 'pending' && (
            <>
              <ActionIcon icon={CheckCircle} label="Approve" onClick={onApprove} variant="approve" />
              <ActionIcon icon={XCircle} label="Reject" onClick={onReject} variant="reject" />
            </>
          )}
        </div>
      </div>

      {/* Inline report sub-rows */}
      <AnimatePresence>
        {showReports && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-800 bg-gray-50/60 dark:bg-gray-800/30">
              {vt.reports.map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 pl-14">
                  <FileText className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{r.month}</span>
                  <span className="text-xs text-gray-400">{r.submittedAt}</span>
                  <StatusPill status={r.status} />
                  <ActionIcon icon={Eye} label="View report" onClick={() => onView(r)} />
                  <ActionIcon icon={Download} label="Download" onClick={() => {}} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeoDashboard;
