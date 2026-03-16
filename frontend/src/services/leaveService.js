import api from './api'

const leaveService = {
    applyLeave: async (leaveData) => {
        try {
            const response = await api.post('/leaves/apply', leaveData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    getMyLeaves: async () => {
        try {
            const response = await api.get('/leaves/my-leaves')
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    getMyBalances: async () => {
        try {
            const response = await api.get('/leaves/my-balances')
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    managerAction: async (id, actionData) => {
        try {
            const response = await api.post(`/leaves/manager/action/${id}`, actionData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    hrAction: async (id, actionData) => {
        try {
            const response = await api.post(`/leaves/hr/action/${id}`, actionData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },
    getManagerHistory: async () => {
        try {
            const response = await api.get('/leaves/manager/history')
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },
    getHRHistory: async () => {
        try {
            const response = await api.get('/leaves/hr/history')
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    cancelLeave: async (id) => {
        try {
            const response = await api.delete(`/leaves/cancel/${id}`)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },
    getHolidays: async () => {
        try {
            const response = await api.get('/holidays')
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

export default leaveService
