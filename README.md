# 三層式資料維護系統

> React + Node.js/Express + SQL Server 三層式架構

---

## 系統架構

```
tri_sys/
├── sql/
│   └── init.sql              # 建表 & 測試資料 (各50筆)
├── backend/                  # Tier 2: Node.js + Express (port 3001)
│   ├── config/
│   │   └── db.config.js      # DB 連線參數
│   ├── routes/
│   │   ├── auth.js           # POST /api/auth/login
│   │   ├── cust.js           # CRUD /api/cust
│   │   ├── fact.js           # CRUD /api/fact
│   │   ├── item.js           # CRUD /api/item
│   │   └── user.js           # CRUD /api/user
│   ├── db.js                 # mssql 連線池
│   ├── server.js             # Express 入口
│   └── package.json
├── frontend/                 # Tier 1: React (port 3000)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── MainMenu.jsx
│   │   │   ├── CustPage.jsx
│   │   │   ├── FactPage.jsx
│   │   │   ├── ItemPage.jsx
│   │   │   └── UserPage.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── api.js
│   │   └── index.js
│   └── package.json
└── README.md
```

---

## 執行步驟

### Step 1 - 初始化資料庫

使用 SQL Server Management Studio (SSMS) 或 sqlcmd 連線至：

- **Server**: `163.17.141.61,8000`
- **Database**: `gemio03`
- **User**: `nutc03`
- **Password**: `Nutc@2026`

執行 `sql/init.sql` 腳本（會自動建立 4 張資料表，並各插入 50 筆測試資料）：

```bash
sqlcmd -S 163.17.141.61,8000 -d gemio03 -U nutc03 -P Nutc@2026 -i sql/init.sql
```

### Step 2 - 啟動後端

```bash
cd backend
npm install
npm start
# 或開發模式 (hot-reload)：
npm run dev
```

後端將執行於 `http://localhost:3001`

### Step 3 - 啟動前端

```bash
cd frontend
npm install
npm start
```

前端將自動開啟 `http://localhost:3000`

---

## 測試帳號

| 用戶代碼 | 密碼 | 用戶名稱 |
|---------|------|---------|
| U001 | U001 | 系統管理員 |
| U002 | U002 | 王小明 |
| ... | ... | ... |

> 共 50 個測試帳號，密碼與用戶代碼相同

---

## API 清單

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | /api/auth/login | 登入驗證 |
| GET | /api/cust?search= | 查詢客戶 |
| POST | /api/cust | 新增客戶 |
| PUT | /api/cust/:id | 修改客戶 |
| DELETE | /api/cust/:id | 刪除客戶 |
| GET | /api/fact?search= | 查詢廠商 |
| POST | /api/fact | 新增廠商 |
| PUT | /api/fact/:id | 修改廠商 |
| DELETE | /api/fact/:id | 刪除廠商 |
| GET | /api/item?search= | 查詢商品 |
| GET | /api/item/fact-list | 廠商下拉清單 |
| POST | /api/item | 新增商品 |
| PUT | /api/item/:id | 修改商品 |
| DELETE | /api/item/:id | 刪除商品 |
| GET | /api/user?search= | 查詢用戶 |
| POST | /api/user | 新增用戶 |
| PUT | /api/user/:id | 修改用戶 |
| DELETE | /api/user/:id | 刪除用戶 |

---

## Git 設定與推送

```bash
# 進入專案根目錄
cd /path/to/tri_sys

# 初始化 git
git init

# 設定遠端
git remote add origin https://github.com/sunny00128/20260325.git

# 新增 .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
*.log
build/
EOF

# 加入所有檔案
git add .

# 建立初始 commit
git commit -m "feat: initial 3-tier system (React + Express + SQL Server)"

# 推送到 GitHub
git branch -M main
git push -u origin main
```

---

## 注意事項

1. 後端預設 port 為 **3001**；前端預設 port 為 **3000**
2. 確保 SQL Server 允許 TCP/IP 連線，且防火牆開放 port 8000
3. `item` 資料表的 `fact_code` 為外鍵，刪除廠商前請先移除對應商品
4. 密碼以明文儲存（依規格要求，不加密）
