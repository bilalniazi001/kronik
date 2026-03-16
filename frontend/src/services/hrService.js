import api from './api'

const hrService = {
    getManagers: async () => {
        try {
            const response = await api.get('/hr/managers')
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    getLeaveTypes: async () => {
        try {
            const response = await api.get('/hr/leave-types')
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    createManager: async (managerData) => {
        try {
            const response = await api.post('/hr/managers', managerData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    },

    createEmployee: async (employeeData) => {
        try {
            const response = await api.post('/hr/employees', employeeData)
            return response.data
        } catch (error) {
            throw error.response?.data || error.message
        }
    }
}

export default hrService
