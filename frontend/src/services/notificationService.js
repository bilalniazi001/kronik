import api from './api'

const notificationService = {
    getNotifications: async () => {
        try {
            const response = await api.get('/notifications')
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    markAsRead: async (id) => {
        try {
            const response = await api.put(`/notifications/${id}/read`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

export default notificationService
