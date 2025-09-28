const mysql = require("mysql2/promise")
require("dotenv").config()

// สร้าง connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pet_health_assistant",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: "utf8mb4",
  timezone: "+07:00",
})

// ฟังก์ชันทดสอบการเชื่อมต่อ
const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log("✅ Database connected successfully")
    console.log(`📊 Connected to: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT}`)
    connection.release()
  } catch (error) {
    console.error("❌ Database connection failed:", error.message)
    process.exit(1)
  }
}

// ฟังก์ชันสำหรับ transaction
const withTransaction = async (callback) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

module.exports = {
  pool,
  testConnection,
  withTransaction,
}
