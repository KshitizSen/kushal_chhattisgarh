import React, { useMemo, useState } from 'react';
import { CalendarPlus2, Edit, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ModalFooter } from '../../components/common/Modal';

const initialHolidays = [
  {
    id: 1,
    holidayName: 'Ambedkar Jayanti',
    dateRange: '14 Apr 2026',
    applicableTo: 'All VTs',
    reason: 'National holiday',
    status: 'approved',
  },
  {
    id: 2,
    holidayName: 'Cluster Training Break',
    dateRange: '18 Apr 2026 - 19 Apr 2026',
    applicableTo: 'Raipur Cluster',
    reason: 'Monthly review workshop',
    status: 'pending',
  },
  {
    id: 3,
    holidayName: 'Local Festival Holiday',
    dateRange: '24 Apr 2026',
    applicableTo: 'Bilaspur Schools',
    reason: 'Regional celebration',
    status: 'approved',
  },
];

const emptyForm = {
  holidayName: '',
  fromDate: '',
  toDate: '',
  applicableTo: '',
  reason: '',
  status: 'pending',
};

const ManageHolidays = () => {
  const [records, setRecords] = useState(initialHolidays);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return records.filter((record) => (
      record.holidayName.toLowerCase().includes(query) ||
      record.applicableTo.toLowerCase().includes(query) ||
      record.reason.toLowerCase().includes(query)
    ));
  }, [records, searchQuery]);

  const columns = [
    { key: 'holidayName', label: 'Holiday Name' },
    { key: 'dateRange', label: 'Date Range' },
    { key: 'applicableTo', label: 'Applicable To' },
    { key: 'reason', label: 'Reason' },
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

  const buildDateRange = (fromDate, toDate) =>
    toDate && toDate !== fromDate ? `${fromDate} - ${toDate}` : fromDate;

  const openAddModal = () => {
    resetForm();
    setIsFormModalOpen(true);
  };

  const openEditModal = (record) => {
    const [fromDate, toDate] = record.dateRange.split(' - ');
    setEditingRecord(record);
    setFormData({
      holidayName: record.holidayName,
      fromDate: fromDate || '',
      toDate: toDate || fromDate || '',
      applicableTo: record.applicableTo,
      reason: record.reason,
      status: record.status,
    });
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (record) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.holidayName || !formData.fromDate || !formData.applicableTo || !formData.reason) {
      toast.error('Fill all holiday fields before saving.');
      return;
    }

    const nextRecord = {
      holidayName: formData.holidayName,
      dateRange: buildDateRange(formData.fromDate, formData.toDate),
      applicableTo: formData.applicableTo,
      reason: formData.reason,
      status: formData.status,
    };

    if (editingRecord) {
      setRecords((current) =>
        current.map((record) =>
          record.id === editingRecord.id
            ? {
                ...record,
                ...nextRecord,
              }
            : record
        )
      );
      toast.success('Holiday updated.');
    } else {
      setRecords((current) => [
        {
          id: current.length + 1,
          ...nextRecord,
        },
        ...current,
      ]);
      toast.success('Holiday added to dummy list.');
    }

    setIsFormModalOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedRecord) {
      return;
    }

    setRecords((current) => current.filter((record) => record.id !== selectedRecord.id));
    toast.success('Holiday deleted.');
    setIsDeleteModalOpen(false);
    setSelectedRecord(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Holidays</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create, update, and review holiday entries for VTs.
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<CalendarPlus2 className="h-4 w-4" />} onClick={openAddModal}>
          Add New
        </Button>
      </div>

      <Card padding="sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <Input
            placeholder="Search holidays by name, scope, or reason..."
            leftIcon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <Badge variant="accent" outline rounded className="justify-center px-3 py-1.5 text-[11px] uppercase tracking-[0.18em]">
            {filteredRecords.length} entries
          </Badge>
        </div>
      </Card>

      <Card title="Holiday Registry" padding="sm">
        <Table
          columns={columns}
          data={filteredRecords}
          renderRow={(record) => (
            <tr key={record.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-gray-800/40">
              <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200">{record.holidayName}</td>
              <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200">{record.dateRange}</td>
              <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200">{record.applicableTo}</td>
              <td className="px-3 py-2.5 text-gray-800 dark:text-gray-200">{record.reason}</td>
              <td className="px-3 py-2.5">
                <StatusBadge status={record.status} />
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(record)}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-600 transition hover:border-primary-300 hover:text-primary-600 dark:border-gray-700 dark:text-gray-300"
                    title="Update holiday"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteModal(record)}
                    className="rounded-lg border border-gray-200 p-1.5 text-danger-600 transition hover:border-danger-300 hover:bg-danger-50 dark:border-gray-700 dark:hover:border-danger-700 dark:hover:bg-danger-900/20"
                    title="Delete holiday"
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
        title={editingRecord ? 'Update Holiday' : 'Add New Holiday'}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Holiday Name"
            value={formData.holidayName}
            onChange={(event) => handleChange('holidayName', event.target.value)}
            placeholder="Enter holiday name"
          />
          <Input
            label="Applicable To"
            value={formData.applicableTo}
            onChange={(event) => handleChange('applicableTo', event.target.value)}
            placeholder="All VTs / Cluster / School"
          />
          <Input
            label="From Date"
            type="date"
            value={formData.fromDate}
            onChange={(event) => handleChange('fromDate', event.target.value)}
          />
          <Input
            label="To Date"
            type="date"
            value={formData.toDate}
            onChange={(event) => handleChange('toDate', event.target.value)}
          />
          <div className="md:col-span-2">
            <Input
              label="Reason"
              value={formData.reason}
              onChange={(event) => handleChange('reason', event.target.value)}
              placeholder="Enter reason"
            />
          </div>
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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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
            confirmLabel={editingRecord ? 'Update Holiday' : 'Save Holiday'}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRecord(null);
        }}
        title="Delete Holiday"
        size="sm"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Delete <span className="font-medium text-gray-900 dark:text-white">{selectedRecord?.holidayName}</span> from the holiday list?
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

export default ManageHolidays;
