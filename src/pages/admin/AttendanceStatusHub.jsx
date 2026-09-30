import { ListChecks, LayoutDashboard, Users } from 'lucide-react';
import AttendanceStatus from './AttendanceStatus';
import AttendanceTracking from './AttendanceTracking';
import StatusHub from '../../components/attendance/AttendanceStatusHub';

export default function AdminAttendanceStatusHub() {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'all-vts', label: 'Total VTs', icon: Users },
    { id: 'approved-vts', label: 'Approved VTs', icon: ListChecks },
  ];

  return (
    <StatusHub
      tabs={tabs}
      renderView={(view) => view === 'overview'
        ? <AttendanceStatus scope="admin" />
        : <AttendanceTracking initialView={view === 'approved-vts' ? 'approved_vts' : 'all_vts'} embedded />}
    />
  );
}
