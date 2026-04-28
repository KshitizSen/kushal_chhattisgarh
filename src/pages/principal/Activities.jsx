import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Plus,
  Calendar,
  Users,
  Building,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle,
  Clock,
  MapPin,
  ExternalLink,
  UserPlus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import usePrincipalStore from '../../store/principalStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';

const ACTIVITY_TYPES = [
  { value: 'industrial_visit', label: 'Industrial Visit', icon: Building },
  { value: 'guest_teacher', label: 'Guest Teacher Session', icon: UserPlus },
  { value: 'workshop', label: 'Workshop', icon: Briefcase },
  { value: 'seminar', label: 'Seminar', icon: Users },
  { value: 'competition', label: 'Competition', icon: CheckCircle },
];

const Activities = () => {
  const {
    activities,
    activitiesLoading,
    teachers,
    fetchActivities,
    createActivity,
    fetchTeachers,
  } = usePrincipalStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    assignedTeachers: [],
    externalResource: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchActivities();
    fetchTeachers();
  }, [fetchActivities, fetchTeachers]);

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === 'all' || activity.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.type) errors.type = 'Activity type is required';
    if (!formData.title?.trim()) errors.title = 'Title is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.endTime) errors.endTime = 'End time is required';
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errors.endTime = 'End time must be after start time';
    }
    if (formData.assignedTeachers.length === 0) {
      errors.assignedTeachers = 'At least one teacher must be assigned';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setActionLoading(true);
    const result = await createActivity(formData);
    setActionLoading(false);

    if (result.success) {
      toast.success('Activity created successfully');
      setIsCreateModalOpen(false);
      setFormData({
        type: '',
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        assignedTeachers: [],
        externalResource: '',
      });
    } else {
      toast.error(result.error || 'Failed to create activity');
    }
  };

  const handleTeacherToggle = (teacherId) => {
    setFormData((prev) => ({
      ...prev,
      assignedTeachers: prev.assignedTeachers.includes(teacherId)
        ? prev.assignedTeachers.filter((id) => id !== teacherId)
        : [...prev.assignedTeachers, teacherId],
    }));
    setFormErrors((prev) => ({ ...prev, assignedTeachers: undefined }));
  };

  const getActivityTypeLabel = (type) => {
    const activityType = ACTIVITY_TYPES.find((t) => t.value === type);
    return activityType?.label || type;
  };

  const getActivityTypeIcon = (type) => {
    const activityType = ACTIVITY_TYPES.find((t) => t.value === type);
    const Icon = activityType?.icon || Briefcase;
    return Icon;
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      industrial_visit: 'blue',
      guest_teacher: 'purple',
      workshop: 'orange',
      seminar: 'green',
      competition: 'pink',
    };
    return colors[type] || 'gray';
  };

  const columns = [
    {
      key: 'type',
      header: 'Type',
      render: (value) => {
        const Icon = getActivityTypeIcon(value);
        const color = getActivityTypeColor(value);
        return (
          <div className={`flex items-center gap-2`}>
            <div className={`p-2 rounded-xl bg-${color}-100 dark:bg-${color}-900/30`}>
              <Icon className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {getActivityTypeLabel(value)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'title',
      header: 'Activity',
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 line-clamp-1">{row.description}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date & Time',
      render: (value, row) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{new Date(value).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-3 w-3" />
            <span>
              {row.startTime} - {row.endTime}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (value) => (
        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{value || 'TBD'}</span>
        </div>
      ),
    },
    {
      key: 'assignedTeachers',
      header: 'Assigned Teachers',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-gray-700 dark:text-gray-300">
            {value?.length || 0} teachers
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value, row) => {
        const today = new Date().toISOString().split('T')[0];
        const isUpcoming = row.date >= today;
        const status = isUpcoming ? 'upcoming' : 'completed';
        return <StatusBadge status={status} />;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" leftIcon={<Edit3 className="h-4 w-4" />}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" leftIcon={<Trash2 className="h-4 w-4" />}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Activities Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Assign and track vocational training activities
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Activity
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ACTIVITY_TYPES.map((type) => {
          const count = activities.filter((a) => a.type === type.value).length;
          const Icon = type.icon;
          const color = getActivityTypeColor(type.value);
          return (
            <Card
              key={type.value}
              variant="elevated"
              className={`bg-${color}-50 dark:bg-${color}-900/10`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-${color}-100 dark:bg-${color}-900/30`}>
                  <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {count}
                  </p>
                  <p className="text-xs text-gray-500">{type.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card variant="elevated">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search activities..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              {ACTIVITY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Activities Table */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Activity History
          </h2>
          <Badge variant="primary" outline>
            {filteredActivities.length} Activities
          </Badge>
        </div>

        {activitiesLoading ? (
          <div className="py-12 text-center">
            <Loader text="Loading activities..." />
          </div>
        ) : (
          <Table
            data={filteredActivities}
            columns={columns}
            emptyState={
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No activities found
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  Create First Activity
                </Button>
              </div>
            }
          />
        )}
      </Card>

      {/* Create Activity Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormErrors({});
        }}
        title="Create New Activity"
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={actionLoading}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create Activity
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Activity Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ACTIVITY_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.value;
                const color = getActivityTypeColor(type.value);
                return (
                  <button
                    key={type.value}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, type: type.value }));
                      setFormErrors((prev) => ({ ...prev, type: undefined }));
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 ${
                        isSelected
                          ? `text-${color}-600 dark:text-${color}-400`
                          : 'text-gray-400'
                      }`}
                    />
                    <span
                      className={`text-sm font-medium text-center ${
                        isSelected
                          ? `text-${color}-700 dark:text-${color}-400`
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {type.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {formErrors.type && (
              <p className="mt-1 text-sm text-red-500">{formErrors.type}</p>
            )}
          </div>

          {/* Title & Description */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Input
                label="Activity Title"
                placeholder="Enter activity title"
                value={formData.title}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, title: e.target.value }));
                  setFormErrors((prev) => ({ ...prev, title: undefined }));
                }}
                error={formErrors.title}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter activity description..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, date: e.target.value }));
                  setFormErrors((prev) => ({ ...prev, date: undefined }));
                }}
                className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${
                  formErrors.date
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.date && (
                <p className="mt-1 text-sm text-red-500">{formErrors.date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, startTime: e.target.value }));
                  setFormErrors((prev) => ({ ...prev, startTime: undefined }));
                }}
                className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${
                  formErrors.startTime
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.startTime && (
                <p className="mt-1 text-sm text-red-500">{formErrors.startTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, endTime: e.target.value }));
                  setFormErrors((prev) => ({ ...prev, endTime: undefined }));
                }}
                className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 ${
                  formErrors.endTime
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {formErrors.endTime && (
                <p className="mt-1 text-sm text-red-500">{formErrors.endTime}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <Input
              label="Location"
              placeholder="Enter activity location"
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              leftIcon={<MapPin className="h-4 w-4" />}
            />
          </div>

          {/* Assign Teachers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Assign Teachers <span className="text-red-500">*</span>
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-2">
              {teachers
                .filter((t) => t.status === 'approved')
                .map((teacher) => (
                  <label
                    key={teacher.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignedTeachers.includes(teacher.id)}
                      onChange={() => handleTeacherToggle(teacher.id)}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-sm font-semibold">
                      {teacher.name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {teacher.name}
                      </p>
                      <p className="text-xs text-gray-500">{teacher.subject}</p>
                    </div>
                  </label>
                ))}
            </div>
            {formErrors.assignedTeachers && (
              <p className="mt-1 text-sm text-red-500">{formErrors.assignedTeachers}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.assignedTeachers.length} teacher(s) selected
            </p>
          </div>

          {/* External Resource (for Guest Teacher) */}
          {formData.type === 'guest_teacher' && (
            <div>
              <Input
                label="External Resource / Guest Teacher Name"
                placeholder="Enter name of guest teacher or external resource"
                value={formData.externalResource}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    externalResource: e.target.value,
                  }))
                }
                leftIcon={<ExternalLink className="h-4 w-4" />}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Activities;
