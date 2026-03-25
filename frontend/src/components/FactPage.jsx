import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

const EMPTY = { fact_code: '', fact_name: '', remark: '' };

export default function FactPage({ onBack }) {
  const [rows,    setRows]    = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(false);
  const [msg,     setMsg]     = useState({ text: '', type: '' });

  const [showModal, setShowModal] = useState(false);
  const [mode,      setMode]      = useState('add');
  const [form,      setForm]      = useState(EMPTY);
  const [saving,    setSaving]    = useState(false);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  const fetchData = useCallback(async (kw = '') => {
    setLoading(true);
    try {
      const res = await api.get('/api/fact', { params: kw ? { search: kw } : {} });
      setRows(res.data.data || []);
    } catch (err) {
      showMsg(err.response?.data?.message || '讀取失敗', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = () => fetchData(search.trim());

  const openAdd = () => { setForm(EMPTY); setMode('add'); setShowModal(true); };
  const openEdit = (row) => { setForm({ ...row }); setMode('edit'); setShowModal(true); };

  const handleDelete = async (id) => {
    if (!window.confirm(`確定要刪除廠商 ${id} 嗎？`)) return;
    try {
      await api.delete(`/api/fact/${id}`);
      showMsg('刪除成功');
      fetchData(search);
    } catch (err) {
      showMsg(err.response?.data?.message || '刪除失敗', 'error');
    }
  };

  const handleSave = async () => {
    if (!form.fact_code.trim() || !form.fact_name.trim()) {
      showMsg('廠商代碼與名稱為必填欄位', 'error');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'add') {
        await api.post('/api/fact', form);
        showMsg('新增成功');
      } else {
        await api.put(`/api/fact/${form.fact_code}`, form);
        showMsg('修改成功');
      }
      setShowModal(false);
      fetchData(search);
    } catch (err) {
      showMsg(err.response?.data?.message || '儲存失敗', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <button className="btn btn-sm btn-outline-secondary" onClick={onBack}>
          <i className="bi bi-arrow-left me-1"></i>返回
        </button>
        <i className="bi bi-building-fill fs-4 text-success"></i>
        <h4 style={{ color: '#0f9d58' }}>廠商資料維護</h4>
      </div>

      {msg.text && (
        <div className={`alert-bar ${msg.type}`}>
          <i className={`bi ${msg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
          {msg.text}
        </div>
      )}

      <div className="toolbar">
        <input
          type="text"
          className="form-control"
          placeholder="搜尋廠商代碼 / 名稱 / 備註..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          <i className="bi bi-search me-1"></i>查詢
        </button>
        <button className="btn btn-success" onClick={openAdd}>
          <i className="bi bi-plus-circle me-1"></i>新增
        </button>
        <button className="btn btn-outline-secondary" onClick={() => { setSearch(''); fetchData(''); }}>
          <i className="bi bi-arrow-clockwise me-1"></i>重設
        </button>
      </div>

      <div className="data-table-wrap">
        {loading ? (
          <div className="text-center p-4">
            <span className="spinner-border text-success"></span>
            <span className="ms-2">載入中...</span>
          </div>
        ) : (
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>廠商代碼</th>
                <th>廠商名稱</th>
                <th>備註說明</th>
                <th style={{ width: '130px' }} className="text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    <i className="bi bi-inbox fs-4 d-block mb-2"></i>無資料
                  </td>
                </tr>
              ) : rows.map((row) => (
                <tr key={row.fact_code}>
                  <td><span className="badge-code">{row.fact_code}</span></td>
                  <td>{row.fact_name}</td>
                  <td>{row.remark || '-'}</td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(row)}>
                      <i className="bi bi-pencil"></i> 修改
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.fact_code)}>
                      <i className="bi bi-trash"></i> 刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>共 {rows.length} 筆記錄</div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <h5>
              <i className={`bi ${mode === 'add' ? 'bi-plus-circle-fill' : 'bi-pencil-fill'} me-2`}></i>
              {mode === 'add' ? '新增廠商' : '修改廠商'}
            </h5>

            <div className="mb-3">
              <label className="form-label fw-semibold">廠商代碼 <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                value={form.fact_code}
                onChange={(e) => setForm({ ...form, fact_code: e.target.value })}
                disabled={mode === 'edit'}
                maxLength={10}
                placeholder="例：F001"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">廠商名稱 <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                value={form.fact_name}
                onChange={(e) => setForm({ ...form, fact_name: e.target.value })}
                maxLength={100}
                placeholder="請輸入廠商名稱"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">備註說明</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.remark || ''}
                onChange={(e) => setForm({ ...form, remark: e.target.value })}
                maxLength={200}
                placeholder="（選填）"
              />
            </div>

            <div className="modal-footer-btns">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-1"></span>儲存中...</>
                  : <><i className="bi bi-check-lg me-1"></i>儲存</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
