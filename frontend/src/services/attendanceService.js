import api from './api';

const attendanceService = {
  checkIn: async (locationData) => {
    try {
      const response = await api.post('/attendances/checkin', locationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  checkOut: async (locationData) => {
    try {
      const response = await api.post('/attendances/checkout', locationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTodayStatus: async () => {
    try {
      const response = await api.get('/attendances/today');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  canLogout: async () => {
    try {
      const response = await api.get('/attendances/can-logout');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMonthlyReport: async (month, year) => {
    try {
      const response = await api.get('/attendances/monthly', {
        params: { month, year }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTeamSummary: async (start_date, end_date) => {
    try {
      const response = await api.get('/attendances/team-summary', {
        params: { start_date, end_date }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTeamMemberReport: async (memberId, start_date, end_date) => {
    try {
      const response = await api.get(`/attendances/team-member-report/${memberId}`, {
        params: { start_date, end_date }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getStats: async () => {
    try {
      const response = await api.get('/attendances/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default attendanceService;