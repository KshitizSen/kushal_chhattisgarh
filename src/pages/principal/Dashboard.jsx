import React from 'react';
import { 
  Users, 
  School, 
  Calendar, 
  TrendingUp, 
  BookOpen,
  Award,
  BarChart3,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';
import { StatCard } from '../../components/common/Card';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import Table from '../../components/common/Table';

const PrincipalDashboard = () => {
  // Mock data for principal dashboard
  const stats = [
    {
      title: 'Total Students',
      value: '1,245',
      change: '+8%',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Teaching Staff',
      value: '48',
      change: '+3',
      icon: <School className="h-6 w-6" />,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'Classes Today',
      value: '56',
      change: '12 ongoing',
      icon: <Calendar className="h-6 w-6" />,
      color: 'bg-purple-500',
      trend: 'neutral'
    },
    {
      title: 'Attendance Rate',
      value: '94%',
      change: '+2%',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-orange-500',
      trend: 'up'
    },
    {
      title: 'Pending Requests',
      value: '24',
      change: '-8',
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-red-500',
      trend: 'down'
    },
    {
      title: 'Certifications',
      value: '342',
      change: '+42',
      icon: <Award className="h-6 w-6" />,
      color: 'bg-indigo-500',
      trend: 'up'
    }
  ];

  const attendanceTrendData = [
    { month: 'Jan', attendance: 88 },
    { month: 'Feb', attendance: 90 },
    { month: 'Mar', attendance: 92 },
    { month: 'Apr', attendance: 91 },
    { month: 'May', attendance: 93 },
    { month: 'Jun', attendance: 94 },
    { month: 'Jul', attendance: 95 }
  ];

  const studentDistributionData = [
    { name: 'Class 9', students: 180 },
    { name: 'Class 10', students: 165 },
    { name: 'Class 11', students: 152 },
    { name: 'Class 12', students: 148 },
    { name: 'Vocational', students: 120 }
  ];

  const performanceData = [
    { name: 'Excellent', value: 35, color: '#10b981' },
    { name: 'Good', value: 45, color: '#3b82f6' },
    { name: 'Average', value: 15, color: '#f59e0b' },
    { name: 'Needs Improvement', value: 5, color: '#ef4444' }
  ];

  const pendingRequests = [
    {
      id: 1,
      type: 'Leave Application',
      staff: 'Mr. Sharma',
      department: 'Mathematics',
      date: '2024-04-15',
      status: 'pending'
    },
    {
      id: 2,
      type: 'Resource Request',
      staff: 'Ms. Patel',
      department: 'Science',
      date: '2024-04-14',
      status: 'pending'
    },
    {
      id: 3,
      type: 'Budget Approval',
      staff: 'Mr. Kumar',
      department: 'Administration',
      date: '2024-04-13',
      status: 'review'
    },
    {
      id: 4,
      type: 'Event Permission',
      staff: 'Ms. Gupta',
      department: 'Cultural',
      date: '2024-04-12',
      status: 'pending'
    },
    {
      id: 5,
      type: 'Purchase Order',
      staff: 'Mr. Singh',
      department: 'Lab',
      date: '2024-04-11',
      status: 'review'
    }
  ];

  const columns = [
    { key: 'type', header: 'Request Type' },
    { key: 'staff', header: 'Staff Member' },
    { key: 'department', header: 'Department' },
    { key: 'date', header: 'Date' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          value === 'review' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value === 'pending' ? 'Pending' : 
           value === 'review' ? 'Under Review' : 'Approved'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Principal Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            School overview and management dashboard
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            School Calendar
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Monthly Attendance Trend
            </h2>
            <BarChart3 className="h-5 w-5 text-gray-500" />
          </div>
          <LineChart
            data={attendanceTrendData}
            xKey="month"
            yKey="attendance"
            height={300}
            color="#3b82f6"
            title="Attendance %"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Student Distribution by Class
            </h2>
            <Users className="h-5 w-5 text-gray-500" />
          </div>
          <BarChart
            data={studentDistributionData}
            xKey="name"
            yKey="students"
            height={300}
            color="#10b981"
            title="Number of Students"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Requests for Approval
            </h2>
            <button className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </button>
          </div>
          <Table
            data={pendingRequests}
            columns={columns}
            itemsPerPage={5}
            searchable={true}
            searchPlaceholder="Search requests..."
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Student Performance
            </h2>
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </div>
          <PieChart
            data={performanceData}
            height={300}
            innerRadius={60}
            outerRadius={100}
          />
          <div className="mt-6 space-y-3">
            {performanceData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Events
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="font-medium">Annual Sports Day</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Apr 25, 2024</p>
              </div>
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="font-medium">Parent-Teacher Meeting</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Apr 28, 2024</p>
              </div>
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div>
                <p className="font-medium">Science Exhibition</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">May 5, 2024</p>
              </div>
              <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Achievements
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Award className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">State Science Olympiad</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">1st Prize - Team A</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Award className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">District Sports Meet</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gold Medal - Athletics</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Award className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Math Competition</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">2nd Position - Senior Category</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span>Approve Pending Requests</span>
              </div>
            </button>
            <button className="w-full p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-3" />
                <span>View School Reports</span>
              </div>
            </button>
            <button className="w-full p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                <span>Schedule Meeting</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
