import React, { useState, useEffect, useCallback } from 'react';
import { useAlert } from '../hooks/useAlert';
import adminService from '../services/adminService';
import AdminReportView from '../components/admin/AdminReportView';
import Loader from '../components/common/Loader';
import { useReport } from '../hooks/useReport';

const AdminReportsPage = () => {
  const { showError } = useAlert();
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { exportPDF } = useReport(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date()
  });

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);

      const searchParams = new URLSearchParams(window.location.search);
      const urlUserId = searchParams.get('userId');

      const [usersRes, reportsRes] = await Promise.all([
        adminService.getUsers(1, 100),
        adminService.getReports(
          new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0],
          urlUserId
        )
      ]);

      setUsers(usersRes.users);
      setReports(reportsRes.reports);
    } catch {
      showError('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleFilterChange = async (filters) => {
    try {
      setLoading(true);
      setDateRange({
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      const response = await adminService.getReports(
        filters.startDate.toISOString().split('T')[0],
        filters.endDate.toISOString().split('T')[0],
        filters.userId !== 'all' ? filters.userId : null
      );
      setReports(response.reports);
    } catch {
      showError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading && reports.length === 0) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <AdminReportView
        users={users}
        reports={reports}
        onFilterChange={handleFilterChange}
        loading={loading}
        onExportPDF={exportPDF}
        currentDateRange={dateRange}
      />
    </div>
  );
};

export default AdminReportsPage;