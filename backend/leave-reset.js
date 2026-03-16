const { pool } = require('./config/database');
require('dotenv').config();

const resetLeaves = async () => {
    try {
        console.log('--- Starting Yearly Leave Reset ---');
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;

        // 1. Mark expired balances (Phase 4 Step 4)
        // In a real system, you might carry forward some, but FSD says "Auto-expiry of leaves".
        // We'll mark current balances as inactive or just create new ones for next year.

        // Let's find all active users
        const [users] = await pool.query('SELECT id FROM users WHERE status = "active"');

        // Get standard leave types and their base allocation (from somewhere, or just use defaults)
        const [leaveTypes] = await pool.query('SELECT id FROM leave_types WHERE is_active = 1');

        for (const user of users) {
            for (const lt of leaveTypes) {
                // Check if balance already exists for next year
                const [existing] = await pool.query(
                    'SELECT id FROM employee_leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?',
                    [user.id, lt.id, nextYear]
                );

                if (existing.length === 0) {
                    // Get current allocation as default or 0
                    const [current] = await pool.query(
                        'SELECT total_allocated FROM employee_leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = ?',
                        [user.id, lt.id, currentYear]
                    );

                    const allocated = current.length > 0 ? current[0].total_allocated : 0;

                    await pool.query(
                        `INSERT INTO employee_leave_balances 
                         (employee_id, leave_type_id, total_allocated, used, pending, remaining, year) 
                         VALUES (?, ?, ?, 0, 0, ?, ?)`,
                        [user.id, lt.id, allocated, allocated, nextYear]
                    );
                }
            }
        }

        console.log(`✔ Leave balances initialized/reset for year ${nextYear}`);
        console.log('--- Reset Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('✘ Reset failed:', error);
        process.exit(1);
    }
};

resetLeaves();
