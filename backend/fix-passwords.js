const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixPasswords() {
    try {
        const pool = await mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [rows] = await pool.query('SELECT id, email, password FROM admins');

        for (let admin of rows) {
            const isHashed = admin.password && (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$'));
            if (!isHashed) {
                console.log(`Hashing password for: ${admin.email}`);
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(admin.password, salt);

                await pool.query('UPDATE admins SET password = ? WHERE id = ?', [hashedPassword, admin.id]);
                console.log(`SUCCESS: Password updated for ${admin.email}`);
            } else {
                console.log(`ALREADY HASHED: ${admin.email}`);
            }
        }

        await pool.end();
    } catch (e) {
        console.error('ERROR:', e.message);
    }
}

fixPasswords();
