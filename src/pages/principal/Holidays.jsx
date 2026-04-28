import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Trash2,
  Edit3,
  School,
  Sun,
  Moon,
  Star,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import usePrincipalStore from '../../store/principalStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';

const HOLIDAY_TYPES = [
  { value: 'national', label: 'National Holiday', color: 'blue', icon: Star },
  { value: 'school', label: 'School Holiday', color: 'green', icon: School },
  { value: 'vacation', label: 'Vacation', color: 'orange', icon: Sun },
  { value: 'exam', label: 'Exam Break', color: 'purple', icon: Moon },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Holidays = () => {
  const {
    holidays,
    holidaysLoading,
    fetchHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday,
  } = usePrincipalStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('calendar');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'school',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const getHolidayForDate = (date) => {
    return holidays.find(
      (h) => new Date(h.date).toDateString() === date.toDateString()
    );
  };

  const filteredHolidays = holidays.filter(
    (holiday) =>
      holiday.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      holiday.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateForm = () => {
    const errors = {};
    if (!formData.title?.trim()) errors.title = 'Title is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.type) errors.type = 'Type is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setActionLoading(true);
    const result = await createHoliday(formData);
    setActionLoading(false);

    if (result.success) {
      toast.success('Holiday created successfully');
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        date: '',
        type: 'school',
        description: '',
      });
      setFormErrors({});
    } else {
      toast.error(result.error || 'Failed to create holiday');
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setActionLoading(true);
    const result = await updateHoliday(selectedHoliday.id, formData);
    setActionLoading(false);

    if (result.success) {
      toast.success('Holiday updated successfully');
      setIsEditModalOpen(false);
      setSelectedHoliday(null);
    } else {
      toast.error(result.error || 'Failed to update holiday');
    }
  };

  const handleDelete = async () => {
    if (!selectedHoliday) return;

    setActionLoading(true);
    const result = await deleteHoliday(selectedHoliday.id);
    setActionLoading(false);

    if (result.success) {
      toast.success('Holiday deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedHoliday(null);
    } else {
      toast.error(result.error || 'Failed to delete holiday');
    }
  };

  const openEditModal = (holiday) => {
    setSelectedHoliday(holiday);
    setFormData({
      title: holiday.title,
      date: holiday.date.split('T')[0],
      type: holiday.type,
      description: holiday.description || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (holiday) => {
    setSelectedHoliday(holiday);
    setIsDeleteModalOpen(true);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const holiday = getHolidayForDate(date);
    if (holiday) {
      openEditModal(holiday);
    } else {
      setFormData((prev) => ({
        ...prev,
        date: date.toISOString().split('T')[0],
      }));
      setIsCreateModalOpen(true);
    }
  };

  const changeMonth = (direction) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const holiday = getHolidayForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      const holidayType = holiday
        ? HOLIDAY_TYPES.find((t) => t.value === holiday.type)
        : null;

      days.push(
        <motion.button
          key={day}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleDateClick(date)}
          className={`h-24 rounded-xl border p-2 transition-all text-left relative overflow-hidden ${
            holiday
              ? `border-${holidayType?.color}-300 bg-${holidayType?.color}-50 dark:bg-${holidayType?.color}-900/20`
              : isWeekend
              ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
              : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 hover:border-primary-300'
          } ${isToday ? 'ring-2 ring-primary-500' : ''}`}
        >
          <span
            className={`text-lg font-semibold ${
              isToday
                ? 'text-primary-600 dark:text-primary-400'
                : isWeekend
                ? 'text-gray-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {day}
          </span>
          {holiday && (
            <div className="mt-1">
              <p className="text-xs font-medium line-clamp-2 text-gray-800 dark:text-gray-200">
                {holiday.title}
              </p>
              <Badge variant={holidayType?.color} size="sm" className="mt-1">
                {holidayType?.label}
              </Badge>
            </div>
          )}
        </motion.button>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Holiday Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage school holidays and vacation calendar
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchHolidays}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setFormData({
                title: '',
                date: '',
                type: 'school',
                description: '',
              });
              setIsCreateModalOpen(true);
            }}
          >
            Add Holiday
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {HOLIDAY_TYPES.map((type) => {
          const count = holidays.filter((h) => h.type === type.value).length;
          const Icon = type.icon;
          return (
            <Card
              key={type.value}
              variant="elevated"
              className={`bg-${type.color}-50 dark:bg-${type.color}-900/10`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-${type.color}-100 dark:bg-${type.color}-900/30`}>
                  <Icon className={`h-5 w-5 text-${type.color}-600 dark:text-${type.color}-400`} />
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

      {/* View Toggle & Search */}
      <Card variant="elevated">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              List
            </button>
          </div>
          <div className="flex-1">
            <Input
              placeholder="Search holidays..."
              leftIcon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card variant="elevated">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              onClick={() => changeMonth(-1)}
            >
              Previous
            </Button>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight className="h-4 w-4" />}
              onClick={() => changeMonth(1)}
            >
              Next
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center py-2 font-semibold text-gray-600 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
            {HOLIDAY_TYPES.map((type) => (
              <div key={type.value} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded bg-${type.color}-100 border border-${type.color}-300`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">{type.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Weekend</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white border-2 border-primary-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Today</span>
            </div>
          </div>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card variant="elevated">
          <div className="space-y-3">
            {filteredHolidays.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No holidays found
                </p>
              </div>
            ) : (
              filteredHolidays
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map((holiday) => {
                  const type = HOLIDAY_TYPES.find((t) => t.value === holiday.type);
                  const Icon = type?.icon || Star;
                  return (
                    <div
                      key={holiday.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-${type?.color}-100 dark:bg-${type?.color}-900/30`}>
                          <Icon className={`h-5 w-5 text-${type?.color}-600 dark:text-${type?.color}-400`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {holiday.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(holiday.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          {holiday.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {holiday.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={type?.color} size="sm">
                          {type?.label}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Edit3 className="h-4 w-4" />}
                          onClick={() => openEditModal(holiday)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Trash2 className="h-4 w-4 text-red-500" />}
                          onClick={() => openDeleteModal(holiday)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </Card>
      )}

      {/* Create/Edit Holiday Modal */}
      <Modal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedHoliday(null);
          setFormErrors({});
        }}
        title={isEditModalOpen ? 'Edit Holiday' : 'Create Holiday'}
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedHoliday(null);
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={isEditModalOpen ? handleUpdate : handleCreate}
              loading={actionLoading}
              leftIcon={isEditModalOpen ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            >
              {isEditModalOpen ? 'Update Holiday' : 'Create Holiday'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Holiday Title"
            placeholder="Enter holiday name"
            value={formData.title}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, title: e.target.value }));
              setFormErrors((prev) => ({ ...prev, title: undefined }));
            }}
            error={formErrors.title}
            required
          />

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
              Holiday Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {HOLIDAY_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, type: type.value }));
                      setFormErrors((prev) => ({ ...prev, type: undefined }));
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isSelected
                          ? `text-${type.color}-600 dark:text-${type.color}-400`
                          : 'text-gray-400'
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        isSelected
                          ? `text-${type.color}-700 dark:text-${type.color}-400`
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Enter additional details..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedHoliday(null);
        }}
        title="Delete Holiday"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedHoliday(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={actionLoading}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Are you sure you want to delete this holiday?
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This action cannot be undone.
              </p>
            </div>
          </div>
          {selectedHoliday && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className="font-semibold text-gray-900 dark:text-white">
                {selectedHoliday.title}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(selectedHoliday.date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Holidays;
