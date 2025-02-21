const mysql = require('mysql2/promise');

// TODO: Update config management to use environment variables
const db = mysql.createPool({
  host: 'localhost', 
  user: 'vrcuser',
  password: 'vrcpassword',
  database: 'vrc',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;