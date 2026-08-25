/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Search, UserCheck, MapPin, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Card from '../../components/common/Card';
import Pagination from '../../components/common/Pagination';
import api from '../../services/api';
import { getAdminDeoList, updateAdminDeo } from '../../services/adminService';
import { getSerialNumber } from '../../utils/paginationUtils';

const PAGE_SIZE_OPTIONS = [10, 15, 30, 50];
const EMPTY_FORM = { deo_name: '', email: '', mobile: '' };
const displayValue = (value) => (value === null || value === undefined || value === '' ? 'N/A' : value);

const validateDeoForm = (form) => {
  const errors = {};
  if (!form.deo_name.trim()) errors.deo_name = 'DEO name is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address';
  if (!/^\d{10}$/.test(form.mobile.trim())) errors.mobile = 'Enter a valid 10-digit mobile number';
  return errors;
};

const ManageDEO = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('');
  const [districts, setDistricts] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [deos, setDeos] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [editingDeo, setEditingDeo] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize, selectedDistrict, selectedBlock, selectedCluster]);

  useEffect(() => {
    api.get('/reports/location-master', { params: { type: 'districts' } })
      .then((response) => setDistricts(response.data?.data || []))
      .catch(() => setDistricts([]));
  }, []);

  useEffect(() => {
    if (!selectedDistrict) {
      setBlocks([]);
      setSelectedBlock('');
      setClusters([]);
      setSelectedCluster('');
      return;
    }

    api.get('/reports/location-master', { params: { type: 'blocks', district_cd: selectedDistrict } })
      .then((response) => setBlocks(response.data?.data || []))
      .catch(() => setBlocks([]));

    setSelectedBlock('');
    setClusters([]);
    setSelectedCluster('');
  }, [selectedDistrict]);

  useEffect(() => {
    if (!selectedDistrict || !selectedBlock) {
      setClusters([]);
      setSelectedCluster('');
      return;
    }

    api.get('/reports/location-master', {
      params: { type: 'clusters', district_cd: selectedDistrict, block_cd: selectedBlock },
    })
      .then((response) => setClusters(response.data?.data || []))
      .catch(() => setClusters([]));

    setSelectedCluster('');
  }, [selectedDistrict, selectedBlock]);

  useEffect(() => {
    const fetchDeos = async () => {
      try {
        setIsLoading(true);
        const result = await getAdminDeoList({
          page: currentPage,
          limit: pageSize,
          search: searchQuery,
          district_cd: selectedDistrict,
          block_cd: selectedBlock,
          cluster_cd: selectedCluster,
        });

        setDeos(result.data || []);
        setPagination({
          total: result.total || 0,
          totalPages: result.total_pages || 1,
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load DEO list');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeos();
  }, [currentPage, pageSize, searchQuery, selectedDistrict, selectedBlock, selectedCluster, reloadKey]);

  const openUpdateModal = (deo) => {
    setEditingDeo(deo);
    setForm({
      deo_name: deo.deo_name || '',
      email: deo.email || '',
      mobile: String(deo.mobile || ''),
    });
    setFormErrors({});
  };

  const closeUpdateModal = () => {
    if (isSaving) return;
    setEditingDeo(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const updateFormField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    const errors = validateDeoForm(form);
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSaving(true);
      const result = await updateAdminDeo(editingDeo.id, {
        deo_name: form.deo_name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.trim(),
      });
      toast.success(result.message);
      setEditingDeo(null);
      setForm(EMPTY_FORM);
      setFormErrors({});
      setReloadKey((key) => key + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update DEO details');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = useMemo(() => [
    { key: 'deo_name', label: 'Se no' },
    { key: 'district_name', label: 'District' },
    { key: 'deo_name', label: 'DEO Name' },
    // { key: 'designation', label: 'Designation' },
    { key: 'mobile', label: 'Mobile' },
    { key: 'alternate_mobile', label: 'Alternate Mobile' },
    { key: 'email', label: 'Email' },
    { key: 'actions', label: 'Action' },
  ], []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage DEO</h1>
          <p className="text-gray-600 dark:text-gray-400">District education officer master list</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg text-gray-500 dark:text-gray-400">Total DEO</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
            </div>
            <UserCheck className="h-8 w-8 text-primary-500" />
          </div>
        </Card>
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg text-gray-500 dark:text-gray-400">Current Page</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentPage}</p>
            </div>
            <MapPin className="h-8 w-8 text-accent-500" />
          </div>
        </Card>
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg text-gray-500 dark:text-gray-400">Page Size</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{pageSize}</p>
            </div>
            <Phone className="h-8 w-8 text-success-500" />
          </div>
        </Card>
      </div>

      <Card padding="md">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            placeholder="Search by DEO name, district, designation, mobile, or email..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <select
            value={selectedDistrict}
            onChange={(event) => setSelectedDistrict(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="">All Districts</option>
            {districts.map((district) => (
              <option key={district.district_cd} value={district.district_cd}>{district.district_name}</option>
            ))}
          </select>
          <select
            value={selectedBlock}
            onChange={(event) => setSelectedBlock(event.target.value)}
            disabled={!selectedDistrict}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="">All Blocks</option>
            {blocks.map((block) => (
              <option key={block.block_cd} value={block.block_cd}>{block.block_name}</option>
            ))}
          </select>
          <select
            value={selectedCluster}
            onChange={(event) => setSelectedCluster(event.target.value)}
            disabled={!selectedBlock}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="">All Clusters</option>
            {clusters.map((cluster) => (
              <option key={cluster.cluster_cd} value={cluster.cluster_cd}>{cluster.cluster_name}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card padding="none">
        {isLoading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">Loading DEO list...</div>
        ) : (
          <Table
            columns={columns}
            data={deos}
            renderRow={(deo, index) => (
              <tr key={deo.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 dark:text-white">{getSerialNumber(index, currentPage, pageSize)}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{displayValue(deo.district_name)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Code: {displayValue(deo.district_cd)}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 dark:text-white">{displayValue(deo.deo_name)}</p>
                </td>
                {/* <td className="px-4 py-3">{displayValue(deo.designation)}</td> */}
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <Phone className="mr-2 h-4 w-4 text-gray-400" />
                    {displayValue(deo.mobile)}
                  </div>
                </td>
                <td className="px-4 py-3">{displayValue(deo.alternate_mobile)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-gray-400" />
                    {displayValue(deo.email)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Edit className="h-4 w-4" />}
                    onClick={() => openUpdateModal(deo)}
                  >
                    Update
                  </Button>
                </td>
              </tr>
            )}
          />
        )}
      </Card>

      <Pagination
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      <Modal
        isOpen={Boolean(editingDeo)}
        onClose={closeUpdateModal}
        title="Update DEO Details"
        size="md"
        closeOnOverlayClick={!isSaving}
        footer={(
          <>
            <Button variant="ghost" onClick={closeUpdateModal} disabled={isSaving}>Cancel</Button>
            <Button type="submit" form="update-deo-form" loading={isSaving}>Update DEO</Button>
          </>
        )}
      >
        <form id="update-deo-form" onSubmit={handleUpdate} className="space-y-5">
          <Input
            label="DEO Name"
            required
            value={form.deo_name}
            onChange={(event) => updateFormField('deo_name', event.target.value)}
            error={formErrors.deo_name}
            maxLength={255}
            disabled={isSaving}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(event) => updateFormField('email', event.target.value)}
            error={formErrors.email}
            maxLength={200}
            disabled={isSaving}
          />
          <Input
            label="Mobile Number"
            type="tel"
            inputMode="numeric"
            required
            value={form.mobile}
            onChange={(event) => updateFormField('mobile', event.target.value.replace(/\D/g, '').slice(0, 10))}
            error={formErrors.mobile}
            maxLength={10}
            disabled={isSaving}
          />
        </form>
      </Modal>
    </div>
  );
};

export default ManageDEO;
