import { useSearchParams } from 'react-router-dom';
import { ClipboardCheck, ClipboardList, CalendarDays, Smartphone, Phone, CalendarCheck } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import VtpRegistrationApprovals from '../vtp/VtApprovals';
import PrincipleRegistrationApprovals from '../principal/TeacherApproval';
import VtpAttendanceRequests from '../vtp/AttendanceRequests';
import PrincipleAttendanceRequests from '../principal/AttendanceRequests';
import DeviceChangeRequests from './DeviceChangeRequests';
import VtStaffList from '../vtp/VtStaffList';
import VtpLeaveManagement from '../vtp/LeaveManagement';
import PrincipleLeaveManagement from '../principal/LeaveManagement';

const VocationalTrainingRequests = () => {
  const role = useAuthStore((state) => state.user?.role);
  const isVtp = ['vtp', 'vocational_teacher_provider'].includes(role);
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = isVtp
    ? ['registration', 'onduty', 'regularization', 'leave', 'device', 'mobile']
    : ['registration', 'onduty', 'regularization', 'leave', 'device'];
  const requestedTab = searchParams.get('tab');
  const activeTab = validTabs.includes(requestedTab) ? requestedTab : 'registration';
  const tabs = [
    ['registration', 'Registration Approval', ClipboardCheck],
    ['onduty', 'On Duty Request', ClipboardList],
    ['regularization', 'Regularization Request', CalendarDays],
    ['leave', 'Leave Request', CalendarCheck],
    ['device', 'Mobile Device Request', Smartphone],
    ...(isVtp ? [['mobile', 'Mobile Updation Request', Phone]] : []),
  ];

  const renderContent = () => {
    if (activeTab === 'registration') return isVtp ? <VtpRegistrationApprovals /> : <PrincipleRegistrationApprovals />;
    if (activeTab === 'onduty') return isVtp
      ? <VtpAttendanceRequests initialTab="onduty" hideTabs />
      : <PrincipleAttendanceRequests initialTab="onduty" hideTabs />;
    if (activeTab === 'regularization') return isVtp
      ? <VtpAttendanceRequests initialTab="regularization" hideTabs />
      : <PrincipleAttendanceRequests initialTab="regularization" hideTabs />;
    if (activeTab === 'leave') return isVtp ? <VtpLeaveManagement /> : <PrincipleLeaveManagement />;
    if (activeTab === 'device') return <DeviceChangeRequests />;
    return <VtStaffList initialTab="mobile-requests" hideTabs />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vocational Training Requests</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Review and process all VT requests from one place.</p>
      </div>
      <div className="overflow-x-auto border-b border-gray-200 dark:border-gray-700">
        <div className="flex min-w-max gap-1">
          {tabs.map(([key, label, Icon]) => (
            <button key={key} type="button" onClick={() => {
              setSearchParams(key === 'registration' ? {} : { tab: key }, { replace: true });
            }}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${activeTab === key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default VocationalTrainingRequests;
