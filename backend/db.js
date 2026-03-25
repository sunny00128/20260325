// ============================================================
// db.js - MSSQL Connection Pool Module
// ============================================================

const sql = require('mssql');
const dbConfig = require('./config/db.config');

let pool = null;

/**
 * Get (or create) the shared connection pool.
 * @returns {Promise<sql.ConnectionPool>}
 */
async function getPool() {
  if (pool && pool.connected) {
    return pool;
  }
  try {
    pool = await sql.connect(dbConfig);
    console.log('✔ Connected to SQL Server:', dbConfig.server, '/', dbConfig.database);
    return pool;
  } catch (err) {
    console.error('✘ DB connection error:', err.message);
    throw err;
  }
}

module.exports = { getPool, sql };
