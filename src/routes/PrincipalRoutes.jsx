import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/principal/Dashboard';
import SchoolOverview from '../pages/principal/SchoolOverview';
import StaffManagement from '../pages/principal/StaffManagement';
import SchoolTiming from '../pages/principal/SchoolTiming';
import Attendance from '../pages/principal/Attendance';
import Activities from '../pages/principal/Activities';
import Holidays from '../pages/principal/Holidays';
import Reports from '../pages/principal/Reports';
import VocationalTrainingRequests from '../pages/common/VocationalTrainingRequests';
import ProtectedRoute from './ProtectedRoute';
import AttendanceStatus from '../pages/principal/AttendanceStatus';

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
        element={<Navigate to="/principal/vocational-training-requests" replace />}
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
        path="vocational-training-approval"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route path="attendance-status" element={<ProtectedRoute allowedRoles={allowedRoles}><AttendanceStatus /></ProtectedRoute>} />
      <Route
        path="attendance"
        element={<Navigate to="/principal/vocational-training-approval" replace />}
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
        element={<Navigate to="/principal/vocational-training-requests?tab=leave" replace />}
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
        path="device-change-requests"
        element={<Navigate to="/principal/vocational-training-requests" replace />}
      />
      <Route
        path="vocational-training-requests"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <VocationalTrainingRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="attendance-requests"
        element={<Navigate to="/principal/vocational-training-requests" replace />}
      />
      <Route path="*" element={<Navigate to="/principal/dashboard" replace />} />
    </Routes>
  );
};

export default PrincipalRoutes;
