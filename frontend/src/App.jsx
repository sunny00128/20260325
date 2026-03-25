import React, { useState } from 'react';
import Login    from './components/Login';
import MainMenu from './components/MainMenu';
import CustPage from './components/CustPage';
import FactPage from './components/FactPage';
import ItemPage from './components/ItemPage';
import UserPage from './components/UserPage';
import './App.css';

const PAGES = {
  LOGIN:    'LOGIN',
  MAIN:     'MAIN',
  CUST:     'CUST',
  FACT:     'FACT',
  ITEM:     'ITEM',
  USER_MGT: 'USER_MGT',
};

export default function App() {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('tri_user')); }
    catch { return null; }
  })();

  const [page, setPage] = useState(storedUser ? PAGES.MAIN : PAGES.LOGIN);
  const [user, setUser] = useState(storedUser);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('tri_user', JSON.stringify(userData));
    setPage(PAGES.MAIN);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('tri_user');
    setPage(PAGES.LOGIN);
  };

  const navigate = (target) => setPage(target);

  if (page === PAGES.LOGIN) return <Login onLogin={handleLogin} />;

  return (
    <div className="app-shell">
      {/* Top navbar */}
      <nav className="top-nav">
        <span className="top-nav-title">
          <i className="bi bi-database-fill-gear me-2"></i>
          三層式資料維護系統
        </span>
        <div className="top-nav-user">
          <i className="bi bi-person-circle me-1"></i>
          {user?.username || user?.userid}
          <button className="btn btn-sm btn-outline-light ms-3" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1"></i>登出
          </button>
        </div>
      </nav>

      <div className="app-body">
        {page === PAGES.MAIN && (
          <MainMenu onNavigate={navigate} PAGES={PAGES} />
        )}
        {page === PAGES.CUST && (
          <CustPage onBack={() => navigate(PAGES.MAIN)} />
        )}
        {page === PAGES.FACT && (
          <FactPage onBack={() => navigate(PAGES.MAIN)} />
        )}
        {page === PAGES.ITEM && (
          <ItemPage onBack={() => navigate(PAGES.MAIN)} />
        )}
        {page === PAGES.USER_MGT && (
          <UserPage onBack={() => navigate(PAGES.MAIN)} />
        )}
      </div>
    </div>
  );
}
