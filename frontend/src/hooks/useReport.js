import { useState, useCallback } from 'react';
import userService from '../services/userService';
import adminService from '../services/adminService';
import { useAlert } from './useAlert';

export const useReport = (isAdmin = false) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const { showError } = useAlert();

  const fetchReports = useCallback(async (startDate, endDate, userId = null) => {
    setLoading(true);
    try {
      let response;
      if (isAdmin) {
        response = await adminService.getReports(startDate, endDate, userId);
        setReports(response.reports);
      } else {
        response = await userService.getReports(startDate, endDate);
        setReports(response.attendance);
        setSummary(response.summary);
      }
      return response;
    } catch (error) {
      showError(error.message || 'Failed to fetch reports');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAdmin, showError]);

  const exportPDF = useCallback((userData, dateRange, customReports = null) => {
    import('jspdf').then(({ default: jsPDF }) => {
      import('jspdf-autotable').then(({ default: autoTable }) => {
        const doc = new jsPDF();
        const dataToExport = customReports || reports;

        // Add Header
        doc.setFontSize(20);
        doc.setTextColor(79, 70, 229); // Indigo-600
        doc.text('Attendance Report', 105, 15, { align: 'center' });

        // Add User Info
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Gray-500
        doc.text(`Employee: ${userData?.name || 'User'}`, 14, 25);
        doc.text(`Period: ${dateRange.start} - ${dateRange.end}`, 14, 30);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);

        // Add Summary if available
        if (summary && !customReports) {
          doc.setFontSize(12);
          doc.setTextColor(30, 41, 59); // Gray-800
          doc.text('Summary', 14, 45);
          doc.setFontSize(10);
          doc.text(`Total Days: ${summary.total_days}`, 14, 52);
          doc.text(`Present: ${summary.present_days}`, 60, 52);
          doc.text(`Total Hours: ${summary.total_hours}h`, 110, 52);
        }

        const formatTime = (timeStr) => {
          if (!timeStr) return '-';
          try {
            const [hours, minutes] = timeStr.split(':');
            const h = parseInt(hours);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${minutes} ${ampm}`;
          } catch {
            return timeStr;
          }
        };

        const tableColumn = ["Date", "Check In", "Check Out", "Status", "Hours"];
        const tableRows = dataToExport.map(report => [
          new Date(report.date).toLocaleDateString(),
          formatTime(report.check_in_time),
          formatTime(report.check_out_time),
          report.status.charAt(0).toUpperCase() + report.status.slice(1).replace('_', ' '),
          report.hours_worked || '-'
        ]);

        // Use autoTable directly instead of doc.autoTable if it's not being attached
        (doc.autoTable || autoTable)(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: (summary && !customReports) ? 60 : 45,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229] },
          margin: { top: 20 },
        });

        doc.save(`Attendance_Report_${dateRange.start.replace(/\//g, '-')}.pdf`);
      });
    });
  }, [reports, summary]);

  const exportCSV = useCallback((data) => {
    console.log('Exporting CSV...', data);
  }, []);

  return {
    reports,
    loading,
    summary,
    fetchReports,
    exportPDF,
    exportCSV
  };
};