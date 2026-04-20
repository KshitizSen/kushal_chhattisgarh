import React, { useState } from 'react';
import { Search, Filter, School, MapPin, Users, Phone, Edit, Trash2 } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';

const ManageSchools = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const schools = [
    { id: 1, name: 'Govt. High School', district: 'Raipur', principal: 'Rajesh Kumar', students: 1200, status: 'active', contact: '9876543210' },
    { id: 2, name: 'Model School', district: 'Bilaspur', principal: 'Sneha Verma', students: 850, status: 'active', contact: '9876543211' },
    { id: 3, name: 'Central School', district: 'Durg', principal: 'Anjali Gupta', students: 950, status: 'pending', contact: '9876543212' },
    { id: 4, name: 'Kendriya Vidyalaya', district: 'Korba', principal: 'Rohit Sharma', students: 1100, status: 'active', contact: '9876543213' },
    { id: 5, name: 'Sainik School', district: 'Rajnandgaon', principal: 'Vikram Singh', students: 700, status: 'inactive', contact: '9876543214' },
    { id: 6, name: 'Navodaya Vidyalaya', district: 'Raigarh', principal: 'Priya Patel', students: 1300, status: 'active', contact: '9876543215' },
  ];

  const columns = [
    { key: 'name', label: 'School Name', sortable: true },
    { key: 'district', label: 'District', sortable: true },
    { key: 'principal', label: 'Principal', sortable: true },
    { key: 'students', label: 'Students', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'contact', label: 'Contact', sortable: true },
    { key: 'actions', label: 'Actions', align: 'right' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Schools</h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all registered schools in the system
          </p>
        </div>
        <Button variant="primary" leftIcon={<School className="w-4 h-4" />}>
          Add School
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Schools</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
            </div>
            <School className="w-8 h-8 text-primary-500" />
          </div>
        </Card>
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Schools</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">142</p>
            </div>
            <Users className="w-8 h-8 text-success-500" />
          </div>
        </Card>
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Districts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">27</p>
            </div>
            <MapPin className="w-8 h-8 text-accent-500" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card padding="md">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search schools by name, district, or principal..."
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

      {/* Schools Table */}
      <Card padding="none">
        <Table
          columns={columns}
          data={schools}
          renderRow={(school) => (
            <tr key={school.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                    <School className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{school.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{school.district} District</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">{school.district}</td>
              <td className="px-6 py-4">{school.principal}</td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  {school.students.toLocaleString()}
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge
                  variant={school.status === 'active' ? 'success' : school.status === 'pending' ? 'warning' : 'danger'}
                  size="sm"
                >
                  {school.status}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  {school.contact}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <Trash2 className="w-4 h-4 text-danger-600 dark:text-danger-400" />
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

export default ManageSchools;