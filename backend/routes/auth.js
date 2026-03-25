// ============================================================
// routes/auth.js - Authentication
// POST /api/auth/login
// ============================================================

const express = require('express');
const router  = express.Router();
const { getPool, sql } = require('../db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { userid, pwd } = req.body;

  if (!userid || !pwd) {
    return res.status(400).json({ success: false, message: '請輸入用戶代碼與密碼' });
  }

  try {
    const pool    = await getPool();
    const request = pool.request();
    request.input('userid', sql.NVarChar(10),  userid.trim());
    request.input('pwd',    sql.NVarChar(100), pwd);

    const result = await request.query(
      `SELECT userid, username FROM [user]
       WHERE userid = @userid AND pwd = @pwd`
    );

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: '用戶代碼或密碼錯誤' });
    }

    const user = result.recordset[0];
    return res.json({ success: true, userid: user.userid, username: user.username });
  } catch (err) {
    console.error('/api/auth/login error:', err.message);
    return res.status(500).json({ success: false, message: '伺服器錯誤' });
  }
});

module.exports = router;
