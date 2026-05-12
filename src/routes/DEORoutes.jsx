import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../pages/deo/Dashboard';
import Attendance from '../pages/deo/Attendance';
import VTPs from '../pages/deo/VTPs';
import VTSchools from '../pages/deo/VTSchools';
import VTTeachers from '../pages/deo/VTTeachers';
import MonthlyReports from '../pages/deo/MonthlyReports';
import ProtectedRoute from './ProtectedRoute';

const DEORoutes = () => {
  const allowedRoles = ['deo'];

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
        path="attendance"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="vtps"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <VTPs />
          </ProtectedRoute>
        }
      />
      <Route
        path="vt-schools"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <VTSchools />
          </ProtectedRoute>
        }
      />
      <Route
        path="vt-teachers"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <VTTeachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="monthly-reports"
        element={
          <ProtectedRoute allowedRoles={allowedRoles}>
            <MonthlyReports />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/deo/dashboard" replace />} />
    </Routes>
  );
};

export default DEORoutes;
