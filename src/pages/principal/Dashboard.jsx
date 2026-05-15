import React, { useEffect, useState } from 'react';
import {
  Users,
  Calendar,
  BookOpen,
  FileText,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
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
      value:   0,
      change:  'No activities',
      icon:    <BookOpen className="h-6 w-6" />,
      color:   'bg-purple-500',
      trend:   'neutral',
      onClick: () => navigate('/principal/activities'),
    },
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

    </div>
  );
};

export default PrincipalDashboard;
