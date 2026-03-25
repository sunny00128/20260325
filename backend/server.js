// ============================================================
// server.js - Express Application Entry Point
// ============================================================

const express = require('express');
const cors    = require('cors');
const { getPool } = require('./db');

const authRouter = require('./routes/auth');
const custRouter = require('./routes/cust');
const factRouter = require('./routes/fact');
const itemRouter = require('./routes/item');
const userRouter = require('./routes/user');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/cust', custRouter);
app.use('/api/fact', factRouter);
app.use('/api/item', itemRouter);
app.use('/api/user', userRouter);

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: err.message || 'Server error' });
});

// ── Start server after DB pool is ready ──────────────────────
getPool()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB, server not started.', err.message);
    process.exit(1);
  });
