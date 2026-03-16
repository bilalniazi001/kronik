import api from './api';

const reportService = {
  getUserReports: async (startDate, endDate) => {
    try {
      const response = await api.get('/users/reports', {
        params: { start_date: startDate, end_date: endDate }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAdminReports: async (startDate, endDate, userId = null) => {
    try {
      const params = { start_date: startDate, end_date: endDate };
      if (userId) params.user_id = userId;
      
      const response = await api.get('/admin/reports', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  exportToPDF: async (userData, reportData, dateRange) => {
    // This will be handled by pdfHelper.js
    console.log('Exporting PDF...', { userData, reportData, dateRange });
  },

  exportToCSV: async (filters) => {
    try {
      const response = await api.get('/admin/export', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default reportService;