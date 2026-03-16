const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
    // Generate attendance report PDF
    static async generateAttendanceReport(userData, attendanceData, dateRange) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const chunks = [];

                // Collect PDF data chunks
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                // Add company logo/header
                doc.fontSize(20).text('Attendly', { align: 'center' });
                doc.fontSize(12).text('Attendance Management System', { align: 'center' });
                doc.moveDown();

                // Add report title
                doc.fontSize(16).text('Attendance Report', { align: 'center' });
                doc.moveDown();

                // Add user information
                doc.fontSize(12).text(`Employee: ${userData.name}`);
                doc.text(`CNIC: ${userData.cnic}`);
                doc.text(`Email: ${userData.email}`);
                doc.text(`Period: ${dateRange.start} to ${dateRange.end}`);
                doc.moveDown();

                // Add summary
                const summary = attendanceData.summary || {};
                doc.fontSize(12).text('Summary:', { underline: true });
                doc.text(`Total Days: ${summary.total_days || 0}`);
                doc.text(`Present: ${summary.present_days || 0}`);
                doc.text(`Incomplete: ${summary.incomplete_days || 0}`);
                doc.text(`Total Hours: ${summary.total_hours || 0}`);
                doc.moveDown();

                // Add attendance table
                doc.fontSize(12).text('Detailed Attendance:', { underline: true });
                doc.moveDown();

                // Table headers
                const tableTop = doc.y;
                const col1 = 50;
                const col2 = 120;
                const col3 = 200;
                const col4 = 280;
                const col5 = 360;

                doc.font('Helvetica-Bold');
                doc.text('Date', col1, tableTop);
                doc.text('Check In', col2, tableTop);
                doc.text('Check Out', col3, tableTop);
                doc.text('Hours', col4, tableTop);
                doc.text('Status', col5, tableTop);
                doc.font('Helvetica');

                // Table rows
                let y = tableTop + 20;
                attendanceData.attendance.forEach((record, index) => {
                    if (y > 700) { // Add new page if needed
                        doc.addPage();
                        y = 50;
                        
                        // Repeat headers on new page
                        doc.font('Helvetica-Bold');
                        doc.text('Date', col1, y);
                        doc.text('Check In', col2, y);
                        doc.text('Check Out', col3, y);
                        doc.text('Hours', col4, y);
                        doc.text('Status', col5, y);
                        doc.font('Helvetica');
                        y += 20;
                    }

                    doc.text(record.date || '-', col1, y);
                    doc.text(record.check_in_time || '-', col2, y);
                    doc.text(record.check_out_time || '-', col3, y);
                    doc.text(record.hours_worked || '-', col4, y);
                    
                    // Color code status
                    if (record.status === 'completed') {
                        doc.fillColor('green').text('Present', col5, y);
                    } else if (record.status === 'checked_in') {
                        doc.fillColor('orange').text('Incomplete', col5, y);
                    } else {
                        doc.fillColor('red').text('Absent', col5, y);
                    }
                    doc.fillColor('black');
                    
                    y += 20;
                });

                // Add footer
                doc.moveDown(2);
                doc.fontSize(10).text(
                    `Generated on: ${new Date().toLocaleString()}`,
                    50,
                    doc.page.height - 50,
                    { align: 'center' }
                );

                doc.end();

            } catch (error) {
                reject(error);
            }
        });
    }

    // Generate user profile PDF
    static async generateUserProfile(user, documents) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                // Header
                doc.fontSize(20).text('User Profile', { align: 'center' });
                doc.moveDown();

                // Profile image placeholder
                doc.rect(50, doc.y, 100, 100).stroke();
                doc.text('Profile Image', 70, doc.y + 40);
                doc.moveDown(6);

                // User details
                doc.fontSize(12).text(`Name: ${user.name}`);
                doc.text(`Email: ${user.email}`);
                doc.text(`Phone: ${user.phone}`);
                doc.text(`CNIC: ${user.cnic}`);
                doc.text(`Address: ${user.address || 'N/A'}`);
                doc.text(`Member Since: ${new Date(user.created_at).toLocaleDateString()}`);
                doc.moveDown();

                // Documents list
                if (documents && documents.length > 0) {
                    doc.text('Uploaded Documents:', { underline: true });
                    doc.moveDown();
                    
                    documents.forEach((doc, index) => {
                        doc.text(`${index + 1}. ${doc.file_name} (${Math.round(doc.file_size / 1024)} KB)`);
                    });
                }

                doc.end();

            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = PDFGenerator;