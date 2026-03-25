// ============================================================
// routes/item.js - 商品資料 CRUD
// GET    /api/item           (optional ?search=)
// GET    /api/item/fact-list (all facts for dropdown)
// POST   /api/item
// PUT    /api/item/:id
// DELETE /api/item/:id
// ============================================================

const express = require('express');
const router  = express.Router();
const { getPool, sql } = require('../db');

// GET /api/item/fact-list - all facts for dropdown
router.get('/fact-list', async (_req, res) => {
  try {
    const pool   = await getPool();
    const result = await pool.request().query(
      `SELECT fact_code, fact_name FROM fact ORDER BY fact_code`
    );
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('GET /api/item/fact-list error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/item?search=keyword
router.get('/', async (req, res) => {
  const { search } = req.query;
  try {
    const pool    = await getPool();
    const request = pool.request();

    let query = `
      SELECT i.item_code, i.item_name, i.fact_code, f.fact_name
      FROM item i
      LEFT JOIN fact f ON i.fact_code = f.fact_code`;

    if (search) {
      request.input('search', sql.NVarChar(100), `%${search}%`);
      query += ` WHERE i.item_code LIKE @search OR i.item_name LIKE @search OR i.fact_code LIKE @search`;
    }
    query += ` ORDER BY i.item_code`;

    const result = await request.query(query);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('GET /api/item error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/item
router.post('/', async (req, res) => {
  const { item_code, item_name, fact_code } = req.body;
  if (!item_code || !item_name) {
    return res.status(400).json({ success: false, message: '商品代碼與商品名稱為必填欄位' });
  }
  try {
    const pool    = await getPool();
    const request = pool.request();
    request.input('item_code', sql.NVarChar(10),  item_code.trim());
    request.input('item_name', sql.NVarChar(100), item_name.trim());
    request.input('fact_code', sql.NVarChar(10),  fact_code ? fact_code.trim() : null);

    await request.query(
      `INSERT INTO item (item_code, item_name, fact_code)
       VALUES (@item_code, @item_name, @fact_code)`
    );
    res.json({ success: true, message: '新增成功' });
  } catch (err) {
    if (err.number === 2627) {
      return res.status(409).json({ success: false, message: '商品代碼已存在' });
    }
    console.error('POST /api/item error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/item/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { item_name, fact_code } = req.body;
  if (!item_name) {
    return res.status(400).json({ success: false, message: '商品名稱為必填欄位' });
  }
  try {
    const pool    = await getPool();
    const request = pool.request();
    request.input('item_code', sql.NVarChar(10),  id);
    request.input('item_name', sql.NVarChar(100), item_name.trim());
    request.input('fact_code', sql.NVarChar(10),  fact_code ? fact_code.trim() : null);

    const result = await request.query(
      `UPDATE item SET item_name = @item_name, fact_code = @fact_code
       WHERE item_code = @item_code`
    );
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: '找不到該商品' });
    }
    res.json({ success: true, message: '修改成功' });
  } catch (err) {
    console.error('PUT /api/item error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/item/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool    = await getPool();
    const request = pool.request();
    request.input('item_code', sql.NVarChar(10), id);

    const result = await request.query(
      `DELETE FROM item WHERE item_code = @item_code`
    );
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: '找不到該商品' });
    }
    res.json({ success: true, message: '刪除成功' });
  } catch (err) {
    console.error('DELETE /api/item error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
