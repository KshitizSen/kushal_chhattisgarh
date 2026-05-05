import api from './api';

const principalService = {
  // Dashboard
  getDashboardStats: () => {
    return api.get('/principal/dashboard-stats');
  },

  // Teachers
  getTeachers: () => {
    return api.get('/principal/teachers');
  },

  getPendingTeachers: () => {
    return api.get('/vt/pending');
  },

  approveTeacher: (teacherId) => {
    return api.post(`/principal/teachers/${teacherId}/approve`);
  },

  rejectTeacher: (teacherId, reason) => {
    return api.post(`/principal/teachers/${teacherId}/reject`, { reason });
  },

  // Attendance
  getAttendance: (date) => {
    return api.get('/principal/attendance', { params: { date } });
  },

  getLateTeachers: (date) => {
    return api.get('/principal/attendance/late', { params: { date } });
  },

  updateAttendanceStatus: (teacherId, status, date) => {
    return api.put('/principal/attendance/status', {
      teacherId,
      status,
      date,
    });
  },

  // School Timing
  getSchoolTiming: () => {
    return api.get('/principal/school-timing');
  },

  saveSchoolTiming: (timing) => {
    return api.put('/principal/school-timing', timing);
  },

  // Activities
  getActivities: () => {
    return api.get('/principal/activities');
  },

  createActivity: (activityData) => {
    return api.post('/principal/activities', activityData);
  },

  // Leave Management
  getLeaveRequests: () => {
    return api.get('/principal/leaves');
  },

  getLeaveStats: (teacherId) => {
    return api.get(`/principal/leaves/stats/${teacherId}`);
  },

  approveLeave: (leaveId) => {
    return api.post(`/principal/leaves/${leaveId}/approve`);
  },

  rejectLeave: (leaveId, reason) => {
    return api.post(`/principal/leaves/${leaveId}/reject`, { reason });
  },

  // Holidays
  getHolidays: () => {
    return api.get('/principal/holidays');
  },

  createHoliday: (holidayData) => {
    return api.post('/principal/holidays', holidayData);
  },

  updateHoliday: (holidayId, holidayData) => {
    return api.put(`/principal/holidays/${holidayId}`, holidayData);
  },

  deleteHoliday: (holidayId) => {
    return api.delete(`/principal/holidays/${holidayId}`);
  },

  // Reports
  getReports: (params) => {
    return api.get('/principal/reports', { params });
  },

  exportReport: (teacherId, format) => {
    return api.get('/principal/reports/export', {
      params: { teacherId, format },
      responseType: 'blob',
    });
  },

  // Leave Balance (EL - Earned Leave)
  getSchoolLeaveBalances: (year) => {
    return api.get('/leave-balance/school', { params: { year } });
  },

  getTeacherLeaveBalance: (teacherId, year) => {
    return api.get(`/leave-balance/teacher/${teacherId}`, { params: { year } });
  },

  approveLeaveWithDeduction: (leaveId) => {
    return api.post(`/leave-balance/approve-with-deduction/${leaveId}`, {
      status: 'approved',
    });
  },

  checkLeaveApproval: (leaveId) => {
    return api.get(`/leave-balance/check/${leaveId}`);
  },
};

export default principalService;
