import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const pdfHelper = {
  generateAttendanceReport: (userData, attendanceData, dateRange) => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.setTextColor(33, 33, 33);
    doc.text('Attendly - Attendance Report', 14, 22);

    // Add company info
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Attendance Management System', 14, 30);

    // Add user info
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.text(`Employee: ${userData.name}`, 14, 45);
    doc.text(`CNIC: ${userData.cnic}`, 14, 52);
    doc.text(`Period: ${dateRange.start} to ${dateRange.end}`, 14, 59);

    // Add summary
    const summary = attendanceData.summary || {};
    doc.text(`Summary:`, 14, 74);
    doc.setFontSize(10);
    doc.text(`Total Days: ${summary.total_days || 0}`, 20, 82);
    doc.text(`Present: ${summary.present_days || 0}`, 20, 89);
    doc.text(`Incomplete: ${summary.incomplete_days || 0}`, 20, 96);
    doc.text(`Total Hours: ${summary.total_hours || 0}`, 20, 103);

    // Add table
    const tableColumn = ['Date', 'Check In', 'Check Out', 'Hours', 'Status'];
    const tableRows = [];

    attendanceData.attendance?.forEach((record) => {
      const row = [
        new Date(record.date).toLocaleDateString(),
        record.check_in_time || '-',
        record.check_out_time || '-',
        record.hours_worked || '-',
        record.status === 'completed' ? 'Present' : 
        record.status === 'checked_in' ? 'Incomplete' : 'Absent',
      ];
      tableRows.push(row);
    });

    doc.autoTable({
      startY: 115,
      head: [tableColumn],
      body: tableRows,
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    const filename = `Attendance_${userData.name}_${dateRange.start}_to_${dateRange.end}.pdf`;
    doc.save(filename);
  },

  generateUserProfile: (user, documents) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(33, 33, 33);
    doc.text('User Profile', 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.text(`Name: ${user.name}`, 14, 40);
    doc.text(`Email: ${user.email}`, 14, 47);
    doc.text(`Phone: ${user.phone}`, 14, 54);
    doc.text(`CNIC: ${user.cnic}`, 14, 61);
    doc.text(`Address: ${user.address || 'N/A'}`, 14, 68);
    doc.text(`Member Since: ${new Date(user.created_at).toLocaleDateString()}`, 14, 75);

    if (documents && documents.length > 0) {
      doc.text('Uploaded Documents:', 14, 90);

      const docColumn = ['#', 'File Name', 'Type', 'Size', 'Uploaded'];
      const docRows = [];

      documents.forEach((doc, index) => {
        const row = [
          index + 1,
          doc.file_name,
          doc.file_type || '-',
          doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : '-',
          new Date(doc.uploaded_at).toLocaleDateString(),
        ];
        docRows.push(row);
      });

      doc.autoTable({
        startY: 95,
        head: [docColumn],
        body: docRows,
        theme: 'striped',
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
      });
    }

    doc.save(`Profile_${user.name}.pdf`);
  },
};