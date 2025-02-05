const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const sql = require('mssql');

const sqlServerConnection = {
    user: process.env.SQL_SERVER_USER,
    password: process.env.SQL_SERVER_PASSWORD,
    server: process.env.SQL_SERVER_HOST, 
    database: process.env.SQL_SERVER_DATABASE,
    port: parseInt(process.env.SQL_SERVER_PORT) || 1433, 
    options: {
        encrypt: true, 
        trustServerCertificate: true
    }
};

async function getSqlServerConnection() {
    try {
        const pool = await sql.connect(sqlServerConnection);
        return pool;
    } catch (err) {
        console.error('Error connecting to SQL Server:', err);
        throw err;
    }
}

module.exports = getSqlServerConnection;