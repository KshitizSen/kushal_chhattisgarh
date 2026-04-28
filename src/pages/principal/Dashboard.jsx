import React, { useEffect, useState } from 'react';
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
  CheckCircle,
  UserCheck,
  UserX,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/common/Card';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import api from '../../services/api';

const PrincipalDashboard = () => {
  const navigate = useNavigate();

  // ── VT counts from GET /vt/list?status=all ────────────────────────────
  const [vtCounts, setVtCounts] = useState({ total: 0, pending: 0, accepted: 0, rejected: 0 });
  const [vtLoading, setVtLoading] = useState(true);

  // ── Today's attendance from POST /attendance/headmaster ───────────────
  const [attCounts, setAttCounts] = useState({ present: 0, late: 0, absent: 0 });
  const [attLoading, setAttLoading] = useState(true);

  const loading = vtLoading || attLoading;

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // ── 1. VT counts ──────────────────────────────────────────────────────
    const fetchVtCounts = async () => {
      try {
        const res = await api.get('/vt/list?status=all');
        if (res.data?.status && res.data?.counts) {
          setVtCounts({
            total:    res.data.counts.total    ?? 0,
            pending:  res.data.counts.pending  ?? 0,
            accepted: res.data.counts.accepted ?? 0,
            rejected: res.data.counts.rejected ?? 0,
          });
        }
      } catch {
        // keep defaults
      } finally {
        setVtLoading(false);
      }
    };

    // ── 2. Today's attendance counts ──────────────────────────────────────
    const fetchTodayAttendance = async () => {
      try {
        const res = await api.post('/attendance/headmaster', {
          filter_type:  'date',
          filter_value: today,
          limit:        200,
          page:         1,
        });
        if (res.data?.status) {
          const records = res.data.data || [];
          const s = { present: 0, late: 0, absent: 0 };
          records.forEach((r) => {
            if (r.status === 'present') s.present++;
            else if (r.status === 'late') s.late++;
            else if (r.status === 'absent') s.absent++;
          });
          setAttCounts(s);
        }
      } catch {
        // keep defaults
      } finally {
        setAttLoading(false);
      }
    };

    fetchVtCounts();
    fetchTodayAttendance();
  }, []);


  // ── Stat cards ────────────────────────────────────────────────────────
  const stats = [
    {
      title:   'Total VTs',
      value:   loading ? '…' : vtCounts.total,
      change:  `${vtCounts.accepted} accepted`,
      icon:    <Users className="h-6 w-6" />,
      color:   'bg-blue-500',
      trend:   'neutral',
      onClick: () => navigate('/principal/staff-management'),
    },
    {
      title:   'Pending Approvals',
      value:   loading ? '…' : vtCounts.pending,
      change:  vtCounts.pending > 0 ? 'Needs action' : 'All clear',
      icon:    <AlertCircle className="h-6 w-6" />,
      color:   'bg-orange-500',
      trend:   vtCounts.pending > 0 ? 'up' : 'neutral',
      onClick: () => navigate('/principal/teacher-approval'),
    },
    {
      title:   'Today Present',
      value:   loading ? '…' : attCounts.present,
      change:  'Checked in today',
      icon:    <UserCheck className="h-6 w-6" />,
      color:   'bg-green-500',
      trend:   'up',
      onClick: () => navigate('/principal/attendance'),
    },
    {
      title:   'Late Teachers',
      value:   loading ? '…' : attCounts.late,
      change:  'After grace time',
      icon:    <Clock className="h-6 w-6" />,
      color:   'bg-yellow-500',
      trend:   attCounts.late > 0 ? 'down' : 'neutral',
      onClick: () => navigate('/principal/attendance'),
    },
    {
      title:   'Absent Today',
      value:   loading ? '…' : attCounts.absent,
      change:  'Not checked in',
      icon:    <UserX className="h-6 w-6" />,
      color:   'bg-red-500',
      trend:   attCounts.absent > 0 ? 'down' : 'neutral',
      onClick: () => navigate('/principal/attendance'),
    },
    {
      title:   'Activities',
      value:   12,
      change:  'This month',
      icon:    <BookOpen className="h-6 w-6" />,
      color:   'bg-purple-500',
      trend:   'up',
      onClick: () => navigate('/principal/activities'),
    },
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
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
          <Button
            variant="primary"
            leftIcon={<FileText className="h-4 w-4" />}
            onClick={() => navigate('/principal/reports')}
          >
            Generate Report
          </Button>
          <Button
            variant="ghost"
            leftIcon={<Calendar className="h-4 w-4" />}
            onClick={() => navigate('/principal/holidays')}
          >
            School Calendar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={stat.onClick}
            className="cursor-pointer"
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
            />
          </div>
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
            <button
              onClick={() => navigate('/principal/teacher-approval')}
              className="w-full p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span>Approve Pending VTs</span>
                </div>
                {vtCounts.pending > 0 && (
                  <Badge variant="warning" size="sm">
                    {vtCounts.pending}
                  </Badge>
                )}
              </div>
            </button>
            <button
              onClick={() => navigate('/principal/attendance')}
              className="w-full p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-600 mr-3" />
                <span>Mark Attendance</span>
              </div>
            </button>
            <button
              onClick={() => navigate('/principal/activities')}
              className="w-full p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-purple-600 mr-3" />
                <span>Assign Activity</span>
              </div>
            </button>
            <button
              onClick={() => navigate('/principal/reports')}
              className="w-full p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-3" />
                <span>View VT Reports</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
