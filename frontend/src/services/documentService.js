import api from './api';

const documentService = {
  getDocuments: async () => {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  uploadDocument: async (formData) => {
    try {
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getDocumentUrl: (documentId) => {
    return `${api.defaults.baseURL}/documents/${documentId}/view`;
  },

  downloadDocument: (documentId) => {
    window.open(`${api.defaults.baseURL}/documents/${documentId}/download`, '_blank');
  },
};

export default documentService;