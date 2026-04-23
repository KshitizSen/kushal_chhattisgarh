import React from 'react';
import { LayoutList, BellRing, CalendarDays, ShieldCheck } from 'lucide-react';
import Card, { StatCard } from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge, { StatusBadge } from '../../components/common/Badge';

const stats = [
  {
    title: 'Total VTs',
    value: '28',
    change: '+4 this month',
    icon: <LayoutList className="h-6 w-6" />,
  },
  {
    title: 'Pending Login Requests',
    value: '6',
    change: 'Needs review',
    icon: <BellRing className="h-6 w-6" />,
  },
  {
    title: 'Holiday Requests',
    value: '9',
    change: '2 pending',
    icon: <CalendarDays className="h-6 w-6" />,
  },
  {
    title: 'Attendance Approvals',
    value: '5',
    change: 'Awaiting action',
    icon: <ShieldCheck className="h-6 w-6" />,
  },
];

const vtSnapshot = [
  {
    id: 1,
    vtName: 'Amit Verma',
    school: 'Govt. HS Raipur',
    trade: 'Electrician',
    loginStatus: 'approved',
    attendanceStatus: 'pending',
  },
  {
    id: 2,
    vtName: 'Sonia Patel',
    school: 'Govt. HS Durg',
    trade: 'Retail',
    loginStatus: 'pending',
    attendanceStatus: 'approved',
  },
  {
    id: 3,
    vtName: 'Rahul Sahu',
    school: 'Model School Bilaspur',
    trade: 'IT/ITES',
    loginStatus: 'approved',
    attendanceStatus: 'pending',
  },
  {
    id: 4,
    vtName: 'Neha Yadav',
    school: 'Govt. HS Korba',
    trade: 'Beauty & Wellness',
    loginStatus: 'rejected',
    attendanceStatus: 'approved',
  },
];

const vtColumns = [
  { key: 'vtName', label: 'VT Name' },
  { key: 'school', label: 'School' },
  { key: 'trade', label: 'Trade' },
  {
    key: 'loginStatus',
    label: 'Login Status',
    render: (value) => <StatusBadge status={value} />,
  },
  {
    key: 'attendanceStatus',
    label: 'Attendance Approval',
    render: (value) => <StatusBadge status={value} />,
  },
];

const holidayRows = [
  {
    id: 1,
    name: 'Ambedkar Jayanti',
    dateRange: '14 Apr 2026',
    scope: 'All VTs',
    status: 'approved',
  },
  {
    id: 2,
    name: 'Summer Break',
    dateRange: '20 May 2026 - 25 May 2026',
    scope: 'Raipur Cluster',
    status: 'pending',
  },
  {
    id: 3,
    name: 'Local Festival Leave',
    dateRange: '06 Jun 2026',
    scope: 'Bilaspur Schools',
    status: 'approved',
  },
];

const holidayColumns = [
  { key: 'name', label: 'Holiday' },
  { key: 'dateRange', label: 'Date Range' },
  { key: 'scope', label: 'Applicable To' },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <StatusBadge status={value} />,
  },
];

const VTPDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">VTP Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review VT activity, pending approvals, and latest holiday updates.
          </p>
        </div>
        <Badge variant="primary" outline rounded className="px-3 py-1.5 text-xs uppercase tracking-[0.2em]">
          Dummy frontend data
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
        <Card title="VT Snapshot">
          <Table columns={vtColumns} data={vtSnapshot} />
        </Card>

        <Card title="Holiday Queue">
          <Table columns={holidayColumns} data={holidayRows} />
        </Card>
      </div>
    </div>
  );
};

export default VTPDashboard;
