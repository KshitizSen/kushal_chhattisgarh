import React, { useState } from 'react';
import { Download, Filter, Calendar, BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';

const Reports = () => {
  const [dateRange, setDateRange] = useState('last30');

  const enrollmentData = [
    { month: 'Jan', enrollments: 400, completions: 240 },
    { month: 'Feb', enrollments: 300, completions: 139 },
    { month: 'Mar', enrollments: 600, completions: 380 },
    { month: 'Apr', enrollments: 800, completions: 490 },
    { month: 'May', enrollments: 500, completions: 380 },
    { month: 'Jun', enrollments: 700, completions: 430 },
  ];

  const districtData = [
    { district: 'Raipur', schools: 35, students: 4200 },
    { district: 'Bilaspur', schools: 28, students: 3200 },
    { district: 'Durg', schools: 22, students: 2800 },
    { district: 'Korba', schools: 18, students: 2100 },
    { district: 'Rajnandgaon', schools: 15, students: 1800 },
  ];

  const completionData = [
    { name: 'Completed', value: 65, color: '#22c55e' },
    { name: 'In Progress', value: 20, color: '#f59e0b' },
    { name: 'Not Started', value: 10, color: '#ef4444' },
    { name: 'Dropped', value: 5, color: '#6b7280' },
  ];

  const reportTypes = [
    { id: 'enrollment', name: 'Enrollment Report', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'attendance', name: 'Attendance Report', icon: <Calendar className="w-5 h-5" /> },
    { id: 'performance', name: 'Performance Report', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'financial', name: 'Financial Report', icon: <PieChartIcon className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights and analytics for the vocational education system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="last7">Last 7 days</option>
            <option value="last30">Last 30 days</option>
            <option value="last90">Last 90 days</option>
            <option value="ytd">Year to Date</option>
            <option value="custom">Custom Range</option>
          </select>
          <Button variant="primary" leftIcon={<Download className="w-4 h-4" />}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Enrollment</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">12,847</p>
              <p className="text-sm text-success-600">+12% from last month</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary-500" />
          </div>
        </Card>
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">78%</p>
              <p className="text-sm text-success-600">+3% from last month</p>
            </div>
            <BarChart3 className="w-8 h-8 text-success-500" />
          </div>
        </Card>
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Attendance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">92%</p>
              <p className="text-sm text-warning-600">-2% from last month</p>
            </div>
            <Calendar className="w-8 h-8 text-warning-500" />
          </div>
        </Card>
        <Card variant="filled" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Schools</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">142</p>
              <p className="text-sm text-success-600">+5 new this month</p>
            </div>
            <PieChartIcon className="w-8 h-8 text-accent-500" />
          </div>
        </Card>
      </div>

      {/* Report Types */}
      <Card title="Quick Reports" padding="lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              className="flex flex-col items-center justify-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
                <div className="text-primary-600 dark:text-primary-400">
                  {report.icon}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{report.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generate report</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Monthly Enrollment Trend" padding="lg">
          <LineChart
            data={enrollmentData}
            lines={[
              { dataKey: 'enrollments', name: 'Enrollments', color: '#3b82f6' },
              { dataKey: 'completions', name: 'Completions', color: '#10b981' },
            ]}
            xAxisKey="month"
            height="300px"
          />
        </Card>
        <Card title="Schools by District" padding="lg">
          <BarChart
            data={districtData}
            bars={[
              { dataKey: 'schools', name: 'Schools', color: '#f59e0b' },
              { dataKey: 'students', name: 'Students (hundreds)', color: '#8b5cf6' },
            ]}
            xAxisKey="district"
            height="300px"
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Course Completion Status" padding="lg">
          <PieChart
            data={completionData}
            height="300px"
          />
        </Card>
        <Card title="Report Filters" padding="lg">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Generate Custom Report</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Report Type
                  </label>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                    <option>Comprehensive Summary</option>
                    <option>Detailed Analytics</option>
                    <option>Executive Summary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Range
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                    <span className="self-center">to</span>
                    <input
                      type="date"
                      className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Format
                  </label>
                  <div className="flex gap-2">
                    <label className="flex items-center">
                      <input type="radio" name="format" className="mr-2" defaultChecked />
                      PDF
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="format" className="mr-2" />
                      Excel
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="format" className="mr-2" />
                      CSV
                    </label>
                  </div>
                </div>
                <Button variant="primary" className="w-full">
                  Generate Report
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;