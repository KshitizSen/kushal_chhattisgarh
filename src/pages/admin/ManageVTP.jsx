import React, { useState } from 'react';
import { Search, Filter, UserCog, BookOpen, CheckCircle, XCircle, Edit, Mail } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';

const ManageVTP = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const vtps = [
    { id: 1, name: 'Skill Development Center', contact: 'Priya Sharma', email: 'priya@example.com', courses: 12, students: 450, status: 'approved', since: '2023-05-15' },
    { id: 2, name: 'Vocational Institute', contact: 'Vikram Singh', email: 'vikram@example.com', courses: 8, students: 320, status: 'approved', since: '2023-07-22' },
    { id: 3, name: 'Technical Training Hub', contact: 'Rahul Mehta', email: 'rahul@example.com', courses: 5, students: 180, status: 'pending', since: '2024-01-10' },
    { id: 4, name: 'Career Skills Academy', contact: 'Neha Kapoor', email: 'neha@example.com', courses: 15, students: 620, status: 'approved', since: '2022-11-30' },
    { id: 5, name: 'Industrial Training Center', contact: 'Sanjay Verma', email: 'sanjay@example.com', courses: 6, students: 210, status: 'rejected', since: '2024-02-15' },
    { id: 6, name: 'Digital Skills Institute', contact: 'Anita Desai', email: 'anita@example.com', courses: 10, students: 380, status: 'approved', since: '2023-09-05' },
  ];

  const columns = [
    { key: 'name', label: 'VTP Name', sortable: true },
    { key: 'contact', label: 'Contact Person', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'courses', label: 'Courses', sortable: true },
    { key: 'students', label: 'Students', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'since', label: 'Since', sortable: true },
    { key: 'actions', label: 'Actions', align: 'right' },
  ];

  const handleApprove = (id) => {
    console.log('Approved VTP:', id);
  };

  const handleReject = (id) => {
    console.log('Rejected VTP:', id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage VTP Providers</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage Vocational Teacher Providers and their applications
          </p>
        </div>
        <Button variant="primary" leftIcon={<UserCog className="w-4 h-4" />}>
          Add VTP
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total VTPs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">42</p>
            </div>
            <UserCog className="w-8 h-8 text-primary-500" />
          </div>
        </Card>
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">35</p>
            </div>
            <CheckCircle className="w-8 h-8 text-success-500" />
          </div>
        </Card>
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
            </div>
            <BookOpen className="w-8 h-8 text-warning-500" />
          </div>
        </Card>
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
            </div>
            <XCircle className="w-8 h-8 text-danger-500" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card padding="md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search VTPs by name, contact, or email..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" leftIcon={<Filter className="w-4 h-4" />}>
              Filter
            </Button>
            <Button variant="ghost">Export</Button>
          </div>
        </div>
      </Card>

      {/* VTP Table */}
      <Card padding="none">
        <Table
          columns={columns}
          data={vtps}
          renderRow={(vtp) => (
            <tr key={vtp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center mr-3">
                    <UserCog className="w-5 h-5 text-secondary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{vtp.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: VTP-{vtp.id.toString().padStart(3, '0')}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">{vtp.contact}</td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  {vtp.email}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                  {vtp.courses}
                </div>
              </td>
              <td className="px-6 py-4">{vtp.students.toLocaleString()}</td>
              <td className="px-6 py-4">
                <Badge
                  variant={vtp.status === 'approved' ? 'success' : vtp.status === 'pending' ? 'warning' : 'danger'}
                  size="sm"
                >
                  {vtp.status}
                </Badge>
              </td>
              <td className="px-6 py-4">{vtp.since}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  {vtp.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(vtp.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(vtp.id)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};

export default ManageVTP;