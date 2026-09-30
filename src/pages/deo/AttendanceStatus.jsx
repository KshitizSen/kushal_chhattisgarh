import { ClipboardCheck, LayoutDashboard } from 'lucide-react';
import AttendanceStatus from '../admin/AttendanceStatus';
import Attendance from './Attendance';
import AttendanceStatusHub from '../../components/attendance/AttendanceStatusHub';

export default function DeoAttendanceStatus() {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'report-approvals', label: 'Report Approvals', icon: ClipboardCheck },
  ];

  return (
    <AttendanceStatusHub
      tabs={tabs}
      renderView={(view) => view === 'report-approvals'
        ? <Attendance embedded />
        : <AttendanceStatus scope="deo" />}
    />
  );
}
