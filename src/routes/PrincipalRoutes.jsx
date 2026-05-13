import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/principal/Dashboard';
import SchoolOverview from '../pages/principal/SchoolOverview';
import StaffManagement from '../pages/principal/StaffManagement';
import TeacherApproval from '../pages/principal/TeacherApproval';
import SchoolTiming from '../pages/principal/SchoolTiming';
import Attendance from '../pages/principal/Attendance';
import Activities from '../pages/principal/Activities';
import LeaveManagement from '../pages/principal/LeaveManagement';
import Holidays from '../pages/principal/Holidays';
import Reports from '../pages/principal/Reports';
import AttendanceRequests from '../pages/principal/AttendanceRequests';
import ProtectedRoute from './ProtectedRoute';

const PrincipalRoutes = () => {
  const allowedRoles = ['principal'];

  return (
    <Routes>
      <Route
        path="dashboard"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="school-overview"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <SchoolOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="staff-management"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <StaffManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="teacher-approval"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <TeacherApproval />
          </ProtectedRoute>
        }
      />
      <Route
        path="school-timing"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <SchoolTiming />
          </ProtectedRoute>
        }
      />
      <Route
        path="attendance"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="activities"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <Activities />
          </ProtectedRoute>
        }
      />
      <Route
        path="leave-management"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <LeaveManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="holidays"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <Holidays />
          </ProtectedRoute>
        }
      />
      <Route
        path="reports"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="attendance-requests"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <AttendanceRequests />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/principal/dashboard" replace />} />
    </Routes>
  );
};

export default PrincipalRoutes;
