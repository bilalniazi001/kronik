import React from 'react'
import { Routes, Route } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import AdminRoute from './AdminRoute'
import PublicRoute from './PublicRoute'

// Auth Pages
import LoginPage from '../pages/LoginPage'
import AdminLoginPage from '../pages/AdminLoginPage'

// User Pages
import HomePage from '../pages/HomePage'
import ProfilePage from '../pages/ProfilePage'
import ReportsPage from '../pages/ReportsPage'
import AnnouncementsPage from '../pages/AnnouncementsPage'
import ApplyLeavePage from '../pages/ApplyLeavePage'
import LeaveApprovalPage from '../pages/LeaveApprovalPage'

// Admin Pages
import AdminPanelPage from '../pages/AdminPanelPage'
import AdminUsersPage from '../pages/AdminUsersPage'
import AdminAdminsPage from '../pages/AdminAdminsPage'
import AdminReportsPage from '../pages/AdminReportsPage'
import AdminAttendancePage from '../pages/AdminAttendancePage'
import AdminAnnouncementsPage from '../pages/AdminAnnouncementsPage'
import AdminAddManager from '../pages/AdminAddManager'
import AdminAddEmployee from '../pages/AdminAddEmployee'
import AdminAddHR from '../pages/AdminAddHR'
import AdminHRListPage from '../pages/AdminHRListPage'
import AdminManagerListPage from '../pages/AdminManagerListPage'
import AdminEmployeeListPage from '../pages/AdminEmployeeListPage'

// Other Pages
import NotFoundPage from '../pages/NotFoundPage'
import UnauthorizedPage from '../pages/UnauthorizedPage'
import HolidayCalendarPage from '../pages/HolidayCalendarPage'

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/admin/login" element={<PublicRoute><AdminLoginPage /></PublicRoute>} />

      {/* User Protected Routes */}
      <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><ReportsPage /></PrivateRoute>} />
      <Route path="/announcements" element={<PrivateRoute><AnnouncementsPage /></PrivateRoute>} />
      <Route path="/apply-leave" element={<PrivateRoute><ApplyLeavePage /></PrivateRoute>} />
      <Route path="/leave-approvals" element={<PrivateRoute><LeaveApprovalPage /></PrivateRoute>} />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={<AdminRoute><AdminPanelPage /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
      <Route path="/admin/hr" element={<AdminRoute><AdminHRListPage /></AdminRoute>} />
      <Route path="/admin/managers" element={<AdminRoute><AdminManagerListPage /></AdminRoute>} />
      <Route path="/admin/employees" element={<AdminRoute><AdminEmployeeListPage /></AdminRoute>} />
      <Route path="/admin/admins" element={<AdminRoute><AdminAdminsPage /></AdminRoute>} />
      <Route path="/admin/attendance" element={<AdminRoute><AdminAttendancePage /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
      <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncementsPage /></AdminRoute>} />
      <Route path="/admin/holidays" element={<AdminRoute><HolidayCalendarPage /></AdminRoute>} />
      <Route path="/admin/add-manager" element={<AdminRoute><AdminAddManager /></AdminRoute>} />
      <Route path="/admin/add-hr" element={<AdminRoute><AdminAddHR /></AdminRoute>} />
      <Route path="/admin/add-employee" element={<AdminRoute><AdminAddEmployee /></AdminRoute>} />

      {/* Error Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes