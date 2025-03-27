const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "vrcuser",
  password: process.env.DB_PASSWORD || "vrcpassword",
  database: process.env.DB_NAME || "vrc",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z",
});

const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log("Database connection established successfully");
    connection.release();
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
};

testConnection();

module.exports = db;
