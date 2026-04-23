import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import { StatusBadge } from '../../components/common/Badge';

const initialLoginNotifications = [
  {
    id: 1,
    vtName: 'Sonia Patel',
    school: 'Govt. HS Durg',
    requestDate: '21 Apr 2026',
    message: 'Requested first-time portal login approval.',
    status: 'pending',
  },
  {
    id: 2,
    vtName: 'Amit Verma',
    school: 'Govt. HS Raipur',
    requestDate: '20 Apr 2026',
    message: 'Password reset login access request.',
    status: 'approved',
  },
  {
    id: 3,
    vtName: 'Neha Yadav',
    school: 'Govt. HS Korba',
    requestDate: '18 Apr 2026',
    message: 'Mobile number mismatch during login approval.',
    status: 'rejected',
  },
];

const initialAttendanceNotifications = [
  {
    id: 11,
    vtName: 'Rahul Sahu',
    school: 'Model School Bilaspur',
    attendanceDate: '21 Apr 2026',
    checkIn: '09:16 AM',
    checkOut: '04:32 PM',
    status: 'pending',
  },
  {
    id: 12,
    vtName: 'Sonia Patel',
    school: 'Govt. HS Durg',
    attendanceDate: '20 Apr 2026',
    checkIn: '09:04 AM',
    checkOut: '04:15 PM',
    status: 'approved',
  },
  {
    id: 13,
    vtName: 'Amit Verma',
    school: 'Govt. HS Raipur',
    attendanceDate: '20 Apr 2026',
    checkIn: '09:41 AM',
    checkOut: '04:01 PM',
    status: 'rejected',
  },
];

const notificationTabs = [
  { id: 'login', label: 'Login Notifications' },
  { id: 'attendance', label: 'Attendance Approval Notifications' },
];

const VTNotifications = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginNotifications, setLoginNotifications] = useState(initialLoginNotifications);
  const [attendanceNotifications, setAttendanceNotifications] = useState(initialAttendanceNotifications);

  const handleStatusUpdate = (type, id, status) => {
    const setter = type === 'login' ? setLoginNotifications : setAttendanceNotifications;

    setter((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
            }
          : item
      )
    );

    toast.success(`Notification ${status}.`);
  };

  const loginColumns = [
    { key: 'vtName', label: 'VT Name' },
    { key: 'school', label: 'School' },
    { key: 'requestDate', label: 'Request Date' },
    { key: 'message', label: 'Message' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    { key: 'actions', label: 'Actions', align: 'right' },
  ];

  const attendanceColumns = [
    { key: 'vtName', label: 'VT Name' },
    { key: 'school', label: 'School' },
    { key: 'attendanceDate', label: 'Attendance Date' },
    { key: 'checkIn', label: 'Check In' },
    { key: 'checkOut', label: 'Check Out' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    { key: 'actions', label: 'Actions', align: 'right' },
  ];

  const currentRows = activeTab === 'login' ? loginNotifications : attendanceNotifications;
  const currentColumns = activeTab === 'login' ? loginColumns : attendanceColumns;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">VT Notifications</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review login and attendance approval notifications for VTs using dummy frontend data.
        </p>
      </div>

      <Card padding="md">
        <div className="flex flex-wrap gap-3">
          {notificationTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-2xl px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-[0_14px_28px_rgba(234,88,12,0.18)]'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      <Card title={activeTab === 'login' ? 'Login Notifications' : 'Attendance Approval Notifications'} padding="md">
        <Table
          columns={currentColumns}
          data={currentRows}
          renderRow={(row) => (
            <tr key={row.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-gray-800/40">
              <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.vtName}</td>
              <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.school}</td>
              {activeTab === 'login' ? (
                <>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.requestDate}</td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.message}</td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.attendanceDate}</td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.checkIn}</td>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{row.checkOut}</td>
                </>
              )}
              <td className="px-4 py-3">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-4 py-3 text-right">
                {row.status === 'pending' ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleStatusUpdate(activeTab, row.id, 'approved')}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleStatusUpdate(activeTab, row.id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 dark:text-gray-400">Action completed</span>
                )}
              </td>
            </tr>
          )}
        />
      </Card>
    </div>
  );
};

export default VTNotifications;
