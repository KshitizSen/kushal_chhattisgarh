import { Calendar, CalendarCheck, Filter, LayoutDashboard, Timer } from 'lucide-react';
import AttendanceStatus from '../admin/AttendanceStatus';
import Attendance from './Attendance';
import AttendanceStatusHub from '../../components/attendance/AttendanceStatusHub';

export default function PrincipalAttendanceStatus() {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'today', label: 'Today', icon: CalendarCheck },
    { id: 'date', label: 'By Date', icon: Calendar },
    { id: 'week', label: 'This Week', icon: Timer },
    { id: 'month', label: 'This Month', icon: Calendar },
    { id: 'date-range', label: 'Date Range', icon: Filter },
  ];

  return (
    <AttendanceStatusHub
      tabs={tabs}
      renderView={(view) => view === 'overview'
        ? <AttendanceStatus scope="principal" />
        : <Attendance initialTab={view === 'date-range' ? 'date_range' : view} embedded />}
    />
  );
}
