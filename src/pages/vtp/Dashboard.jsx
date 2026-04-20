import React from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Clock,
  Award,
  BarChart3,
  FileText
} from 'lucide-react';
import { StatCard } from '../../components/common/Card';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import Table from '../../components/common/Table';

const VTPDashboard = () => {
  // Mock data for VTP dashboard
  const stats = [
    {
      title: 'Total Students',
      value: '245',
      change: '+12%',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Active Courses',
      value: '8',
      change: '+2',
      icon: <BookOpen className="h-6 w-6" />,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'Classes Today',
      value: '14',
      change: '3 ongoing',
      icon: <Calendar className="h-6 w-6" />,
      color: 'bg-purple-500',
      trend: 'neutral'
    },
    {
      title: 'Attendance Rate',
      value: '92%',
      change: '+3%',
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-orange-500',
      trend: 'up'
    },
    {
      title: 'Pending Assessments',
      value: '18',
      change: '-5',
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-red-500',
      trend: 'down'
    },
    {
      title: 'Certifications',
      value: '156',
      change: '+24',
      icon: <Award className="h-6 w-6" />,
      color: 'bg-indigo-500',
      trend: 'up'
    }
  ];

  const studentPerformanceData = [
    { month: 'Jan', score: 65 },
    { month: 'Feb', score: 72 },
    { month: 'Mar', score: 78 },
    { month: 'Apr', score: 82 },
    { month: 'May', score: 85 },
    { month: 'Jun', score: 88 },
    { month: 'Jul', score: 90 }
  ];

  const courseEnrollmentData = [
    { name: 'Electrician', students: 45 },
    { name: 'Plumber', students: 38 },
    { name: 'Welder', students: 32 },
    { name: 'Carpenter', students: 28 },
    { name: 'Mason', students: 25 },
    { name: 'Painter', students: 22 }
  ];

  const skillDistributionData = [
    { name: 'Basic', value: 30, color: '#3b82f6' },
    { name: 'Intermediate', value: 45, color: '#10b981' },
    { name: 'Advanced', value: 25, color: '#8b5cf6' }
  ];

  const recentStudents = [
    {
      id: 1,
      name: 'Rahul Sharma',
      course: 'Electrician',
      batch: 'Batch-2024-01',
      attendance: '95%',
      progress: '85%',
      status: 'active'
    },
    {
      id: 2,
      name: 'Priya Patel',
      course: 'Plumber',
      batch: 'Batch-2024-01',
      attendance: '88%',
      progress: '78%',
      status: 'active'
    },
    {
      id: 3,
      name: 'Amit Kumar',
      course: 'Welder',
      batch: 'Batch-2024-02',
      attendance: '92%',
      progress: '90%',
      status: 'active'
    },
    {
      id: 4,
      name: 'Sneha Singh',
      course: 'Carpenter',
      batch: 'Batch-2024-01',
      attendance: '85%',
      progress: '72%',
      status: 'warning'
    },
    {
      id: 5,
      name: 'Vikram Yadav',
      course: 'Mason',
      batch: 'Batch-2024-02',
      attendance: '78%',
      progress: '65%',
      status: 'warning'
    },
    {
      id: 6,
      name: 'Anjali Gupta',
      course: 'Painter',
      batch: 'Batch-2024-01',
      attendance: '96%',
      progress: '88%',
      status: 'active'
    }
  ];

  const columns = [
    { key: 'name', header: 'Student Name' },
    { key: 'course', header: 'Course' },
    { key: 'batch', header: 'Batch' },
    { key: 'attendance', header: 'Attendance' },
    { key: 'progress', header: 'Progress' },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value === 'active' ? 'Active' : 'Needs Attention'}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            VTP Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's your vocational training overview
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Class
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
              Student Performance Trend
            </h2>
            <BarChart3 className="h-5 w-5 text-gray-500" />
          </div>
          <LineChart
            data={studentPerformanceData}
            xKey="month"
            yKey="score"
            height={300}
            color="#3b82f6"
            title="Average Score"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Course Enrollment
            </h2>
            <Users className="h-5 w-5 text-gray-500" />
          </div>
          <BarChart
            data={courseEnrollmentData}
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
              Recent Students
            </h2>
            <button className="text-sm text-primary-600 hover:text-primary-700">
              View All
            </button>
          </div>
          <Table
            data={recentStudents}
            columns={columns}
            itemsPerPage={5}
            searchable={true}
            searchPlaceholder="Search students..."
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Skill Distribution
            </h2>
            <TrendingUp className="h-5 w-5 text-gray-500" />
          </div>
          <PieChart
            data={skillDistributionData}
            height={300}
            innerRadius={60}
            outerRadius={100}
          />
          <div className="mt-6 space-y-3">
            {skillDistributionData.map((item, index) => (
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

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex flex-col items-center">
            <Calendar className="h-8 w-8 text-primary-600 mb-2" />
            <span className="text-sm font-medium">Schedule Class</span>
          </button>
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex flex-col items-center">
            <FileText className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium">Upload Material</span>
          </button>
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex flex-col items-center">
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Add Student</span>
          </button>
          <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex flex-col items-center">
            <Award className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium">Issue Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VTPDashboard;
