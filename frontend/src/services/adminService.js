import api from './api';

const adminService = {
  // Dashboard
  getDashboard: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Users
  getUsers: async (page = 1, limit = 10, search = '', role_type = '') => {
    try {
      const response = await api.get('/admin/users', {
        params: { page, limit, search, role_type }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getHRs: (page, limit, search) => adminService.getUsers(page, limit, search, 'hr'),
  getManagers: (page, limit, search) => adminService.getUsers(page, limit, search, 'manager'),
  getEmployees: (page, limit, search) => adminService.getUsers(page, limit, search, 'employee'),

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Admins
  getAdmins: async () => {
    try {
      const response = await api.get('/admin/admins');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createAdmin: async (formData) => {
    try {
      const response = await api.post('/admin/admins', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateAdmin: async (adminId, formData) => {
    try {
      const response = await api.put(`/admin/admins/${adminId}`, formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteAdmin: async (adminId) => {
    try {
      const response = await api.delete(`/admin/admins/${adminId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Reports
  getReports: async (startDate, endDate, userId = null) => {
    try {
      const params = { startDate, endDate };
      if (userId) params.userId = userId;

      const response = await api.get('/admin/reports', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Attendance
  getAttendance: async (page = 1, limit = 10) => {
    try {
      const response = await api.get('/admin/attendance', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createHR: async (formData) => {
    try {
      const response = await api.post('/admin/hr', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default adminService;
