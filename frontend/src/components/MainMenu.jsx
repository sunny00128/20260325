import React from 'react';

const MENU_ITEMS = [
  {
    key:   'CUST',
    icon:  'bi-people-fill',
    label: '客戶資料維護',
    color: '#1a73e8',
    bg:    '#e8f0fe',
  },
  {
    key:   'FACT',
    icon:  'bi-building-fill',
    label: '廠商資料維護',
    color: '#0f9d58',
    bg:    '#e6f4ea',
  },
  {
    key:   'ITEM',
    icon:  'bi-box-seam-fill',
    label: '商品資料維護',
    color: '#f4b400',
    bg:    '#fef9e7',
  },
  {
    key:   'USER_MGT',
    icon:  'bi-person-badge-fill',
    label: '用戶資料維護',
    color: '#db4437',
    bg:    '#fce8e6',
  },
];

export default function MainMenu({ onNavigate, PAGES }) {
  return (
    <div>
      <div className="page-header">
        <i className="bi bi-grid-3x3-gap-fill fs-4 text-primary"></i>
        <h4>功能選單</h4>
      </div>
      <p className="section-title">請選擇要維護的資料類別：</p>

      <div className="menu-grid">
        {MENU_ITEMS.map((item) => (
          <div
            key={item.key}
            className="menu-card"
            onClick={() => onNavigate(PAGES[item.key])}
            style={{ '--hover-color': item.color }}
          >
            <div
              className="menu-icon"
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: item.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
              }}
            >
              <i
                className={`bi ${item.icon}`}
                style={{ fontSize: '2rem', color: item.color }}
              ></i>
            </div>
            <div className="menu-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
