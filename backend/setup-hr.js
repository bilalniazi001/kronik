const { pool } = require('./config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const setupHR = async () => {
    try {
        console.log('--- Starting HR & Leave Types Setup ---');

        // 1. Create HR User
        const hrEmail = 'hr@company.com';
        const hrPassword = 'password123'; // User should change this
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(hrPassword, salt);

        const [existingHR] = await pool.query('SELECT id FROM users WHERE email = ?', [hrEmail]);
        if (existingHR.length === 0) {
            await pool.query(
                `INSERT INTO users (name, email, password, role, designation, department, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                ['HR Admin', hrEmail, hashedPassword, 'hr', 'HR Manager', 'Human Resources', 'active']
            );
            console.log('✔ HR Account created: hr@company.com / password123');
        } else {
            console.log('ℹ HR Account already exists.');
        }

        // 2. Create Default Leave Types
        const leaveTypes = [
            { name: 'Sick Leave', code: 'SL', description: 'Medical leaves' },
            { name: 'Casual Leave', code: 'CL', description: 'Personal reasons' },
            { name: 'Annual Leave', code: 'AL', description: 'Vacation' },
            { name: 'Marriage Leave', code: 'ML', description: 'One-time marriage leave' }
        ];

        for (const lt of leaveTypes) {
            const [existing] = await pool.query('SELECT id FROM leave_types WHERE code = ?', [lt.code]);
            if (existing.length === 0) {
                await pool.query(
                    'INSERT INTO leave_types (name, code, description, is_active) VALUES (?, ?, ?, 1)',
                    [lt.name, lt.code, lt.description]
                );
                console.log(`✔ Leave Type created: ${lt.name}`);
            }
        }

        console.log('--- Setup Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('✘ Setup failed:', error);
        process.exit(1);
    }
};

setupHR();
