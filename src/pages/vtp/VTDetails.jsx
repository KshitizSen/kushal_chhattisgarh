import React, { useMemo, useState } from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ModalFooter } from '../../components/common/Modal';

const initialVts = [
  {
    id: 101,
    vtName: 'Amit Verma',
    school: 'Govt. HS Raipur',
    trade: 'Electrician',
    phone: '9876543210',
    joinDate: '12 Apr 2026',
    status: 'active',
  },
  {
    id: 102,
    vtName: 'Sonia Patel',
    school: 'Govt. HS Durg',
    trade: 'Retail',
    phone: '9823124501',
    joinDate: '18 Apr 2026',
    status: 'pending',
  },
  {
    id: 103,
    vtName: 'Rahul Sahu',
    school: 'Model School Bilaspur',
    trade: 'IT/ITES',
    phone: '9713456002',
    joinDate: '25 Apr 2026',
    status: 'active',
  },
  {
    id: 104,
    vtName: 'Neha Yadav',
    school: 'Govt. HS Korba',
    trade: 'Beauty & Wellness',
    phone: '9823111004',
    joinDate: '28 Apr 2026',
    status: 'inactive',
  },
];

const emptyForm = {
  vtName: '',
  school: '',
  trade: '',
  phone: '',
  status: 'pending',
};

const VTDetails = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState(initialVts);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return records.filter((record) => (
      record.vtName.toLowerCase().includes(query) ||
      record.school.toLowerCase().includes(query) ||
      record.trade.toLowerCase().includes(query) ||
      record.phone.includes(query)
    ));
  }, [records, searchQuery]);

  const columns = [
    { key: 'id', label: 'VT ID' },
    { key: 'vtName', label: 'VT Name' },
    { key: 'school', label: 'School' },
    { key: 'trade', label: 'Trade' },
    { key: 'phone', label: 'Phone' },
    { key: 'joinDate', label: 'Join Date' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    { key: 'actions', label: 'Action', align: 'right' },
  ];

  const handleChange = (key, value) => {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setEditingRecord(null);
    setFormData(emptyForm);
  };

  const openAddModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setFormData({
      vtName: record.vtName,
      school: record.school,
      trade: record.trade,
      phone: record.phone,
      status: record.status,
    });
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (record) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  const formatJoinDate = () =>
    new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const handleSave = () => {
    if (!formData.vtName || !formData.school || !formData.trade || !formData.phone) {
      toast.error('Fill all VT details before saving.');
      return;
    }

    if (editingRecord) {
      setRecords((current) =>
        current.map((record) =>
          record.id === editingRecord.id
            ? {
                ...record,
                ...formData,
              }
            : record
        )
      );
      toast.success('VT details updated.');
    } else {
      setRecords((current) => [
        {
          id: current.length + 101,
          ...formData,
          joinDate: formatJoinDate(),
        },
        ...current,
      ]);
      toast.success('New VT added to dummy list.');
    }

    setIsFormModalOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedRecord) {
      return;
    }

    setRecords((current) => current.filter((record) => record.id !== selectedRecord.id));
    toast.success('VT record deleted.');
    setIsDeleteModalOpen(false);
    setSelectedRecord(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VT Details</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add, update, and review vocational teacher records.
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openAddModal}>
          Add New
        </Button>
      </div>

      <Card padding="sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <Input
            placeholder="Search by VT name, school, trade, or phone..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <Badge variant="primary" outline rounded className="justify-center px-3 py-1.5 text-[11px] uppercase tracking-[0.18em]">
            {filteredRecords.length} records
          </Badge>
        </div>
      </Card>

      <Card title="VT Registry" padding="sm">
        <Table
          columns={columns}
          data={filteredRecords}
          renderRow={(record) => (
            <tr key={record.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-gray-800/40">
              <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200">{record.id}</td>
              <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200">{record.vtName}</td>
              <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200">{record.school}</td>
              <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200">{record.trade}</td>
              <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200">{record.phone}</td>
              <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200">{record.joinDate}</td>
              <td className="px-3 py-2.5">
                <StatusBadge status={record.status} />
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(record)}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-600 transition hover:border-primary-300 hover:text-primary-600 dark:border-gray-700 dark:text-gray-300"
                    title="Update VT"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteModal(record)}
                    className="rounded-lg border border-gray-200 p-1.5 text-danger-600 transition hover:border-danger-300 hover:bg-danger-50 dark:border-gray-700 dark:hover:border-danger-700 dark:hover:bg-danger-900/20"
                    title="Delete VT"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          resetForm();
        }}
        title={editingRecord ? 'Update VT' : 'Add New VT'}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="VT Name"
            value={formData.vtName}
            onChange={(event) => handleChange('vtName', event.target.value)}
            placeholder="Enter VT name"
          />
          <Input
            label="School"
            value={formData.school}
            onChange={(event) => handleChange('school', event.target.value)}
            placeholder="Enter school name"
          />
          <Input
            label="Trade"
            value={formData.trade}
            onChange={(event) => handleChange('trade', event.target.value)}
            placeholder="Enter trade"
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(event) => handleChange('phone', event.target.value)}
            placeholder="Enter phone number"
          />
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={formData.status}
              onChange={(event) => handleChange('status', event.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <ModalFooter
            onCancel={() => {
              setIsFormModalOpen(false);
              resetForm();
            }}
            onConfirm={handleSave}
            confirmLabel={editingRecord ? 'Update VT' : 'Save VT'}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRecord(null);
        }}
        title="Delete VT"
        size="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Delete <span className="font-medium text-gray-900 dark:text-white">{selectedRecord?.vtName}</span> from the dummy VT list?
        </p>
        <div className="mt-5 flex justify-end">
          <ModalFooter
            onCancel={() => {
              setIsDeleteModalOpen(false);
              setSelectedRecord(null);
            }}
            onConfirm={handleDelete}
            confirmLabel="Delete"
          />
        </div>
      </Modal>
    </div>
  );
};

export default VTDetails;
