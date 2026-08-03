import api from './api';

const vtpService = {
  // VT Approvals
  getVts: (status = 'all') => {
    return api.get(`/vtp/vts?status=${status}`);
  },

  approveVt: (userId, remarks = '') => {
    return api.patch(`/vtp/${userId}/approve`, { remarks });
  },

  rejectVt: (userId, remarks = '') => {
    return api.patch(`/vtp/${userId}/reject`, { remarks });
  },

  // Leave Management
  getLeaves: (params) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/vtp/leaves?${query}`);
  },

  approveLeave: (leaveId, remarks = '') => {
    return api.patch(`/vtp/leave/${leaveId}/approve`, { remarks });
  },

  rejectLeave: (leaveId, remarks = '') => {
    return api.patch(`/vtp/leave/${leaveId}/reject`, { remarks });
  },

  // Leave Balances (Scoped to VTP organization)
  getLeaveBalances: () => {
    // Note: This endpoint should ideally be scoped by organization on backend
    return api.get('/leave-balance/school');
  },

  checkLeaveBalance: (leaveId) => {
    return api.get(`/leave-balance/check/${leaveId}`);
  },

  // OnDuty Requests
  getOnDutyRequests: (payload) => {
    return api.post('/od/vtp', payload);
  },

  updateOnDutyStatus: (id, status, remarks = '') => {
    return api.patch(`/od/vtp/${id}/status`, { status, remarks });
  }
};

export default vtpService;
