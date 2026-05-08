import React, { useEffect, useState } from 'react';
import {
  Clock,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Sun,
  Moon,
  Timer,
  Info,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import usePrincipalStore from '../../store/principalStore';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Loader from '../../components/common/Loader';

const SchoolTiming = () => {
  const {
    schoolTiming,
    timingLoading,
    fetchSchoolTiming,
    saveSchoolTiming,
  } = usePrincipalStore();

  const [formData, setFormData] = useState({
    startTime: '08:00',
    endTime: '16:00',
    graceTime: 15,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchSchoolTiming();
  }, [fetchSchoolTiming]);

  useEffect(() => {
    if (schoolTiming) {
      setFormData({
        startTime: schoolTiming.startTime || '08:00',
        endTime: schoolTiming.endTime || '16:00',
        graceTime: schoolTiming.graceTime || 15,
      });
    }
  }, [schoolTiming]);

  const validate = () => {
    const errors = {};
    const start = formData.startTime;
    const end = formData.endTime;

    if (!start) {
      errors.startTime = 'Start time is required';
    }
    if (!end) {
      errors.endTime = 'End time is required';
    }
    if (start && end && start >= end) {
      errors.endTime = 'End time must be after start time';
    }
    if (formData.graceTime < 0 || formData.graceTime > 30) {
      errors.graceTime = 'Grace time must be between 0 and 30 minutes';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
    setValidationErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const user = useAuthStore((s) => s.user);
  const [isSaving, setIsSaving] = useState(false);

  // Convert 24h "HH:MM" → "HH:MM am/pm" for the API payload
  const to12h = (time24) => {
    if (!time24) return '';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fix the validation errors');
      return;
    }

    const udise_code = user?.udise_code;
    if (!udise_code) {
      toast.error('UDISE code not found in your profile. Please re-login.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        udise_code,
        sch_open_time: to12h(formData.startTime),
        sch_close_time: to12h(formData.endTime),
        grace_time: Number(formData.graceTime),
      };

      await api.patch('/headmaster/school-time', payload);

      toast.success('School timing saved successfully!');
      setHasChanges(false);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save school timing';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (schoolTiming) {
      setFormData({
        startTime: schoolTiming.startTime || '08:00',
        endTime: schoolTiming.endTime || '16:00',
        graceTime: schoolTiming.graceTime || 15,
      });
    }
    setHasChanges(false);
    setValidationErrors({});
    toast.info('Changes reset to last saved values');
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = () => {
    if (!formData.startTime || !formData.endTime) return null;
    const [startHours, startMinutes] = formData.startTime.split(':').map(Number);
    const [endHours, endMinutes] = formData.endTime.split(':').map(Number);

    let durationMinutes =
      endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
    if (durationMinutes < 0) durationMinutes += 24 * 60;

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  };

  if (timingLoading && !schoolTiming.startTime) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" text="Loading school timing..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            School Timing Setup
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure daily school hours and grace period settings
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSave}
            loading={timingLoading}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Current Settings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          variant="elevated"
          className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-900/30">
              <Sun className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                School Starts At
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(formData.startTime)}
              </p>
            </div>
          </div>
        </Card>

        <Card
          variant="elevated"
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
              <Moon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                School Ends At
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTime(formData.endTime)}
              </p>
            </div>
          </div>
        </Card>

        <Card
          variant="elevated"
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-green-100 dark:bg-green-900/30">
              <Timer className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                School Duration
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {calculateDuration() || '--'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Settings Form */}
      <Card variant="elevated" className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Configure School Hours
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Set the daily school timing and grace period for attendance
          </p>
        </div>

        <div className="space-y-6">
          {/* Start Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                School Start Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent [&::-webkit-calendar-picker-indicator]:opacity-0 ${validationErrors.startTime
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-700'
                    }`}
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              {validationErrors.startTime && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.startTime}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                School End Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent [&::-webkit-calendar-picker-indicator]:opacity-0 ${validationErrors.endTime
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-700'
                    }`}
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              {validationErrors.endTime && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.endTime}
                </p>
              )}
            </div>
          </div>

          {/* Grace Time */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Grace Period (minutes) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="5"
                  value={formData.graceTime}
                  onChange={(e) =>
                    handleChange('graceTime', parseInt(e.target.value, 10))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 min</span>
                  <span>15 min</span>
                  <span>30 min</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <Timer className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                  {formData.graceTime} min
                </span>
              </div>
            </div>
            {validationErrors.graceTime && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.graceTime}
              </p>
            )}
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Teachers arriving within the grace period after start time will not
              be marked as late.
            </p>
          </div>

          {/* Late Time Calculation */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-5 w-5 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Late Arrival Calculation
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Teachers will be marked as{' '}
                <Badge variant="warning" size="sm">
                  Late
                </Badge>{' '}
                if they arrive after:
              </p>
              <div className="flex items-center gap-2 text-lg">
                <span className="font-mono bg-white dark:bg-gray-700 px-3 py-1 rounded-lg">
                  {formatTime(formData.startTime)}
                </span>
                <span className="text-gray-500">+</span>
                <span className="font-mono bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-lg">
                  {formData.graceTime} min
                </span>
                <span className="text-gray-500">=</span>
                <span className="font-mono bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-lg font-semibold">
                  {(() => {
                    if (!formData.startTime) return '--';
                    const [hours, minutes] = formData.startTime
                      .split(':')
                      .map(Number);
                    const totalMinutes = hours * 60 + minutes + formData.graceTime;
                    const newHours = Math.floor(totalMinutes / 60) % 24;
                    const newMinutes = totalMinutes % 60;
                    const ampm = newHours >= 12 ? 'PM' : 'AM';
                    const displayHour = newHours % 12 || 12;
                    return `${displayHour}:${String(newMinutes).padStart(
                      2,
                      '0'
                    )} ${ampm}`;
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mr-auto"
            >
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Unsaved changes</span>
            </motion.div>
          )}
          <Button
            variant="ghost"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={handleReset}
            disabled={!hasChanges}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSave}
            loading={isSaving}
            disabled={!hasChanges || isSaving}
          >
            Save Changes
          </Button>

        </div>
      </Card>

      {/* Info Card */}
      <Card variant="outlined" className="bg-blue-50/50 dark:bg-blue-900/10">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              Important Notes
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>
                • School timing settings apply to all vocational teachers
              </li>
              <li>• Changes will take effect from the next working day</li>
              {/* <li>• Teachers are marked late after grace period expires</li> */}
              {/* <li>
                • Half-day is calculated based on the midpoint of school hours
              </li> */}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SchoolTiming;
