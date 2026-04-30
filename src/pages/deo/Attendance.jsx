import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Filter,
  MapPin,
  RefreshCw,
  School,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const INITIAL_SCHOOLS = [
  {
    id: 1,
    name: 'GOVT HSS KAPADAH',
    udise: '22081301906',
    block: 'PANDARIYA',
    cluster: 'KAPADAH',
    reportStatus: 'pending',
    vts: [
      {
        id: 1,
        name: 'BHAGVATEE SAHU',
        trade: 'Apparel & Home Furnishing',
        phone: '8103741144',
        reportStatus: 'approved',
        reports: [
          { id: 101, month: 'Mar 2026', status: 'approved', submittedAt: '2026-03-28' },
          { id: 102, month: 'Apr 2026', status: 'pending', submittedAt: '2026-04-25' },
        ],
      },
      {
        id: 2,
        name: 'RAMESH KUMAR',
        trade: 'IT/ITeS',
        phone: '9876543210',
        reportStatus: 'pending',
        reports: [
          { id: 201, month: 'Mar 2026', status: 'approved', submittedAt: '2026-03-29' },
          { id: 202, month: 'Apr 2026', status: 'pending', submittedAt: '2026-04-26' },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'GOVT HS PANDARIYA',
    udise: '22081302001',
    block: 'PANDARIYA',
    cluster: 'PANDARIYA',
    reportStatus: 'approved',
    vts: [
      {
        id: 3,
        name: 'SUNITA DEVI',
        trade: 'Beauty & Wellness',
        phone: '7898765432',
        reportStatus: 'approved',
        reports: [
          { id: 301, month: 'Mar 2026', status: 'approved', submittedAt: '2026-03-27' },
          { id: 302, month: 'Apr 2026', status: 'approved', submittedAt: '2026-04-24' },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'GOVT HS LORMI',
    udise: '22081401503',
    block: 'LORMI',
    cluster: 'LORMI',
    reportStatus: 'rejected',
    vts: [
      {
        id: 4,
        name: 'AJAY SINGH',
        trade: 'Electronics',
        phone: '6234567890',
        reportStatus: 'rejected',
        reports: [
          { id: 401, month: 'Mar 2026', status: 'approved', submittedAt: '2026-03-30' },
          { id: 402, month: 'Apr 2026', status: 'rejected', submittedAt: '2026-04-22' },
        ],
      },
      {
        id: 5,
        name: 'PRIYA SHARMA',
        trade: 'Retail',
        phone: '9012345678',
        reportStatus: 'pending',
        reports: [
          { id: 501, month: 'Apr 2026', status: 'pending', submittedAt: '2026-04-27' },
        ],
      },
    ],
  },
  {
    id: 4,
    name: 'GOVT HSS SAHASPUR',
    udise: '22081501201',
    block: 'SAHASPUR',
    cluster: 'SAHASPUR',
    reportStatus: 'pending',
    vts: [
      {
        id: 6,
        name: 'DEEPAK VERMA',
        trade: 'Agriculture',
        phone: '8765432109',
        reportStatus: 'pending',
        reports: [
          { id: 601, month: 'Apr 2026', status: 'pending', submittedAt: '2026-04-28' },
        ],
      },
    ],
  },
];

const STATUS = {
  pending: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
  approved: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  rejected: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
};

const StatusPill = ({ status }) => {
  const config = STATUS[status] || STATUS.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <span className="capitalize">{status}</span>
    </span>
  );
};

const ActionIcon = ({ icon: Icon, label, onClick, variant = 'default' }) => {
  const color = {
    default: 'text-gray-500 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-800',
    approve: 'text-gray-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20',
    reject: 'text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20',
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`rounded-lg p-2 transition-colors ${color}`}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};

const Attendance = () => {
  const [schools, setSchools] = useState(INITIAL_SCHOOLS);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [expandedSchool, setExpandedSchool] = useState(null);
  const [reportsModal, setReportsModal] = useState({ open: false, vt: null });
  const [previewModal, setPreviewModal] = useState({ open: false, vt: null, report: null });
  const [actionModal, setActionModal] = useState({ open: false, type: null, target: null, level: null });
  const [reason, setReason] = useState('');

  const counts = useMemo(() => {
    const summary = { total: schools.length, vts: 0, pending: 0, approved: 0, rejected: 0 };
    schools.forEach((school) => {
      summary[school.reportStatus] += 1;
      summary.vts += school.vts.length;
    });
    return summary;
  }, [schools]);

  const filteredSchools = useMemo(() => {
    const query = search.trim().toLowerCase();
    return schools.filter((school) => {
      const matchesSearch =
        !query ||
        school.name.toLowerCase().includes(query) ||
        school.udise.includes(query) ||
        school.block.toLowerCase().includes(query) ||
        school.vts.some((vt) => vt.name.toLowerCase().includes(query) || vt.trade.toLowerCase().includes(query));
      const matchesStatus = !filter || school.reportStatus === filter;
      return matchesSearch && matchesStatus;
    });
  }, [schools, search, filter]);

  const updateSchoolAndTeachers = (schoolId, status) => {
    setSchools((prev) =>
      prev.map((school) =>
        school.id === schoolId
          ? {
              ...school,
              reportStatus: status,
              vts: school.vts.map((vt) => ({ ...vt, reportStatus: status })),
            }
          : school
      )
    );
  };

  const updateTeacher = (teacherId, status) => {
    setSchools((prev) =>
      prev.map((school) => ({
        ...school,
        vts: school.vts.map((vt) => (vt.id === teacherId ? { ...vt, reportStatus: status } : vt)),
      }))
    );
  };

  const handleAction = (status) => {
    const { target, level } = actionModal;
    if (level === 'school') {
      updateSchoolAndTeachers(target.id, status);
    }
    if (level === 'vt') {
      updateTeacher(target.id, status);
    }
    setActionModal({ open: false, type: null, target: null, level: null });
    setReason('');
  };

  const openAction = (type, target, level) => {
    setActionModal({ open: true, type, target, level });
  };

  const openReports = (vt) => {
    setReportsModal({ open: true, vt });
  };

  const closeReports = () => {
    setReportsModal({ open: false, vt: null });
  };

  const openPreview = (vt, report) => {
    setPreviewModal({ open: true, vt, report });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">Attendance</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review school-wise VT reports and attendance approvals
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {[
          { label: 'Total Schools', value: counts.total, Icon: School, bg: 'bg-blue-500', status: '' },
          { label: 'Total VTs', value: counts.vts, Icon: Users, bg: 'bg-indigo-500', status: '' },
          { label: 'Pending', value: counts.pending, Icon: AlertCircle, bg: 'bg-yellow-500', status: 'pending' },
          { label: 'Approved', value: counts.approved, Icon: CheckCircle, bg: 'bg-green-500', status: 'approved' },
          { label: 'Rejected', value: counts.rejected, Icon: XCircle, bg: 'bg-red-500', status: 'rejected' },
        ].map(({ label, value, Icon, bg, status }) => (
          <button
            key={label}
            type="button"
            onClick={() => setFilter(filter === status ? '' : status)}
            className={`flex items-center gap-3 rounded-[1.5rem] border bg-white p-4 text-left transition-all dark:bg-gray-900 ${
              filter === status && status
                ? 'border-primary-400 ring-2 ring-primary-100 dark:ring-primary-900/40'
                : 'border-gray-200 hover:shadow-sm dark:border-gray-800'
            }`}
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white ${bg}`}>
              <Icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-2xl font-bold leading-none text-gray-900 dark:text-white">{value}</span>
              <span className="mt-1 block text-xs text-gray-500">{label}</span>
            </span>
          </button>
        ))}
      </div>

      {counts.pending > 0 && (
        <div className="flex items-center gap-3 rounded-[1.5rem] border border-yellow-200 bg-yellow-50 px-5 py-4 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            <span className="font-semibold">{counts.pending}</span> school reports awaiting your review.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by school, UDISE, block, teacher or trade..."
            className="w-full rounded-[1.25rem] border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 transition focus:border-transparent focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="hidden h-5 w-5 text-gray-400 sm:block" />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-[1.25rem] border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        {filteredSchools.length === 0 ? (
          <div className="py-12 text-center">
            <School className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px]">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">School</th>
                  <th className="w-[170px] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">UDISE</th>
                  <th className="w-[150px] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Block</th>
                  <th className="w-[190px] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchools.map((school, index) => (
                  <React.Fragment key={school.id}>
                    <tr
                      onClick={() => setExpandedSchool(expandedSchool === school.id ? null : school.id)}
                      className={`cursor-pointer border-b border-gray-100 transition hover:bg-blue-50/60 dark:border-gray-800 dark:hover:bg-blue-900/10 ${
                        index % 2 === 1 ? 'bg-gray-50/60 dark:bg-gray-800/30' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                            <School className="h-5 w-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{school.name}</span>
                            <span className="text-xs text-gray-500">{school.vts.length} VT{school.vts.length === 1 ? '' : 's'}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">{school.udise}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3.5 w-3.5" />
                          {school.block}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center justify-between gap-3">
                          <StatusPill status={school.reportStatus} />
                          <ChevronDown className={`h-4 w-4 text-gray-400 transition ${expandedSchool === school.id ? 'rotate-180' : ''}`} />
                        </span>
                      </td>
                    </tr>

                    {expandedSchool === school.id && (
                      <tr>
                        <td colSpan={4} className="border-b border-gray-100 bg-gray-50/70 px-5 pb-5 pt-4 dark:border-gray-800 dark:bg-gray-950/30">
                  <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Vocational Teachers</h2>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        leftIcon={<CheckCircle className="h-4 w-4" />}
                        onClick={() => openAction('approve', school, 'school')}
                      >
                        Approve All
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<XCircle className="h-4 w-4" />}
                        onClick={() => openAction('reject', school, 'school')}
                      >
                        Reject All
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[1.25rem] border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
                    {school.vts.map((vt) => (
                      <div
                        key={vt.id}
                        className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0 dark:border-gray-800 sm:flex-row sm:items-center"
                      >
                        <div className="flex flex-1 items-center gap-3">
                          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {vt.name.charAt(0)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{vt.name}</span>
                            <span className="block truncate text-xs text-gray-500">{vt.trade} | {vt.phone}</span>
                          </span>
                        </div>
                        <StatusPill status={vt.reportStatus} />
                        <div className="flex items-center gap-1">
                          <ActionIcon icon={FileText} label="Reports" onClick={() => openReports(vt)} />
                          <ActionIcon icon={Eye} label="View" onClick={() => openPreview(vt, vt.reports[0])} />
                          <ActionIcon icon={Download} label="Download" onClick={() => {}} />
                          <ActionIcon icon={CheckCircle} label="Approve" variant="approve" onClick={() => openAction('approve', vt, 'vt')} />
                          <ActionIcon icon={XCircle} label="Reject" variant="reject" onClick={() => openAction('reject', vt, 'vt')} />
                        </div>
                      </div>
                    ))}
                  </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={reportsModal.open} onClose={closeReports} title="Teacher Reports" size="lg">
        {reportsModal.vt && (
          <div className="space-y-4">
            <div className="rounded-[1.25rem] bg-gray-50 p-4 dark:bg-gray-800/60">
              <p className="font-semibold text-gray-900 dark:text-white">{reportsModal.vt.name}</p>
              <p className="text-sm text-gray-500">{reportsModal.vt.trade} | {reportsModal.vt.phone}</p>
            </div>

            <div className="overflow-hidden rounded-[1.25rem] border border-gray-200 dark:border-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px]">
                  <thead className="bg-gray-50 dark:bg-gray-950">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Month</th>
                      <th className="w-[150px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Submitted</th>
                      <th className="w-[150px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Status</th>
                      <th className="w-[130px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsModal.vt.reports.map((report) => (
                      <tr key={report.id} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                            <FileText className="h-4 w-4 text-gray-400" />
                            {report.month}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{report.submittedAt}</td>
                        <td className="px-4 py-3">
                          <StatusPill status={report.status} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1">
                            <ActionIcon icon={Eye} label="View report" onClick={() => openPreview(reportsModal.vt, report)} />
                            <ActionIcon icon={Download} label="Download report" onClick={() => {}} />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={previewModal.open}
        onClose={() => setPreviewModal({ open: false, vt: null, report: null })}
        title="Report Preview"
        size="md"
      >
        {previewModal.vt && previewModal.report && (
          <div className="space-y-4">
            <div className="grid gap-3 rounded-[1.25rem] bg-gray-50 p-4 text-sm dark:bg-gray-800/60 sm:grid-cols-2">
              <div>
                <span className="text-gray-500">Teacher</span>
                <p className="font-medium text-gray-900 dark:text-white">{previewModal.vt.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Trade</span>
                <p className="font-medium text-gray-900 dark:text-white">{previewModal.vt.trade}</p>
              </div>
              <div>
                <span className="text-gray-500">Month</span>
                <p className="font-medium text-gray-900 dark:text-white">{previewModal.report.month}</p>
              </div>
              <div>
                <span className="text-gray-500">Status</span>
                <div className="mt-1">
                  <StatusPill status={previewModal.report.status} />
                </div>
              </div>
            </div>
            <div className="rounded-[1.25rem] border-2 border-dashed border-gray-200 p-8 text-center text-sm text-gray-400 dark:border-gray-700">
              <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
              Report preview will render here after API integration.
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={actionModal.open}
        onClose={() => {
          setActionModal({ open: false, type: null, target: null, level: null });
          setReason('');
        }}
        title={actionModal.type === 'approve' ? 'Approve Report' : 'Reject Report'}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setActionModal({ open: false, type: null, target: null, level: null });
                setReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant={actionModal.type === 'approve' ? 'success' : 'danger'}
              disabled={actionModal.type === 'reject' && !reason.trim()}
              leftIcon={actionModal.type === 'approve' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              onClick={() => handleAction(actionModal.type === 'approve' ? 'approved' : 'rejected')}
            >
              {actionModal.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className={`flex items-center gap-3 rounded-[1.25rem] p-4 ${actionModal.type === 'approve' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            {actionModal.type === 'approve' ? (
              <CheckCircle className="h-8 w-8 flex-shrink-0 text-green-500" />
            ) : (
              <AlertCircle className="h-8 w-8 flex-shrink-0 text-red-500" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {actionModal.type === 'approve' ? 'Approve' : 'Reject'} this report?
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {actionModal.level === 'school' ? 'School' : 'Teacher'}: <strong>{actionModal.target?.name}</strong>
              </p>
            </div>
          </div>
          {actionModal.type === 'reject' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Provide a reason for rejection..."
                rows={3}
                className="w-full resize-none rounded-[1.25rem] border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Attendance;
