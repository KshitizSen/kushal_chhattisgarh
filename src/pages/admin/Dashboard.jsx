import React from 'react';
import { Users, School, BookOpen, TrendingUp, Calendar, Download, MoreVertical } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Card, { StatCard } from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge, { StatusBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';

const AdminDashboard = () => {
  const { user } = useAuth();

  // Stat cards data
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12%',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      description: 'Active users across system',
    },
    {
      title: 'Schools',
      value: '156',
      change: '+5%',
      trend: 'up',
      icon: <School className="w-6 h-6" />,
      description: 'Registered schools',
    },
    {
      title: 'VTP Providers',
      value: '42',
      change: '+8%',
      trend: 'up',
      icon: <BookOpen className="w-6 h-6" />,
      description: 'Vocational training partners',
    },
    {
      title: 'Completion Rate',
      value: '78%',
      change: '+3%',
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />,
      description: 'Course completion average',
    },
  ];

  // Recent users table data
  const recentUsers = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', role: 'Principal', school: 'Govt. High School', status: 'active', joinDate: '2024-03-15' },
    { id: 2, name: 'Priya Sharma', email: 'priya@example.com', role: 'VTP', school: 'Skill Development Center', status: 'active', joinDate: '2024-03-10' },
    { id: 3, name: 'Amit Patel', email: 'amit@example.com', role: 'Admin', school: 'District Office', status: 'inactive', joinDate: '2024-03-05' },
    { id: 4, name: 'Sneha Verma', email: 'sneha@example.com', role: 'Principal', school: 'Model School', status: 'pending', joinDate: '2024-03-01' },
    { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', role: 'VTP', school: 'Vocational Institute', status: 'active', joinDate: '2024-02-28' },
  ];

  // Chart data
  const enrollmentData = [
    { month: 'Jan', enrollments: 400, completions: 240 },
    { month: 'Feb', enrollments: 300, completions: 139 },
    { month: 'Mar', enrollments: 600, completions: 380 },
    { month: 'Apr', enrollments: 800, completions: 490 },
    { month: 'May', enrollments: 500, completions: 380 },
    { month: 'Jun', enrollments: 700, completions: 430 },
  ];

  const schoolDistribution = [
    { district: 'Raipur', schools: 35, students: 4200 },
    { district: 'Bilaspur', schools: 28, students: 3200 },
    { district: 'Durg', schools: 22, students: 2800 },
    { district: 'Korba', schools: 18, students: 2100 },
    { district: 'Rajnandgaon', schools: 15, students: 1800 },
  ];

  // Table columns
  const userColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'school', label: 'School/Center', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'joinDate', label: 'Join Date', sortable: true },
    { key: 'actions', label: 'Actions', align: 'right' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, <span className="font-semibold text-primary-600 dark:text-primary-400">{user?.name}</span>. Here's what's happening with your system today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" leftIcon={<Calendar className="w-4 h-4" />}>
            Last 30 days
          </Button>
          <Button variant="primary" leftIcon={<Download className="w-4 h-4" />}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

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
            height="250px"
          />
        </Card>
        <Card title="Schools by District" padding="lg">
          <BarChart
            data={schoolDistribution}
            bars={[
              { dataKey: 'schools', name: 'Schools', color: '#f59e0b' },
              { dataKey: 'students', name: 'Students (hundreds)', color: '#8b5cf6' },
            ]}
            xAxisKey="district"
            height="250px"
          />
        </Card>
      </div>

      {/* Recent Users Table */}
      <Card
        title="Recent Users"
        footer={
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing 5 of 2,847 users
            </p>
            <Button variant="ghost">View All Users</Button>
          </div>
        }
        padding="lg"
      >
        <Table
          columns={userColumns}
          data={recentUsers}
          renderRow={(row) => (
            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-3">
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      {row.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{row.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{row.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">{row.email}</td>
              <td className="px-4 py-3">
                <Badge
                  variant={row.role === 'Admin' ? 'primary' : row.role === 'VTP' ? 'secondary' : 'accent'}
                  size="sm"
                >
                  {row.role}
                </Badge>
              </td>
              <td className="px-4 py-3">{row.school}</td>
              <td className="px-4 py-3">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-4 py-3">{row.joinDate}</td>
              <td className="px-4 py-3 text-right">
                <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </td>
            </tr>
          )}
        />
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Pending Approvals" variant="filled" padding="md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">School Registrations</p>
                <p className="text-sm text-gray-500">12 pending</p>
              </div>
              <Button size="sm">Review</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">VTP Applications</p>
                <p className="text-sm text-gray-500">8 pending</p>
              </div>
              <Button size="sm">Review</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Course Submissions</p>
                <p className="text-sm text-gray-500">5 pending</p>
              </div>
              <Button size="sm">Review</Button>
            </div>
          </div>
        </Card>

        <Card title="System Health" variant="filled" padding="md">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">API Uptime</span>
                <span className="text-sm font-bold text-success-600">99.8%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-success-500 h-2 rounded-full" style={{ width: '99.8%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Database</span>
                <span className="text-sm font-bold text-warning-600">78%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-warning-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Storage</span>
                <span className="text-sm font-bold text-primary-600">45%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Recent Activity" variant="filled" padding="md">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mt-1">
                <Users className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-medium">New principal registered</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mt-1">
                <School className="w-4 h-4 text-success-600" />
              </div>
              <div>
                <p className="text-sm font-medium">School approval completed</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center mt-1">
                <BookOpen className="w-4 h-4 text-accent-600" />
              </div>
              <div>
                <p className="text-sm font-medium">New course published</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;