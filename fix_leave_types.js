const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function checkAndFixLeaveTypes() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Checking current leave types...');
        const [rows] = await connection.query('SELECT * FROM leave_types');
        console.log('Current types:', rows);

        const requiredTypes = [
            { name: 'Medical Leave', code: 'SL', description: 'Sick or medical leave' },
            { name: 'Casual Leave', code: 'CL', description: 'Personal or casual leave' },
            { name: 'Annual Leave', code: 'AL', description: 'Yearly paid vacation' },
            { name: 'Public Leave', code: 'PL', description: 'Gazetted holidays or public leave' },
            { name: 'Half Day Leave', code: 'HDL', description: 'Specific half day quota' }
        ];

        for (const type of requiredTypes) {
            console.log(`Ensuring ${type.name} exists...`);
            await connection.query(`
                INSERT INTO leave_types (name, code, description, is_active) 
                VALUES (?, ?, ?, 1)
                ON DUPLICATE KEY UPDATE name = ?, description = ?, is_active = 1
            `, [type.name, type.code, type.description, type.name, type.description]);
        }

        console.log('Successfully checked and fixed leave types.');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        if (connection) await connection.end();
        process.exit(1);
    }
}

checkAndFixLeaveTypes();
