// ============================================================
// routes/fact.js - 廠商資料 CRUD
// GET    /api/fact          (optional ?search=)
// POST   /api/fact
// PUT    /api/fact/:id
// DELETE /api/fact/:id
// ============================================================

const express = require('express');
const router  = express.Router();
const { getPool, sql } = require('../db');

// GET /api/fact?search=keyword
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    const pool    = await getPool();
    const request = pool.request();

    let query = `SELECT fact_code, fact_name, remark FROM fact`;
    if (search) {
      request.input('search', sql.NVarChar(100), `%${search}%`);
      query += ` WHERE fact_code LIKE @search OR fact_name LIKE @search OR remark LIKE @search`;
    }
    query += ` ORDER BY fact_code`;

    const result = await request.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('GET /api/fact error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/fact
router.post('/', async (req, res) => {
  const { fact_code, fact_name, remark } = req.body;
  if (!fact_code || !fact_name) {
    return res.status(400).json({ success: false, message: '廠商代碼與廠商名稱為必填欄位' });
  }
  try {
    const pool    = await getPool();
    const request = pool.request();
    request.input('fact_code', sql.NVarChar(10),  fact_code.trim());
    request.input('fact_name', sql.NVarChar(100), fact_name.trim());
    request.input('remark',    sql.NVarChar(200), remark ? remark.trim() : null);

    await request.query(
      `INSERT INTO fact (fact_code, fact_name, remark)
       VALUES (@fact_code, @fact_name, @remark)`
    );
    res.json({ success: true, message: '新增成功' });
  } catch (err) {
    if (err.number === 2627) {
      return res.status(409).json({ success: false, message: '廠商代碼已存在' });
    }
    console.error('POST /api/fact error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/fact/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { fact_name, remark } = req.body;
  if (!fact_name) {
    return res.status(400).json({ success: false, message: '廠商名稱為必填欄位' });
  }
  try {
    const pool    = await getPool();
    const request = pool.request();
    request.input('fact_code', sql.NVarChar(10),  id);
    request.input('fact_name', sql.NVarChar(100), fact_name.trim());
    request.input('remark',    sql.NVarChar(200), remark ? remark.trim() : null);

    const result = await request.query(
      `UPDATE fact SET fact_name = @fact_name, remark = @remark
       WHERE fact_code = @fact_code`
    );
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: '找不到該廠商' });
    }
    res.json({ success: true, message: '修改成功' });
  } catch (err) {
    console.error('PUT /api/fact error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/fact/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool    = await getPool();
    const request = pool.request();
    request.input('fact_code', sql.NVarChar(10), id);

    const result = await request.query(
      `DELETE FROM fact WHERE fact_code = @fact_code`
    );
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: '找不到該廠商' });
    }
    res.json({ success: true, message: '刪除成功' });
  } catch (err) {
    // FK violation
    if (err.number === 547) {
      return res.status(409).json({ success: false, message: '此廠商已被商品資料引用，無法刪除' });
    }
    console.error('DELETE /api/fact error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
