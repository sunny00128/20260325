// ============================================================
// routes/user.js - 用戶資料 CRUD
// GET    /api/user          (optional ?search=)
// POST   /api/user
// PUT    /api/user/:id
// DELETE /api/user/:id
// ============================================================

const express = require('express');
const router  = express.Router();
const { getPool, sql } = require('../db');

// GET /api/user?search=keyword
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    const pool    = await getPool();
    const request = pool.request();

    let query = `SELECT userid, username, pwd FROM [user]`;
    if (search) {
      request.input('search', sql.NVarChar(100), `%${search}%`);
      query += ` WHERE userid LIKE @search OR username LIKE @search`;
    }
    query += ` ORDER BY userid`;

    const result = await request.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('GET /api/user error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/user
router.post('/', async (req, res) => {
  const { userid, username, pwd } = req.body;
  if (!userid || !username || !pwd) {
    return res.status(400).json({ success: false, message: '用戶代碼、用戶名稱、密碼均為必填欄位' });
  }
  try {
    const pool    = await getPool();
    const request = pool.request();
    request.input('userid',   sql.NVarChar(10),  userid.trim());
    request.input('username', sql.NVarChar(100), username.trim());
    request.input('pwd',      sql.NVarChar(100), pwd);

    await request.query(
      `INSERT INTO [user] (userid, username, pwd)
       VALUES (@userid, @username, @pwd)`
    );
    res.json({ success: true, message: '新增成功' });
  } catch (err) {
    if (err.number === 2627) {
      return res.status(409).json({ success: false, message: '用戶代碼已存在' });
    }
    console.error('POST /api/user error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/user/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { username, pwd } = req.body;
  if (!username || !pwd) {
    return res.status(400).json({ success: false, message: '用戶名稱與密碼為必填欄位' });
  }
  try {
    const pool    = await getPool();
    const request = pool.request();
    request.input('userid',   sql.NVarChar(10),  id);
    request.input('username', sql.NVarChar(100), username.trim());
    request.input('pwd',      sql.NVarChar(100), pwd);

    const result = await request.query(
      `UPDATE [user] SET username = @username, pwd = @pwd
       WHERE userid = @userid`
    );
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: '找不到該用戶' });
    }
    res.json({ success: true, message: '修改成功' });
  } catch (err) {
    console.error('PUT /api/user error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/user/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool    = await getPool();
    const request = pool.request();
    request.input('userid', sql.NVarChar(10), id);

    const result = await request.query(
      `DELETE FROM [user] WHERE userid = @userid`
    );
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: '找不到該用戶' });
    }
    res.json({ success: true, message: '刪除成功' });
  } catch (err) {
    console.error('DELETE /api/user error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
