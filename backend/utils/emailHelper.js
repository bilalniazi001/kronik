const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object using SMTP transport
const createTransporter = async () => {
    // Priority 1: Use actual SMTP settings if provided in .env (even in dev)
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    // Priority 2: In development, fallback to ethereal email
    if (process.env.NODE_ENV === 'development') {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    }

    // Default: Basic production setup (requires EMAIL_USER/PASS)
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

class EmailHelper {
    // Send welcome email to new user
    static async sendWelcomeEmail(userEmail, userName, password) {
        try {
            const transporter = await createTransporter();

            const mailOptions = {
                from: '"Attendly" <noreply@attendly.com>',
                to: userEmail,
                subject: 'Welcome to Attendly - Attendance Management System',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .credentials-box { background: white; padding: 20px; border: 1px dashed #667eea; border-radius: 5px; margin: 20px 0; }
                            .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Welcome to Attendly! 🎉</h1>
                            </div>
                            <div class="content">
                                <h2>Hello ${userName},</h2>
                                <p>Thank you for registering with Attendly - your complete attendance management solution.</p>
                                
                                <div class="credentials-box">
                                    <h3>Your Account Credentials:</h3>
                                    <p><strong>Email:</strong> ${userEmail}</p>
                                    <p><strong>Password:</strong> ${password}</p>
                                </div>

                                <p>Your account has been successfully created. You can now:</p>
                                <ul>
                                    <li>✓ Check-in/out with location tracking</li>
                                    <li>✓ View your attendance reports</li>
                                    <li>✓ Track your working hours</li>
                                </ul>
                                <p>Get started by logging into your account:</p>
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Login to Your Account</a>
                                <p style="margin-top: 30px;">If you have any questions, feel free to contact our support team.</p>
                                <p>Best regards,<br>The Attendly Team</p>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Attendly. All rights reserved.</p>
                                <p>This is an automated message, please do not reply.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const info = await transporter.sendMail(mailOptions);

            // For development, log the ethereal URL
            if (process.env.NODE_ENV === 'development') {
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            }

            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending welcome email:', error);
            return { success: false, error: error.message };
        }
    }

    // Send password reset email
    static async sendPasswordResetEmail(userEmail, userName, resetToken) {
        try {
            const transporter = await createTransporter();

            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

            const mailOptions = {
                from: '"Attendly" <noreply@attendly.com>',
                to: userEmail,
                subject: 'Password Reset Request - Attendly',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .button { display: inline-block; padding: 10px 20px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                            .warning { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
                            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Reset Your Password</h1>
                            </div>
                            <div class="content">
                                <h2>Hello ${userName},</h2>
                                <p>We received a request to reset your password for your Attendly account.</p>
                                
                                <div class="warning">
                                    <strong>⚠️ This password reset link will expire in 1 hour.</strong>
                                </div>
                                
                                <p>Click the button below to reset your password:</p>
                                <a href="${resetLink}" class="button">Reset Password</a>
                                
                                <p style="margin-top: 30px;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                                
                                <p>For security reasons, never share this link with anyone.</p>
                                
                                <p>Best regards,<br>The Attendly Team</p>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Attendly. All rights reserved.</p>
                                <p>This is an automated message, please do not reply.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const info = await transporter.sendMail(mailOptions);

            if (process.env.NODE_ENV === 'development') {
                console.log('Password reset email preview: %s', nodemailer.getTestMessageUrl(info));
            }

            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending password reset email:', error);
            return { success: false, error: error.message };
        }
    }

    // Send attendance reminder email
    static async sendAttendanceReminder(userEmail, userName, type) {
        try {
            const transporter = await createTransporter();

            let subject, content;

            if (type === 'checkin') {
                subject = 'Reminder: Don\'t forget to check in!';
                content = `
                    <p>You haven't checked in yet today. Remember to check in when you start your work day.</p>
                    <p>Checking in helps track your working hours and ensures accurate attendance records.</p>
                `;
            } else if (type === 'checkout') {
                subject = 'Reminder: Don\'t forget to check out!';
                content = `
                    <p>You're still checked in from earlier. Don't forget to check out at the end of your work day.</p>
                    <p>Regular check-out helps maintain accurate attendance records and overtime calculation.</p>
                `;
            }

            const mailOptions = {
                from: '"Attendly" <noreply@attendly.com>',
                to: userEmail,
                subject: subject,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .button { display: inline-block; padding: 10px 20px; background: #4facfe; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Attendance Reminder</h1>
                            </div>
                            <div class="content">
                                <h2>Hello ${userName},</h2>
                                ${content}
                                <p>Click below to access your attendance dashboard:</p>
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
                                <p style="margin-top: 30px;">Thank you for using Attendly!</p>
                                <p>Best regards,<br>The Attendly Team</p>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Attendly. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const info = await transporter.sendMail(mailOptions);

            if (process.env.NODE_ENV === 'development') {
                console.log('Reminder email preview: %s', nodemailer.getTestMessageUrl(info));
            }

            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending reminder email:', error);
            return { success: false, error: error.message };
        }
    }

    // Send monthly report via email
    static async sendMonthlyReport(userEmail, userName, reportData, pdfBuffer) {
        try {
            const transporter = await createTransporter();

            const mailOptions = {
                from: '"Attendly" <reports@attendly.com>',
                to: userEmail,
                subject: `Your Attendance Report - ${reportData.month} ${reportData.year}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .stats { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
                            .stat-item { display: inline-block; width: 45%; margin: 10px 2%; text-align: center; }
                            .stat-value { font-size: 24px; font-weight: bold; color: #43e97b; }
                            .stat-label { font-size: 12px; color: #666; }
                            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Monthly Attendance Report</h1>
                            </div>
                            <div class="content">
                                <h2>Hello ${userName},</h2>
                                <p>Your attendance report for ${reportData.month} ${reportData.year} is ready.</p>
                                
                                <div class="stats">
                                    <h3>Summary</h3>
                                    <div class="stat-item">
                                        <div class="stat-value">${reportData.summary?.total_days || 0}</div>
                                        <div class="stat-label">Total Days</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-value">${reportData.summary?.present_days || 0}</div>
                                        <div class="stat-label">Present</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-value">${reportData.summary?.total_hours || 0}</div>
                                        <div class="stat-label">Hours Worked</div>
                                    </div>
                                    <div class="stat-item">
                                        <div class="stat-value">${reportData.summary?.overtime_hours || 0}</div>
                                        <div class="stat-label">Overtime</div>
                                    </div>
                                </div>
                                
                                <p>Please find the detailed report attached as a PDF.</p>
                                
                                <p>You can also view your complete report online:</p>
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reports" class="button">View Online Report</a>
                                
                                <p style="margin-top: 30px;">Thank you for using Attendly!</p>
                                <p>Best regards,<br>The Attendly Team</p>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Attendly. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
                attachments: [
                    {
                        filename: `attendance_report_${reportData.month}_${reportData.year}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }
                ]
            };

            const info = await transporter.sendMail(mailOptions);

            if (process.env.NODE_ENV === 'development') {
                console.log('Report email preview: %s', nodemailer.getTestMessageUrl(info));
            }

            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending monthly report:', error);
            return { success: false, error: error.message };
        }
    }

    // Send notification to admin (e.g., new user registration)
    static async sendAdminNotification(adminEmail, notificationType, data) {
        try {
            const transporter = await createTransporter();

            let subject, content;

            if (notificationType === 'new_user') {
                subject = 'New User Registration - Attendly';
                content = `
                    <p>A new user has registered on Attendly:</p>
                    <ul>
                        <li><strong>Name:</strong> ${data.userName}</li>
                        <li><strong>Email:</strong> ${data.userEmail}</li>
                        <li><strong>Registration Date:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                `;
            } else if (notificationType === 'leave_request') {
                subject = 'New Leave Request - Attendly';
                content = `
                    <p>A new leave request has been submitted:</p>
                    <ul>
                        <li><strong>Employee:</strong> ${data.userName}</li>
                        <li><strong>Leave Type:</strong> ${data.leaveType}</li>
                        <li><strong>Duration:</strong> ${data.startDate} to ${data.endDate}</li>
                        <li><strong>Reason:</strong> ${data.reason}</li>
                    </ul>
                `;
            }

            const mailOptions = {
                from: '"Attendly System" <system@attendly.com>',
                to: adminEmail,
                subject: subject,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Admin Notification</h1>
                            </div>
                            <div class="content">
                                <h2>Hello Admin,</h2>
                                ${content}
                                <p>Login to the admin panel to take necessary action:</p>
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin" class="button">Go to Admin Panel</a>
                                <p style="margin-top: 30px;">Thank you,<br>The Attendly System</p>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Attendly. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const info = await transporter.sendMail(mailOptions);

            if (process.env.NODE_ENV === 'development') {
                console.log('Admin notification preview: %s', nodemailer.getTestMessageUrl(info));
            }

            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending admin notification:', error);
            return { success: false, error: error.message };
        }
    }

    // Send test email (for configuration testing)
    static async sendTestEmail(testEmail) {
        try {
            const transporter = await createTransporter();

            const mailOptions = {
                from: '"Attendly" <noreply@attendly.com>',
                to: testEmail,
                subject: 'Test Email - Attendly Email Configuration',
                html: `
                    <h1>Email Configuration Test</h1>
                    <p>If you're receiving this email, your email configuration is working correctly!</p>
                    <p>Timestamp: ${new Date().toLocaleString()}</p>
                    <p>Best regards,<br>The Attendly Team</p>
                `
            };

            const info = await transporter.sendMail(mailOptions);

            if (process.env.NODE_ENV === 'development') {
                console.log('Test email preview: %s', nodemailer.getTestMessageUrl(info));
            }

            return {
                success: true,
                messageId: info.messageId,
                previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(info) : null
            };
        } catch (error) {
            console.error('Error sending test email:', error);
            return { success: false, error: error.message };
        }
    }

    // Send leave request status update
    static async sendLeaveStatusEmail(userEmail, userName, leaveData, status) {
        try {
            const transporter = await createTransporter();

            const statusColors = {
                approved: '#28a745',
                rejected: '#dc3545',
                pending: '#ffc107'
            };

            const statusMessages = {
                approved: 'has been APPROVED',
                rejected: 'has been REJECTED',
                pending: 'is still PENDING'
            };

            const mailOptions = {
                from: '"Attendly" <hr@attendly.com>',
                to: userEmail,
                subject: `Leave Request ${status.toUpperCase()} - Attendly`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: ${statusColors[status]}; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .info-box { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
                            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Leave Request Update</h1>
                            </div>
                            <div class="content">
                                <h2>Hello ${userName},</h2>
                                <p>Your leave request ${statusMessages[status]}.</p>
                                
                                <div class="info-box">
                                    <h3>Leave Details:</h3>
                                    <p><strong>Type:</strong> ${leaveData.leaveType}</p>
                                    <p><strong>From:</strong> ${leaveData.startDate}</p>
                                    <p><strong>To:</strong> ${leaveData.endDate}</p>
                                    <p><strong>Days:</strong> ${leaveData.totalDays}</p>
                                    <p><strong>Reason:</strong> ${leaveData.reason}</p>
                                    ${status === 'rejected' && leaveData.rejectionReason ?
                        `<p><strong>Rejection Reason:</strong> ${leaveData.rejectionReason}</p>` : ''}
                                </div>
                                
                                <p>You can view all your leave requests in your dashboard.</p>
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
                                
                                <p style="margin-top: 30px;">Best regards,<br>The HR Team</p>
                            </div>
                            <div class="footer">
                                <p>© ${new Date().getFullYear()} Attendly. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            const info = await transporter.sendMail(mailOptions);

            if (process.env.NODE_ENV === 'development') {
                console.log('Leave status email preview: %s', nodemailer.getTestMessageUrl(info));
            }

            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('Error sending leave status email:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = EmailHelper;