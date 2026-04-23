import React, { useMemo, useState } from 'react';
import { Search, UserPlus, Edit, Trash2, MoreVertical, Download } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ModalFooter } from '../../components/common/Modal';
import Card from '../../components/common/Card';
import Pagination from '../../components/common/Pagination';
import {
  STATIC_ADMIN_ROLE_IDS,
  STATIC_ADMIN_ROLES,
  getStaticRoleLabel,
} from '../../utils/staticRoles';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(STATIC_ADMIN_ROLE_IDS),
  school: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']),
});

const getRoleBadgeVariant = (roleId) => {
  switch (String(roleId)) {
    case '1':
      return 'primary';
    case '2':
      return 'warning';
    case '3':
      return 'accent';
    case '4':
      return 'secondary';
    case '5':
      return 'gray';
    default:
      return 'gray';
  }
};

const ManageUsers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '5',
      school: '',
      status: 'active',
    },
  });

  const users = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', role: '5', school: 'Govt. High School', status: 'active', joinDate: '2024-03-15' },
    { id: 2, name: 'Priya Sharma', email: 'priya@example.com', role: '4', school: 'Skill Development Center', status: 'active', joinDate: '2024-03-10' },
    { id: 3, name: 'Amit Patel', email: 'amit@example.com', role: '1', school: 'District Office', status: 'inactive', joinDate: '2024-03-05' },
    { id: 4, name: 'Sneha Verma', email: 'sneha@example.com', role: '5', school: 'Model School', status: 'pending', joinDate: '2024-03-01' },
    { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', role: '4', school: 'Vocational Institute', status: 'active', joinDate: '2024-02-28' },
    { id: 6, name: 'Anjali Gupta', email: 'anjali@example.com', role: '2', school: 'Central School', status: 'active', joinDate: '2024-02-25' },
    { id: 7, name: 'Rahul Mehta', email: 'rahul@example.com', role: '3', school: 'Technical Institute', status: 'inactive', joinDate: '2024-02-20' },
    { id: 8, name: 'Kavita Joshi', email: 'kavita@example.com', role: '1', school: 'State Office', status: 'active', joinDate: '2024-02-15' },
  ];

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'school', label: 'School/Center', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'joinDate', label: 'Join Date', sortable: true },
    { key: 'actions', label: 'Actions', align: 'right' },
  ];

  const handleAddUser = () => {
    setEditingUser(null);
    reset({
      name: '',
      email: '',
      role: '5',
      school: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    reset(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      toast.success(`User ${user.name} deleted successfully`);
    }
  };

  const onSubmit = (data) => {
    if (editingUser) {
      toast.success(`User ${data.name} updated successfully`);
    } else {
      toast.success(`User ${data.name} added successfully`);
    }
    setIsModalOpen(false);
    reset();
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const roleLabel = getStaticRoleLabel(user.role).toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.school.toLowerCase().includes(query) ||
        roleLabel.includes(query);

      const matchesRole = roleFilter ? user.role === roleFilter : true;
      const matchesStatus = statusFilter ? user.status === statusFilter : true;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [roleFilter, searchQuery, statusFilter, users]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage system users with the fixed admin-side role master list.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />} onClick={handleAddUser}>
            Add User
          </Button>
        </div>
      </div>

      <Card padding="md">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search users by name, email, school, or role..."
              leftIcon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Roles</option>
              {STATIC_ADMIN_ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {getStaticRoleLabel(role.id)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </Card>

      <Card padding="none">
        <Table
          columns={columns}
          data={filteredUsers}
          renderRow={(user) => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                    <span className="font-medium text-primary-600 dark:text-primary-400">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">{user.email}</td>
              <td className="px-6 py-4">
                <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                  {getStaticRoleLabel(user.role)}
                </Badge>
              </td>
              <td className="px-6 py-4">{user.school}</td>
              <td className="px-6 py-4">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-6 py-4">{user.joinDate}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="rounded p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="rounded p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-danger-600 dark:text-danger-400" />
                  </button>
                  <button className="rounded p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {filteredUsers.length} of {users.length} users
        </p>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredUsers.length / 10)}
          totalItems={filteredUsers.length}
          pageSize={10}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Full Name"
              placeholder="Enter full name"
              error={errors.name?.message}
              {...register('name')}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              error={errors.email?.message}
              {...register('email')}
              required
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('role')}
              >
                {STATIC_ADMIN_ROLES.map((role) => (
                  <option key={role.id} value={role.id}>
                    {getStaticRoleLabel(role.id)}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-danger-500">{errors.role.message}</p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('status')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-danger-500">{errors.status.message}</p>
              )}
            </div>
          </div>
          <Input
            label="School/Center (Optional)"
            placeholder="Enter school or center name"
            error={errors.school?.message}
            {...register('school')}
          />
          <ModalFooter
            onCancel={() => setIsModalOpen(false)}
            onConfirm={handleSubmit(onSubmit)}
            confirmLabel={editingUser ? 'Update User' : 'Add User'}
          />
        </form>
      </Modal>
    </div>
  );
};

export default ManageUsers;
