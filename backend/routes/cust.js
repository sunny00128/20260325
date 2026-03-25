// ============================================================
// routes/cust.js - 客戶資料 CRUD
// GET    /api/cust          (optional ?search=)
// POST   /api/cust
// PUT    /api/cust/:id
// DELETE /api/cust/:id
// ============================================================

const express = require('express');
const router  = express.Router();
const { getPool, sql } = require('../db');

// GET /api/cust?search=keyword
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    const pool    = await getPool();
    const request = pool.request();

    let query = `SELECT cust_code, cust_name, remark FROM cust`;
    if (search) {
      request.input('search', sql.NVarChar(100), `%${search}%`);
      query += ` WHERE cust_code LIKE @search OR cust_name LIKE @search OR remark LIKE @search`;
    }
    query += ` ORDER BY cust_code`;

    const result = await request.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('GET /api/cust error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/cust
router.post('/', async (req, res) => {
  const { cust_code, cust_name, remark } = req.body;
  if (!cust_code || !cust_name) {
    return res.status(400).json({ success: false, message: '客戶代碼與客戶名稱為必填欄位' });
  }
  try {
    const pool    = await getPool();
    const request = pool.request();
    request.input('cust_code', sql.NVarChar(10),  cust_code.trim());
    request.input('cust_name', sql.NVarChar(100), cust_name.trim());
    request.input('remark',    sql.NVarChar(200), remark ? remark.trim() : null);

    await request.query(
      `INSERT INTO cust (cust_code, cust_name, remark)
       VALUES (@cust_code, @cust_name, @remark)`
    );
    res.json({ success: true, message: '新增成功' });
  } catch (err) {
    if (err.number === 2627) {
      return res.status(409).json({ success: false, message: '客戶代碼已存在' });
    }
    console.error('POST /api/cust error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/cust/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { cust_name, remark } = req.body;
  if (!cust_name) {
    return res.status(400).json({ success: false, message: '客戶名稱為必填欄位' });
  }
  try {
    const pool    = await getPool();
    const request = pool.request();
    request.input('cust_code', sql.NVarChar(10),  id);
    request.input('cust_name', sql.NVarChar(100), cust_name.trim());
    request.input('remark',    sql.NVarChar(200), remark ? remark.trim() : null);

    const result = await request.query(
      `UPDATE cust SET cust_name = @cust_name, remark = @remark
       WHERE cust_code = @cust_code`
    );
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: '找不到該客戶' });
    }
    res.json({ success: true, message: '修改成功' });
  } catch (err) {
    console.error('PUT /api/cust error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/cust/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool    = await getPool();
    const request = pool.request();
    request.input('cust_code', sql.NVarChar(10), id);

    const result = await request.query(
      `DELETE FROM cust WHERE cust_code = @cust_code`
    );
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: '找不到該客戶' });
    }
    res.json({ success: true, message: '刪除成功' });
  } catch (err) {
    console.error('DELETE /api/cust error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
