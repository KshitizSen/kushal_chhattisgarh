import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, RefreshCw, Search, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import VtStaffFormModal from './VtStaffFormModal';

const display = (value) => value || '—';
const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB');
};

const VtStaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 1 });
  const [formModal, setFormModal] = useState({ open: false, mode: 'add', staffId: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/vtp/vt-staff', {
        params: { page: currentPage, limit: pageSize, search: debouncedSearch || undefined },
      });
      if (!response.data?.status) throw new Error(response.data?.message || 'Unable to load VT staff.');
      setStaff(response.data.data || []);
      const nextPagination = response.data.pagination || { currentPage, pageSize, totalItems: 0, totalPages: 1 };
      setPagination(nextPagination);
      if (nextPagination.currentPage !== currentPage) setCurrentPage(nextPagination.currentPage);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Unable to load VT staff.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    // Initial server synchronization; refreshes are handled explicitly by user actions.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStaff();
  }, [fetchStaff]);

  const displayStaff = staff.map((item, index) => ({
    ...item,
    serial: (pagination.currentPage - 1) * pagination.pageSize + index + 1,
  }));

  const closeForm = () => setFormModal({ open: false, mode: 'add', staffId: null });
  const handleSaved = () => { closeForm(); fetchStaff(); };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      const response = await api.delete(`/vtp/vt-staff/${deleteTarget.id}`);
      toast.success(response.data?.message || 'VT registration deleted successfully.');
      setDeleteTarget(null);
      if (staff.length === 1 && currentPage > 1) setCurrentPage((page) => page - 1);
      else fetchStaff();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to delete VT registration.');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    { key: 'serial', header: 'S.No.' },
    { key: 'vt_name', header: 'VT Name', render: display },
    { key: 'vt_email', header: 'Email', render: display },
    { key: 'vt_mob', header: 'Mobile', render: (value) => display(String(value || '')) },
    { key: 'dob', header: 'DOB', render: formatDate },
    { key: 'trade', header: 'Trade Name', render: display },
    { key: 'district_name', header: 'District', render: display },
    { key: 'block_name', header: 'Block', render: display },
    { key: 'cluster_name', header: 'Cluster', render: display },
    { key: 'school_name', header: 'School', render: (value, row) => <div><p>{display(value)}</p><p className="text-xs text-gray-500">UDISE: {display(row.udise_code)}</p></div> },
    { key: 'vtp_pan', header: 'PAN', render: display },
    { key: 'vt_aadhar', header: 'Aadhaar', render: (value) => display(String(value || '')) },
    {
      key: 'actions', header: 'Action', render: (_, row) => <div className="flex gap-2 whitespace-nowrap">
        <Button variant="secondary" size="sm" leftIcon={<Pencil className="h-4 w-4" />}
          onClick={() => setFormModal({ open: true, mode: 'edit', staffId: row.id })}>Update</Button>
        <Button variant="danger" size="sm" leftIcon={<Trash2 className="h-4 w-4" />}
          onClick={() => setDeleteTarget(row)}>Delete</Button>
      </div>,
    },
  ];

  if (loading && !staff.length) {
    return <div className="flex h-screen items-center justify-center"><Loader size="lg" text="Loading VT staff..." /></div>;
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VT's List</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage VT staff mapped to your VTP organization</p>
      </div>
      <div className="flex gap-2">
        <Button variant="success" leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setFormModal({ open: true, mode: 'add', staffId: null })}>Add</Button>
        <Button variant="primary" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={fetchStaff} loading={loading}>Refresh List</Button>
      </div>
    </div>

    <Card variant="elevated">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input placeholder="Search by name, mobile, trade, location, school or UDISE..." leftIcon={<Search className="h-4 w-4" />} value={search}
          onChange={(event) => setSearch(event.target.value)} />
        <div className="flex items-center gap-3 whitespace-nowrap text-sm text-gray-500">
          <span>{pagination.totalItems} record{pagination.totalItems === 1 ? '' : 's'}</span>
          <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            aria-label="Rows per page">
            {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size} rows</option>)}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table data={displayStaff} columns={columns} emptyState={<div className="py-12 text-center"><Users className="mx-auto mb-3 h-12 w-12 text-gray-300" /><p className="text-gray-500">No VT staff found</p></div>} />
      </div>
      {pagination.totalItems > 0 && <div className="mt-5 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} totalItems={pagination.totalItems}
          pageSize={pagination.pageSize} onPageChange={setCurrentPage} size="sm" />
      </div>}
    </Card>

    <VtStaffFormModal isOpen={formModal.open} mode={formModal.mode} staffId={formModal.staffId} onClose={closeForm} onSaved={handleSaved} />

    <Modal isOpen={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)} title="Delete VT" size="sm" closeOnOverlayClick={!deleting}
      footer={<><Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button><Button variant="danger" onClick={handleDelete} loading={deleting} leftIcon={<Trash2 className="h-4 w-4" />}>Delete</Button></>}>
      <p className="text-gray-700 dark:text-gray-300">Are you sure you want to delete <strong>{deleteTarget?.vt_name}</strong>? This action will only complete when no protected related records prevent deletion.</p>
    </Modal>
  </div>;
};

export default VtStaffList;
