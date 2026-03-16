const mysql = require('mysql2/promise');

async function testConn() {
    const configs = [
        { host: 'localhost', user: 'root', password: '', database: 'onesta_db' },
        { host: '127.0.0.1', user: 'root', password: '', database: 'onesta_db' },
        { host: 'localhost', user: 'root', password: 'root', database: 'onesta_db' },
        { host: 'localhost', user: 'root', password: 'password', database: 'onesta_db' },
        { host: 'localhost', user: 'root', password: '123', database: 'onesta_db' }
    ];

    for (let config of configs) {
        console.log('Testing config:', config.user, 'with password:', config.password === '' ? '<blank>' : config.password, 'at:', config.host);
        try {
            const conn = await mysql.createConnection(config);
            console.log('SUCCESS with config:', config);
            await conn.end();
            return;
        } catch (e) {
            console.log('FAILED:', e.message);
        }
    }
}
testConn();
