import React, { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  KeyRound,
  FileText,
  Users,
  Lock,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Modal, { ModalFooter } from '../../components/common/Modal';
import MultiSelectDropdown from '../../components/common/MultiSelectDropdown';
import {
  defaultRoles,
  permissionGroups,
  permissionLabelMap,
  permissionOptions,
} from '../../utils/rolePermissions';

const STORAGE_KEY = 'admin-role-permission-state-v1';

const roleSchema = z.object({
  name: z.string().trim().min(2, 'Role name must be at least 2 characters'),
  status: z.enum(['active', 'inactive']),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
  remarks: z
    .string()
    .trim()
    .min(4, 'Remarks must be at least 4 characters')
    .max(240, 'Remarks must be under 240 characters'),
});

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

const createRoleCode = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const ManageRoles = () => {
  const [roles, setRoles] = useState(() => {
    if (typeof window === 'undefined') {
      return defaultRoles;
    }

    try {
      const rawRoles = window.localStorage.getItem(STORAGE_KEY);
      return rawRoles ? JSON.parse(rawRoles) : defaultRoles;
    } catch {
      return defaultRoles;
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      status: 'active',
      permissions: [],
      remarks: '',
    },
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
  }, [roles]);

  const selectedPermissions = useWatch({
    control,
    name: 'permissions',
    defaultValue: [],
  });

  const stats = useMemo(() => {
    const totalAssignments = roles.reduce((total, role) => total + role.memberCount, 0);
    const activeRoles = roles.filter((role) => role.status === 'active').length;
    const managedPermissions = new Set(roles.flatMap((role) => role.permissions)).size;

    return [
      {
        title: 'Total Roles',
        value: roles.length,
        description: 'Custom and seeded access templates',
        icon: <ShieldCheck className="h-5 w-5" />,
      },
      {
        title: 'Active Roles',
        value: activeRoles,
        description: 'Currently available for assignment',
        icon: <Lock className="h-5 w-5" />,
      },
      {
        title: 'Assigned Users',
        value: totalAssignments,
        description: 'Users currently mapped to roles',
        icon: <Users className="h-5 w-5" />,
      },
      {
        title: 'Permission Coverage',
        value: `${managedPermissions}/${permissionOptions.length}`,
        description: 'Unique permissions used across roles',
        icon: <KeyRound className="h-5 w-5" />,
      },
    ];
  }, [roles]);

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const matchesQuery =
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.remarks.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' ? true : role.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [roles, searchQuery, statusFilter]);

  const columns = [
    { key: 'role', label: 'Role', sortable: false },
    { key: 'permissions', label: 'Permissions', sortable: false },
    { key: 'remarks', label: 'Remarks', sortable: false },
    { key: 'updatedAt', label: 'Updated', sortable: false },
    { key: 'actions', label: 'Actions', align: 'right', sortable: false },
  ];

  const openCreateModal = () => {
    setEditingRole(null);
    reset({
      name: '',
      status: 'active',
      permissions: [],
      remarks: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    reset({
      name: role.name,
      status: role.status,
      permissions: role.permissions,
      remarks: role.remarks,
    });
    setIsModalOpen(true);
  };

  const handleDeleteRole = (role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) {
      return;
    }

    setRoles((currentRoles) => currentRoles.filter((currentRole) => currentRole.id !== role.id));
    toast.success(`Role "${role.name}" deleted`);
  };

  const onSubmit = (data) => {
    const normalizedCode = createRoleCode(data.name);
    const hasDuplicateName = roles.some(
      (role) =>
        role.code === normalizedCode &&
        (!editingRole || role.id !== editingRole.id)
    );

    if (hasDuplicateName) {
      setError('name', {
        type: 'manual',
        message: 'A role with this name already exists',
      });
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);

    if (editingRole) {
      setRoles((currentRoles) =>
        currentRoles.map((role) =>
          role.id === editingRole.id
            ? {
                ...role,
                ...data,
                code: normalizedCode,
                updatedAt: timestamp,
              }
            : role
        )
      );
      toast.success(`Role "${data.name}" updated`);
    } else {
      setRoles((currentRoles) => [
        {
          id: `role-${Date.now()}`,
          code: normalizedCode,
          memberCount: 0,
          updatedAt: timestamp,
          ...data,
        },
        ...currentRoles,
      ]);
      toast.success(`Role "${data.name}" created`);
    }

    setIsModalOpen(false);
    setEditingRole(null);
    reset({
      name: '',
      status: 'active',
      permissions: [],
      remarks: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_22px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary-700 dark:border-primary-900 dark:bg-primary-900/20 dark:text-primary-300">
            <ShieldCheck className="h-4 w-4" />
            Governance
          </div>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-gray-950 dark:text-white">
            Role and permission command desk
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
            Create role templates, assign exact permissions with multi-select checkboxes, and keep remarks for audit context.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="gray" rounded outline className="px-3 py-1.5 text-xs uppercase tracking-[0.24em]">
            {permissionOptions.length} permissions available
          </Badge>
          <Button variant="primary" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Create Role
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className="rounded-[1.75rem] border border-white/80 bg-white/85 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-950 dark:text-white">{stat.value}</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{stat.description}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/25 dark:text-primary-300">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
        <Card
          className="rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_22px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
          padding="md"
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-heading text-2xl font-semibold text-gray-950 dark:text-white">
                  Role registry
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Review role templates, permission coverage, and governance notes.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search role or remarks..."
                  leftIcon={<Search className="h-4 w-4" />}
                />
                <div className="relative min-w-[170px]">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-primary-500 dark:focus:ring-primary-900"
                  >
                    <option value="all">All status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <Table
              columns={columns}
              data={filteredRoles}
              className="rounded-[1.5rem] border-gray-200/80 dark:border-gray-800"
              emptyState={
                <div className="rounded-[1.5rem] border border-dashed border-gray-200 px-6 py-16 text-center dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white">No roles found</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try a different search or create a fresh role template.
                  </p>
                </div>
              }
              renderRow={(role) => (
                <tr key={role.id} className="border-b border-gray-200/70 last:border-b-0 hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-gray-800/40">
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/25 dark:text-primary-300">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-950 dark:text-white">{role.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {role.code.replace(/_/g, ' ')}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <StatusBadge status={role.status} />
                          <Badge variant="gray" size="sm" rounded outline>
                            {role.memberCount} assigned
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="primary" size="sm" rounded outline>
                          {permissionLabelMap[permission]}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="gray" size="sm" rounded outline>
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="max-w-sm text-sm leading-6 text-gray-600 dark:text-gray-400">{role.remarks}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(role.updatedAt)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(role)}
                        className="inline-flex rounded-xl border border-gray-200 p-2 text-gray-600 transition hover:border-primary-300 hover:text-primary-600 dark:border-gray-700 dark:text-gray-300"
                        title="Edit role"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="inline-flex rounded-xl border border-gray-200 p-2 text-danger-600 transition hover:border-danger-300 hover:bg-danger-50 dark:border-gray-700 dark:hover:border-danger-700 dark:hover:bg-danger-900/20"
                        title="Delete role"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card
            className="rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_22px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
            padding="md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-300">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold text-gray-950 dark:text-white">
                  Permission library
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Grouped permissions available for role assignment.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {permissionGroups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-[1.5rem] border border-gray-200/80 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-950 dark:text-white">{group.label}</p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{group.description}</p>
                    </div>
                    <Badge variant="gray" rounded outline size="sm">
                      {group.permissions.length}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.permissions.map((permission) => (
                      <Badge key={permission.value} variant="gray" rounded outline size="sm">
                        {permission.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            className="rounded-[2rem] border border-white/80 bg-white/85 shadow-[0_22px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80"
            padding="md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-50 text-secondary-700 dark:bg-secondary-900/20 dark:text-secondary-300">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-semibold text-gray-950 dark:text-white">
                  Governance note
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Keep remarks short and operationally useful.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-dashed border-gray-200 bg-gray-50/80 p-4 dark:border-gray-700 dark:bg-gray-800/40">
              <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                Best practice: create separate roles for governance, operations, and reporting. Avoid assigning full-access roles when a scoped permission set is sufficient.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? 'Edit role template' : 'Create role template'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
            <div className="space-y-5">
              <Input
                label="Role name"
                placeholder="e.g. District Operations Lead"
                error={errors.name?.message}
                {...register('name')}
                required
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-primary-500 dark:focus:ring-primary-900"
                  {...register('status')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <Controller
                control={control}
                name="permissions"
                render={({ field }) => (
                  <MultiSelectDropdown
                    label="Permissions"
                    groups={permissionGroups}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.permissions?.message}
                    helperText="Select one or more permissions from the dropdown checkbox list."
                    required
                  />
                )}
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Remarks <span className="ml-1 text-danger-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Write a short note about what this role is intended to manage."
                  className={`w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                    errors.remarks
                      ? 'border-danger-400 focus:border-danger-400 focus:ring-danger-100'
                      : 'border-gray-200 bg-white text-gray-700 focus:border-primary-400 focus:ring-primary-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-primary-500 dark:focus:ring-primary-900'
                  }`}
                  {...register('remarks')}
                />
                {errors.remarks && (
                  <p className="mt-1 text-sm text-danger-500">{errors.remarks.message}</p>
                )}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-gray-200 bg-gray-50/80 p-5 dark:border-gray-800 dark:bg-gray-800/50">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500 dark:text-gray-400">
                Selection summary
              </p>
              <p className="mt-3 text-3xl font-semibold text-gray-950 dark:text-white">
                {selectedPermissions.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">permissions selected</p>

              <div className="mt-5 space-y-3">
                {selectedPermissions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-200 px-4 py-5 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    No permissions selected yet.
                  </div>
                )}

                {permissionGroups.map((group) => {
                  const selectedWithinGroup = group.permissions.filter((permission) =>
                    selectedPermissions.includes(permission.value)
                  );

                  if (selectedWithinGroup.length === 0) {
                    return null;
                  }

                  return (
                    <div
                      key={group.id}
                      className="rounded-2xl border border-white/80 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-gray-900 dark:text-white">{group.label}</p>
                        <Badge variant="primary" rounded outline size="sm">
                          {selectedWithinGroup.length}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedWithinGroup.map((permission) => (
                          <Badge key={permission.value} variant="gray" rounded outline size="sm">
                            {permission.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <ModalFooter
            onCancel={() => setIsModalOpen(false)}
            onConfirm={handleSubmit(onSubmit)}
            confirmLabel={editingRole ? 'Update Role' : 'Create Role'}
          />
        </form>
      </Modal>
    </div>
  );
};

export default ManageRoles;
