// ============================================================
// Database Configuration
// SQL Server: 163.17.141.61,8000  /  gemio03
// ============================================================

const dbConfig = {
  server: '163.17.141.61',
  port: 8000,
  database: 'gemio03',
  user: 'nutc03',
  password: 'Nutc@2026',
  options: {
    encrypt: false,            // set true if using Azure
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

module.exports = dbConfig;
