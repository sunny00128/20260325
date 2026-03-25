import React, { useState } from 'react';
import api from '../api';

export default function Login({ onLogin }) {
  const [form, setForm]     = useState({ userid: '', pwd: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userid.trim() || !form.pwd) {
      setError('請輸入用戶代碼與密碼');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', form);
      if (res.data.success) {
        onLogin({ userid: res.data.userid, username: res.data.username });
      } else {
        setError(res.data.message || '登入失敗');
      }
    } catch (err) {
      setError(err.response?.data?.message || '連線失敗，請檢查後端伺服器');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-logo">
          <i className="bi bi-database-fill-gear"></i>
          <h2>三層式資料維護系統</h2>
          <p>請登入您的帳號以繼續</p>
        </div>

        {error && (
          <div className="alert-bar error">
            <i className="bi bi-exclamation-circle-fill"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="bi bi-person me-1"></i>用戶代碼
            </label>
            <input
              type="text"
              className="form-control"
              name="userid"
              value={form.userid}
              onChange={handleChange}
              placeholder="請輸入用戶代碼"
              autoFocus
              maxLength={10}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              <i className="bi bi-lock me-1"></i>用戶密碼
            </label>
            <input
              type="password"
              className="form-control"
              name="pwd"
              value={form.pwd}
              onChange={handleChange}
              placeholder="請輸入密碼"
              maxLength={100}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2"></span>登入中...</>
              : <><i className="bi bi-box-arrow-in-right me-2"></i>登 入</>
            }
          </button>
        </form>

        <p className="text-center text-muted mt-3" style={{ fontSize: '0.8rem' }}>
          測試帳號：U001 / U001
        </p>
      </div>
    </div>
  );
}
