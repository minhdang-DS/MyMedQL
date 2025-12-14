const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Database connection pool configuration
 * Uses environment variables for connection details
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'MyMedQL',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  timezone: '+00:00', // Store timestamps in UTC
});

/**
 * Test database connection
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Database connection established');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

/**
 * Execute a query with parameters (prevents SQL injection)
 * @param {string} query - SQL query with placeholders (?)
 * @param {Array} params - Parameters for the query
 * @returns {Promise} Query result
 */
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute a query and return the first row
 * @param {string} query - SQL query with placeholders (?)
 * @param {Array} params - Parameters for the query
 * @returns {Promise<Object|null>} First row or null
 */
async function queryOne(sql, params = []) {
  const results = await query(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Execute a stored procedure
 * @param {string} procedureName - Name of the stored procedure
 * @param {Array} params - Parameters for the procedure
 * @returns {Promise} Procedure result
 */
async function callProcedure(procedureName, params = []) {
  const placeholders = params.map(() => '?').join(',');
  const sql = `CALL ${procedureName}(${placeholders})`;
  const [results] = await pool.execute(sql, params);
  // Stored procedures return results in an array, typically we want the first set
  return Array.isArray(results[0]) ? results[0] : results;
}

/**
 * Begin a transaction
 * @returns {Promise<Connection>} Connection with active transaction
 */
async function beginTransaction() {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
}

/**
 * Commit a transaction
 * @param {Connection} connection - Transaction connection
 */
async function commitTransaction(connection) {
  await connection.commit();
  connection.release();
}

/**
 * Rollback a transaction
 * @param {Connection} connection - Transaction connection
 */
async function rollbackTransaction(connection) {
  await connection.rollback();
  connection.release();
}

module.exports = {
  pool,
  query,
  queryOne,
  callProcedure,
  beginTransaction,
  commitTransaction,
  rollbackTransaction,
  testConnection,
};
