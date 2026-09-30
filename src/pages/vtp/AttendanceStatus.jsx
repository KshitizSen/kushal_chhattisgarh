import { Navigate, useSearchParams } from 'react-router-dom';
import AttendanceStatus from '../admin/AttendanceStatus';

export default function VtpAttendanceStatus() {
  const [searchParams] = useSearchParams();

  if (searchParams.get('view') === 'monthly-reports') {
    return <Navigate to="/vtp/monthly-reports" replace />;
  }

  return <AttendanceStatus scope="vtp" />;
}
