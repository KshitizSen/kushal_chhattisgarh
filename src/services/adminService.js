import api from './api';

export const getAdminDashboardCounts = async () => {
  const response = await api.get('/admin/dashboard-counts');
  return response.data;
};

export const getAdminSchools = async ({
  page = 1,
  limit = 10,
  search = '',
  district_cd = '',
  block_cd = '',
  cluster_cd = '',
} = {}) => {
  const response = await api.get('/admin/schools', {
    params: { page, limit, search, district_cd, block_cd, cluster_cd },
  });
  return response.data;
};

export const getAdminVtpList = async ({
  page = 1,
  limit = 10,
  search = '',
  district_cd = '',
  block_cd = '',
  cluster_cd = '',
} = {}) => {
  const response = await api.get('/admin/vtp', {
    params: { page, limit, search, district_cd, block_cd, cluster_cd },
  });
  return response.data;
};

export const getAdminDeoList = async ({
  page = 1,
  limit = 10,
  search = '',
  district_cd = '',
  block_cd = '',
  cluster_cd = '',
} = {}) => {
  const response = await api.get('/admin/deos', {
    params: { page, limit, search, district_cd, block_cd, cluster_cd },
  });
  return response.data;
};

export const getAdminAttendanceTracking = async ({
  page = 1,
  limit = 10,
  search = '',
  month,
  year,
  status = '',
  district_cd = '',
  block_cd = '',
  cluster_cd = '',
} = {}) => {
  const response = await api.get('/admin/attendance-tracking', {
    params: { page, limit, search, month, year, status, district_cd, block_cd, cluster_cd },
  });
  return response.data;
};
