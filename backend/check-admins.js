const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAdmin() {
    console.log('Using DB_HOST:', process.env.DB_HOST);
    console.log('Using DB_USER:', process.env.DB_USER);
    console.log('Using DB_NAME:', process.env.DB_NAME);

    try {
        const pool = await mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [rows] = await pool.query('SELECT id, name, email, password, role FROM admins');
        console.log('Admins found:', rows.length);
        if (rows.length > 0) {
            console.log('Admin Users List:');
            rows.forEach(admin => {
                const isHashed = admin.password && (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$'));
                console.log(`- ID: ${admin.id}, Email: ${admin.email}, Role: ${admin.role}, Hashed: ${isHashed} (${admin.password.substring(0, 10)}...)`);
            });
        } else {
            console.log('No admins found in table "admins".');
        }

        await pool.end();
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

checkAdmin();
