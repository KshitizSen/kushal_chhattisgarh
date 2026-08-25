/* eslint-disable react-hooks/set-state-in-effect */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, Edit, Mail, Phone, Plus, Search, Trash2, UserCog, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import Table from '../../components/common/Table';
import api from '../../services/api';
import { createAdminVtp, deleteAdminVtp, getAdminVtpList, getAdminVtpOptions, updateAdminVtp } from '../../services/adminService';

const PAGE_SIZE_OPTIONS = [10, 15, 30, 50];
const EMPTY_FORM = { vtp_id: '', vtp_name: '', vc_name: '', mobile: '', email: '', status: 'active' };
const selectClass = 'w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300';
const displayValue = (value) => (value === null || value === undefined || value === '' ? 'N/A' : value);
const validate = (form) => {
  const errors = {};
  if (!form.vtp_id) errors.vtp_id = 'VTP provider is required';
  if (!form.vc_name.trim()) errors.vc_name = 'Coordinator name is required';
  if (!/^\d{10}$/.test(form.mobile.trim())) errors.mobile = 'Enter a valid 10-digit mobile number';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address';
  return errors;
};

const ManageVTP = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('');
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [vtpOptions, setVtpOptions] = useState([]);
  const [vtps, setVtps] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [formModal, setFormModal] = useState({ open: false, editing: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => setCurrentPage(1), [searchQuery, pageSize, selectedDistrict, selectedBlock, selectedCluster]);

  useEffect(() => {
    Promise.all([
      api.get('/reports/location-master', { params: { type: 'districts' } }),
      getAdminVtpOptions(),
    ]).then(([locations, options]) => {
      setDistricts(locations.data?.data || []);
      setVtpOptions(options.data || []);
    }).catch(() => toast.error('Failed to load VTP form options'));
  }, []);

  useEffect(() => {
    setSelectedBlock(''); setSelectedCluster(''); setClusters([]);
    if (!selectedDistrict) return setBlocks([]);
    api.get('/reports/location-master', { params: { type: 'blocks', district_cd: selectedDistrict } })
      .then((response) => setBlocks(response.data?.data || [])).catch(() => setBlocks([]));
  }, [selectedDistrict]);

  useEffect(() => {
    setSelectedCluster('');
    if (!selectedDistrict || !selectedBlock) return setClusters([]);
    api.get('/reports/location-master', { params: { type: 'clusters', district_cd: selectedDistrict, block_cd: selectedBlock } })
      .then((response) => setClusters(response.data?.data || [])).catch(() => setClusters([]));
  }, [selectedDistrict, selectedBlock]);

  const fetchVtps = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getAdminVtpList({ page: currentPage, limit: pageSize, search: searchQuery.trim(), district_cd: selectedDistrict, block_cd: selectedBlock, cluster_cd: selectedCluster });
      const totalPages = Math.max(1, result.total_pages || 1);
      if (currentPage > totalPages) return setCurrentPage(totalPages);
      setVtps(result.data || []);
      setPagination({ total: result.total || 0, totalPages });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load VTP list');
    } finally { setIsLoading(false); }
  }, [currentPage, pageSize, searchQuery, selectedDistrict, selectedBlock, selectedCluster]);

  useEffect(() => { fetchVtps(); }, [fetchVtps, reloadKey]);

  const closeForm = () => {
    if (isSaving) return;
    setFormModal({ open: false, editing: null }); setForm(EMPTY_FORM); setFormErrors({});
  };
  const openAdd = () => { setForm(EMPTY_FORM); setFormErrors({}); setFormModal({ open: true, editing: null }); };
  const openEdit = (vtp) => {
    setForm({ vtp_id: String(vtp.vtp_id || '').trim(), vtp_name: vtp.vtp_name || '', vc_name: vtp.vc_name || '', mobile: String(vtp.mobile || ''), email: vtp.email || '', status: vtp.status || 'active' });
    setFormErrors({}); setFormModal({ open: true, editing: vtp });
  };
  const changeForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: undefined }));
  };
  const changeProvider = (event) => {
    const vtpId = event.target.value;
    const option = vtpOptions.find((item) => item.vtp_id === vtpId);
    setForm((current) => ({ ...current, vtp_id: vtpId, vtp_name: option?.vtp_name || '' }));
    setFormErrors((current) => ({ ...current, vtp_id: undefined }));
  };

  const submitForm = async (event) => {
    event.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length) return setFormErrors(errors);
    try {
      setIsSaving(true);
      const payload = { ...form, vc_name: form.vc_name.trim(), mobile: form.mobile.trim(), email: form.email.trim().toLowerCase() };
      const result = formModal.editing ? await updateAdminVtp(formModal.editing.id, payload) : await createAdminVtp(payload);
      toast.success(result.message);
      setFormModal({ open: false, editing: null }); setForm(EMPTY_FORM); setFormErrors({});
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${formModal.editing ? 'update' : 'create'} VTP provider`);
    } finally { setIsSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const result = await deleteAdminVtp(deleteTarget.id);
      toast.success(result.message); setDeleteTarget(null); setReloadKey((key) => key + 1);
    } catch (error) { toast.error(error.response?.data?.message || 'Failed to delete VTP provider'); }
    finally { setIsDeleting(false); }
  };

  const activeCount = vtps.filter((vtp) => vtp.status === 'active').length;
  const inactiveCount = vtps.filter((vtp) => vtp.status === 'inactive').length;
  const columns = useMemo(() => [
    { key: 'serial', label: 'Sr. No.' }, { key: 'vtp_name', label: 'VTP Name' }, { key: 'vc_name', label: 'VC Name' },
    { key: 'mobile', label: 'Mobile' }, { key: 'email', label: 'Email' }, { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Action' },
  ], []);

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage VTP Providers</h1><p className="text-gray-600 dark:text-gray-400">Vocational coordinator and provider master list</p></div><Button leftIcon={<Plus className="h-4 w-4" />} onClick={openAdd}>Add VTP</Button></div>
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      <Card variant="filled" padding="md"><div className="flex items-center justify-between"><div><p className="text-lg text-gray-500 dark:text-gray-400">Total VC</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p></div><UserCog className="h-8 w-8 text-primary-500" /></div></Card>
      <Card variant="filled" padding="md"><div className="flex items-center justify-between"><div><p className="text-lg text-gray-500 dark:text-gray-400">Active on Page</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p></div><CheckCircle className="h-8 w-8 text-success-500" /></div></Card>
      <Card variant="filled" padding="md"><div className="flex items-center justify-between"><div><p className="text-lg text-gray-500 dark:text-gray-400">Inactive on Page</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{inactiveCount}</p></div><XCircle className="h-8 w-8 text-danger-500" /></div></Card>
    </div>
    <Card padding="md"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Input placeholder="Search VTP by provider, coordinator, mobile, or email..." leftIcon={<Search className="h-4 w-4" />} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} /><select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className={selectClass}>{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size} / page</option>)}</select></div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3"><select value={selectedDistrict} onChange={(event) => setSelectedDistrict(event.target.value)} className={selectClass}><option value="">All Districts</option>{districts.map((item) => <option key={item.district_cd} value={item.district_cd}>{item.district_name}</option>)}</select><select value={selectedBlock} onChange={(event) => setSelectedBlock(event.target.value)} disabled={!selectedDistrict} className={selectClass}><option value="">All Blocks</option>{blocks.map((item) => <option key={item.block_cd} value={item.block_cd}>{item.block_name}</option>)}</select><select value={selectedCluster} onChange={(event) => setSelectedCluster(event.target.value)} disabled={!selectedBlock} className={selectClass}><option value="">All Clusters</option>{clusters.map((item) => <option key={item.cluster_cd} value={item.cluster_cd}>{item.cluster_name}</option>)}</select></div>
    </Card>
    <Card padding="none">{isLoading ? <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading VTP providers...</div> : <Table columns={columns} data={vtps} renderRow={(vtp, index) => <tr key={vtp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="px-4 py-3 font-medium">{(currentPage - 1) * pageSize + index + 1}</td><td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{displayValue(vtp.vtp_name)}</td><td className="px-4 py-3">{displayValue(vtp.vc_name)}</td><td className="px-4 py-3"><span className="flex items-center"><Phone className="mr-2 h-4 w-4 text-gray-400" />{displayValue(vtp.mobile)}</span></td><td className="px-4 py-3"><span className="flex items-center"><Mail className="mr-2 h-4 w-4 text-gray-400" />{displayValue(vtp.email)}</span></td><td className="px-4 py-3"><Badge variant={vtp.status === 'active' ? 'success' : 'danger'} size="sm">{displayValue(vtp.status)}</Badge></td><td className="px-4 py-3"><div className="flex gap-2"><Button variant="ghost" size="sm" leftIcon={<Edit className="h-4 w-4" />} onClick={() => openEdit(vtp)}>Update</Button><Button variant="danger" size="sm" leftIcon={<Trash2 className="h-4 w-4" />} onClick={() => setDeleteTarget(vtp)}>Delete</Button></div></td>
    </tr>} />}</Card>
    <Pagination currentPage={currentPage} totalPages={pagination.totalPages} totalItems={pagination.total} pageSize={pageSize} onPageChange={setCurrentPage} />

    <Modal isOpen={formModal.open} onClose={closeForm} title={formModal.editing ? 'Update VTP Provider' : 'Add VTP Provider'} size="lg" closeOnOverlayClick={!isSaving} footer={<><Button variant="ghost" onClick={closeForm} disabled={isSaving}>Cancel</Button><Button type="submit" form="vtp-form" loading={isSaving}>{formModal.editing ? 'Update VTP' : 'Add VTP'}</Button></>}>
      <form id="vtp-form" onSubmit={submitForm} className="grid grid-cols-1 gap-5 sm:grid-cols-2"><div><label htmlFor="vtp_id" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">VTP Provider <span className="text-danger-500">*</span></label><select id="vtp_id" value={form.vtp_id} onChange={changeProvider} className={`${selectClass} ${formErrors.vtp_id ? 'border-danger-500' : ''}`} disabled={isSaving}><option value="">Select VTP provider</option>{vtpOptions.map((option) => <option key={option.vtp_id} value={option.vtp_id}>{option.vtp_id} - {option.vtp_name}</option>)}</select>{formErrors.vtp_id && <p className="mt-1 text-sm text-danger-500">{formErrors.vtp_id}</p>}</div>
        <Input label="VTP Name" value={form.vtp_name} disabled helperText="Filled from VTP master" /><Input label="VC/Coordinator Name" required value={form.vc_name} onChange={(event) => changeForm('vc_name', event.target.value)} error={formErrors.vc_name} maxLength={200} disabled={isSaving} /><Input label="Mobile Number" required type="tel" inputMode="numeric" value={form.mobile} onChange={(event) => changeForm('mobile', event.target.value.replace(/\D/g, '').slice(0, 10))} error={formErrors.mobile} maxLength={10} disabled={isSaving} /><Input label="Email" required type="email" value={form.email} onChange={(event) => changeForm('email', event.target.value)} error={formErrors.email} maxLength={200} disabled={isSaving} /><div><label htmlFor="vtp_status" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Status <span className="text-danger-500">*</span></label><select id="vtp_status" value={form.status} onChange={(event) => changeForm('status', event.target.value)} className={selectClass} disabled={isSaving}><option value="active">Active</option><option value="inactive">Inactive</option></select></div></form>
    </Modal>
    <Modal isOpen={Boolean(deleteTarget)} onClose={() => !isDeleting && setDeleteTarget(null)} title="Delete VTP Provider" size="sm" closeOnOverlayClick={!isDeleting} footer={<><Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button><Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} loading={isDeleting} onClick={confirmDelete}>Delete</Button></>}><p className="text-gray-700 dark:text-gray-300">Are you sure you want to delete <strong>{deleteTarget?.vc_name}</strong> from <strong>{deleteTarget?.vtp_name}</strong>? Their VTP login will also be deactivated.</p></Modal>
  </div>;
};

export default ManageVTP;
