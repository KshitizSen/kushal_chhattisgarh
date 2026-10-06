import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, MapPin, Search, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import Table from '../../components/common/Table';

const statuses = ['pending', 'approved', 'rejected', 'all'];
const text = (value) => value || '—';
const date = (value) => value ? new Date(value).toLocaleString('en-IN') : '—';
const Status = ({ value }) => {
  const styles = { pending: 'bg-amber-100 text-amber-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[value] || 'bg-gray-100 text-gray-700'}`}>{value}</span>;
};
const Location = ({ district, block, school, udise }) => <div className="min-w-52 space-y-0.5">
  <p className="font-medium">{text(school)}</p><p className="text-xs text-gray-500">UDISE: {text(String(udise || ''))}</p>
  <p className="text-xs text-gray-500">{text(block)}, {text(district)}</p>
</div>;

const VtUpdationApproval = () => {
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
  const [action, setAction] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/vt-updation-requests', { params: { status: filter, search: debouncedSearch || undefined, page, limit: 10 } });
      setRows(response.data?.data || []);
      setPagination(response.data?.pagination || { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
    } catch (error) { toast.error(error?.response?.data?.message || 'Unable to load VT updation requests.'); }
    finally { setLoading(false); }
  }, [filter, debouncedSearch, page]);

  useEffect(() => { const timer = setTimeout(() => { setPage(1); setDebouncedSearch(search.trim()); }, 350); return () => clearTimeout(timer); }, [search]);
  useEffect(() => {
    // Initial/server filter synchronization; subsequent updates are action-driven.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const submit = async () => {
    if (!action) return;
    setSaving(true);
    try {
      const response = await api.patch(`/admin/vt-updation-requests/${action.row.id}`, { status: action.status, remarks: remarks.trim() || null });
      toast.success(response.data?.message || `Request ${action.status}.`);
      setAction(null); setRemarks(''); await load();
    } catch (error) { toast.error(error?.response?.data?.message || 'Unable to review request.'); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'vt_name', header: 'VT Details', render: (value, row) => <div><p className="font-medium">{text(value)}</p><p className="text-xs font-medium text-primary-600">{text(row.teacher_code)}</p><p className="text-xs text-gray-500">{text(row.vt_email)}</p><p className="text-xs text-gray-500">VTP: {text(row.vtp_name)}</p></div> },
    { key: 'old_school_name', header: 'Current Location', render: (_, row) => <Location district={row.old_district_name} block={row.old_block_name} school={row.old_school_name} udise={row.old_udise_code} /> },
    { key: 'requested_school_name', header: 'Requested Location', render: (_, row) => <Location district={row.requested_district_name} block={row.requested_block_name} school={row.requested_school_name} udise={row.requested_udise_code} /> },
    { key: 'requested_at', header: 'Requested At', render: date },
    { key: 'status', header: 'Status', render: (value) => <Status value={value} /> },
    { key: 'actions', header: 'Actions', render: (_, row) => row.status === 'pending' ? <div className="flex gap-2 whitespace-nowrap">
      <Button size="sm" variant="success" leftIcon={<CheckCircle className="h-4 w-4" />} onClick={() => setAction({ row, status: 'approved' })}>Approve</Button>
      <Button size="sm" variant="danger" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => setAction({ row, status: 'rejected' })}>Reject</Button>
    </div> : <div className="max-w-48 text-xs text-gray-500"><p>{date(row.reviewed_at)}</p>{row.reviewer_remarks && <p className="mt-1">{row.reviewer_remarks}</p>}</div> },
  ];

  return <div className="space-y-6">
    <div><h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white"><MapPin className="h-6 w-6" />VT Updation Approval</h1>
      <p className="text-gray-600 dark:text-gray-400">Approve or reject VT district, block and School/UDISE changes.</p></div>
    <div className="flex w-fit gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">{statuses.map((status) => <button key={status}
      onClick={() => { setFilter(status); setPage(1); }} className={`rounded-lg px-5 py-2 text-sm font-medium capitalize ${filter === status ? 'bg-white text-primary-600 shadow-sm dark:bg-gray-700' : 'text-gray-600 dark:text-gray-300'}`}>{status}</button>)}</div>
    <Card variant="elevated">
      <div className="mb-4 flex items-center justify-between gap-3"><Input placeholder="Search VT, VTP, school or UDISE..." leftIcon={<Search className="h-4 w-4" />} value={search} onChange={(event) => setSearch(event.target.value)} />
        <span className="whitespace-nowrap text-sm text-gray-500">{pagination.totalItems} request{pagination.totalItems === 1 ? '' : 's'}</span></div>
      {loading && !rows.length ? <div className="py-12"><Loader text="Loading updation requests..." /></div> : <div className="overflow-x-auto"><Table data={rows} columns={columns} emptyState={<div className="py-12 text-center text-gray-500">No {filter === 'all' ? '' : filter} updation requests found</div>} /></div>}
      {pagination.totalItems > 0 && <div className="mt-5 border-t border-gray-200 pt-4 dark:border-gray-700"><Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} totalItems={pagination.totalItems} pageSize={pagination.pageSize} onPageChange={setPage} size="sm" /></div>}
    </Card>
    <Modal isOpen={Boolean(action)} onClose={() => !saving && setAction(null)} title={`${action?.status === 'approved' ? 'Approve' : 'Reject'} VT Updation`} size="md" closeOnOverlayClick={!saving}
      footer={<><Button variant="ghost" disabled={saving} onClick={() => setAction(null)}>Cancel</Button><Button variant={action?.status === 'approved' ? 'success' : 'danger'} loading={saving} onClick={submit}>{action?.status === 'approved' ? 'Approve Request' : 'Reject Request'}</Button></>}>
      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300"><p>Confirm <strong>{action?.status}</strong> for <strong>{action?.row?.vt_name}</strong>?</p>
        {action?.status === 'approved' && <p className="rounded-lg bg-amber-50 p-3 text-amber-800">The requested district, block and School/UDISE will become the VT's active location.</p>}
        <label className="block font-medium">Remarks (optional)<textarea autoFocus rows="4" maxLength="1000" value={remarks} onChange={(event) => setRemarks(event.target.value)} className="mt-2 w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800" /></label></div>
    </Modal>
  </div>;
};

export default VtUpdationApproval;
