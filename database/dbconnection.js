const mysql = require("mysql2");
const util = require("util");
require("dotenv").config();

const pool = mysql.createPool({
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    multipleStatements: true,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query);

module.exports = pool;
