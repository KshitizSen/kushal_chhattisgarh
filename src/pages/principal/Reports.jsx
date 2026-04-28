import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  FileText,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import usePrincipalStore from '../../store/principalStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';

const Reports = () => {
  const {
    reportsData,
    reportsLoading,
    teachers,
    dateRange,
    reportType,
    fetchReports,
    setDateRange,
    setReportType,
    exportReport,
    fetchTeachers,
  } = usePrincipalStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchTeachers();
  }, [fetchReports, fetchTeachers]);

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDateRangeChange = (field, value) => {
    setDateRange({
      ...dateRange,
      [field]: value,
    });
  };

  const generateReport = async () => {
    await fetchReports();
    toast.success('Report generated successfully');
  };

  const handleExport = async () => {
    if (!selectedTeacher) return;

    setExportLoading(true);
    const result = await exportReport(selectedTeacher.id, exportFormat);
    setExportLoading(false);

    if (result.success) {
      const blob = new Blob([result.data], {
        type: exportFormat === 'pdf'
          ? 'application/pdf'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTeacher.name}_attendance_report.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Report downloaded as ${exportFormat.toUpperCase()}`);
      setIsExportModalOpen(false);
      setSelectedTeacher(null);
    } else {
      toast.error(result.error || 'Failed to export report');
    }
  };

  const mockReportData = {
    summary: {
      totalTeachers: teachers.length,
      avgAttendance: 92,
      totalPresent: 450,
      totalAbsent: 38,
      totalLate: 42,
    },
    attendanceTrend: [
      { date: 'Week 1', present: 85, absent: 10, late: 5 },
      { date: 'Week 2', present: 88, absent: 8, late: 4 },
      { date: 'Week 3', present: 90, absent: 6, late: 4 },
      { date: 'Week 4', present: 92, absent: 5, late: 3 },
    ],
    teacherPerformance: [
      { name: 'Excellent', value: 25, color: '#10b981' },
      { name: 'Good', value: 45, color: '#3b82f6' },
      { name: 'Average', value: 20, color: '#f59e0b' },
      { name: 'Poor', value: 10, color: '#ef4444' },
    ],
    dailyAttendance: [
      { day: 'Mon', attendance: 95 },
      { day: 'Tue', attendance: 93 },
      { day: 'Wed', attendance: 94 },
      { day: 'Thu', attendance: 91 },
      { day: 'Fri', attendance: 89 },
      { day: 'Sat', attendance: 85 },
    ],
  };

  const columns = [
    {
      key: 'name',
      header: 'Teacher',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
            {value?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'attendance',
      header: 'Attendance %',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 max-w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                value >= 90
                  ? 'bg-green-500'
                  : value >= 75
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${value || 0}%` }}
            />
          </div>
          <span className="text-sm font-medium">{value || 0}%</span>
        </div>
      ),
    },
    {
      key: 'present',
      header: 'Present',
      render: (value) => (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>{value || 0}</span>
        </div>
      ),
    },
    {
      key: 'absent',
      header: 'Absent',
      render: (value) => (
        <div className="flex items-center gap-1 text-red-600">
          <XCircle className="h-4 w-4" />
          <span>{value || 0}</span>
        </div>
      ),
    },
    {
      key: 'late',
      header: 'Late',
      render: (value) => (
        <div className="flex items-center gap-1 text-yellow-600">
          <Clock className="h-4 w-4" />
          <span>{value || 0}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Download className="h-4 w-4" />}
          onClick={() => {
            setSelectedTeacher(row);
            setIsExportModalOpen(true);
          }}
        >
          Export
        </Button>
      ),
    },
  ];

  const teachersWithStats = filteredTeachers.map((teacher) => ({
    ...teacher,
    attendance: Math.floor(Math.random() * 30) + 70,
    present: Math.floor(Math.random() * 20) + 15,
    absent: Math.floor(Math.random() * 5),
    late: Math.floor(Math.random() * 5),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive attendance reports and data visualization
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={generateReport}
          loading={reportsLoading}
        >
          Generate Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          variant="elevated"
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockReportData.summary.totalTeachers}
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
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Attendance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockReportData.summary.avgAttendance}%
              </p>
            </div>
          </div>
        </Card>

        <Card
          variant="elevated"
          className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Late Arrivals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockReportData.summary.totalLate}
              </p>
            </div>
          </div>
        </Card>

        <Card
          variant="elevated"
          className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Absences</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockReportData.summary.totalAbsent}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="elevated">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setReportType('daily')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportType === 'daily'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setReportType('weekly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportType === 'weekly'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setReportType('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                reportType === 'monthly'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Monthly
            </button>
          </div>

          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              />
            </div>
            <span className="text-gray-400">to</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
              />
            </div>
          </div>

          <Button
            variant="primary"
            leftIcon={<Filter className="h-4 w-4" />}
            onClick={generateReport}
          >
            Apply Filters
          </Button>
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Attendance Trend
            </h3>
            <p className="text-sm text-gray-500">Weekly attendance overview</p>
          </div>
          <LineChart
            data={mockReportData.attendanceTrend}
            xKey="date"
            yKey="present"
            height={250}
            color="#3b82f6"
          />
        </Card>

        <Card variant="elevated">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Daily Attendance Pattern
            </h3>
            <p className="text-sm text-gray-500">Average by day of week</p>
          </div>
          <BarChart
            data={mockReportData.dailyAttendance}
            xKey="day"
            yKey="attendance"
            height={250}
            color="#10b981"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="elevated" className="lg:col-span-1">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Teacher Performance
            </h3>
            <p className="text-sm text-gray-500">Distribution by attendance</p>
          </div>
          <PieChart
            data={mockReportData.teacherPerformance}
            height={250}
            innerRadius={50}
            outerRadius={80}
          />
          <div className="mt-4 space-y-2">
            {mockReportData.teacherPerformance.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="elevated" className="lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Teacher Attendance Summary
            </h3>
            <p className="text-sm text-gray-500">Individual teacher reports</p>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-sm px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
            />
          </div>

          <Table
            data={teachersWithStats}
            columns={columns}
            emptyState={
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No teachers found</p>
              </div>
            }
          />
        </Card>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setSelectedTeacher(null);
        }}
        title="Export Report"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsExportModalOpen(false);
                setSelectedTeacher(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              loading={exportLoading}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Download Report
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {selectedTeacher && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                  {selectedTeacher.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedTeacher.name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedTeacher.email}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat('pdf')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  exportFormat === 'pdf'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText
                  className={`h-8 w-8 ${
                    exportFormat === 'pdf'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-400'
                  }`}
                />
                <span
                  className={`font-medium ${
                    exportFormat === 'pdf'
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  PDF Document
                </span>
              </button>
              <button
                onClick={() => setExportFormat('excel')}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  exportFormat === 'excel'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3
                  className={`h-8 w-8 ${
                    exportFormat === 'excel'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-gray-400'
                  }`}
                />
                <span
                  className={`font-medium ${
                    exportFormat === 'excel'
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Excel Spreadsheet
                </span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-200">
                  Report Contents
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-300 mt-1 space-y-1">
                  <li>• Attendance summary for selected date range</li>
                  <li>• Daily check-in/check-out times</li>
                  <li>• Late arrival records</li>
                  <li>• Leave history</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reports;
