import streamlit as st
import pandas as pd
from db import get_conn


def to_df(rows, columns):
    return pd.DataFrame([tuple(r) for r in rows], columns=columns)

st.set_page_config(page_title="三層式資料維護系統", page_icon="🏢", layout="wide")

# ── 登入 ──────────────────────────────────────────────────
def login_page():
    st.title("🏢 三層式資料維護系統")
    st.markdown("---")
    col1, col2, col3 = st.columns([1, 1, 1])
    with col2:
        st.subheader("登入")
        userid = st.text_input("用戶代碼", key="login_userid")
        pwd = st.text_input("用戶密碼", type="password", key="login_pwd")
        if st.button("登入", use_container_width=True, type="primary"):
            if not userid or not pwd:
                st.error("請輸入用戶代碼與密碼")
                return
            try:
                conn = get_conn()
                cur = conn.cursor()
                cur.execute(
                    "SELECT userid, username FROM [user] WHERE userid=? AND pwd=?",
                    userid, pwd
                )
                row = cur.fetchone()
                conn.close()
                if row:
                    st.session_state.logged_in = True
                    st.session_state.userid = row[0]
                    st.session_state.username = row[1]
                    st.session_state.page = "menu"
                    st.rerun()
                else:
                    st.error("用戶代碼或密碼錯誤")
            except Exception as e:
                st.error(f"連線錯誤：{e}")


# ── 主選單 ─────────────────────────────────────────────────
def menu_page():
    st.title("🏢 三層式資料維護系統")
    st.markdown(f"歡迎，**{st.session_state.username}** ({st.session_state.userid})")
    st.markdown("---")
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        if st.button("👥 客戶資料維護", use_container_width=True, type="primary"):
            st.session_state.page = "cust"
            st.rerun()
    with col2:
        if st.button("🏭 廠商資料維護", use_container_width=True, type="primary"):
            st.session_state.page = "fact"
            st.rerun()
    with col3:
        if st.button("📦 商品資料維護", use_container_width=True, type="primary"):
            st.session_state.page = "item"
            st.rerun()
    with col4:
        if st.button("👤 用戶資料維護", use_container_width=True, type="primary"):
            st.session_state.page = "user"
            st.rerun()
    st.markdown("---")
    if st.button("登出"):
        for k in list(st.session_state.keys()):
            del st.session_state[k]
        st.rerun()


# ── 共用：返回按鈕 ─────────────────────────────────────────
def back_button():
    if st.button("← 返回主選單"):
        st.session_state.page = "menu"
        st.session_state.pop("edit_row", None)
        st.rerun()


# ── 客戶資料維護 ───────────────────────────────────────────
def cust_page():
    st.title("👥 客戶資料維護")
    back_button()
    st.markdown("---")

    # 查詢
    search = st.text_input("🔍 查詢（代碼 / 名稱 / 備註）", key="cust_search")
    conn = get_conn()
    cur = conn.cursor()
    if search:
        cur.execute(
            "SELECT cust_code,cust_name,remark FROM cust "
            "WHERE cust_code LIKE ? OR cust_name LIKE ? OR remark LIKE ? "
            "ORDER BY cust_code",
            f"%{search}%", f"%{search}%", f"%{search}%"
        )
    else:
        cur.execute("SELECT cust_code,cust_name,remark FROM cust ORDER BY cust_code")
    rows = cur.fetchall()
    conn.close()

    df = to_df(rows, ["客戶代碼", "客戶名稱", "備註說明"])

    # 新增
    with st.expander("➕ 新增客戶"):
        with st.form("cust_add"):
            c1, c2, c3 = st.columns(3)
            code = c1.text_input("客戶代碼*")
            name = c2.text_input("客戶名稱*")
            remark = c3.text_input("備註說明")
            if st.form_submit_button("新增", type="primary"):
                if not code or not name:
                    st.error("代碼與名稱為必填")
                else:
                    try:
                        conn = get_conn()
                        conn.cursor().execute(
                            "INSERT INTO cust VALUES (?,?,?)", code, name, remark or None
                        )
                        conn.close()
                        st.success(f"已新增 {code}")
                        st.rerun()
                    except Exception as e:
                        st.error(str(e))

    # 表格 + 修改/刪除
    st.dataframe(df, use_container_width=True, hide_index=True)

    if not df.empty:
        st.markdown("**修改 / 刪除**")
        sel_code = st.selectbox("選擇客戶代碼", df["客戶代碼"].tolist(), key="cust_sel")
        sel_row = df[df["客戶代碼"] == sel_code].iloc[0]

        col_edit, col_del = st.columns([3, 1])
        with col_edit:
            with st.form("cust_edit"):
                c1, c2, c3 = st.columns(3)
                c1.text_input("客戶代碼", value=sel_row["客戶代碼"], disabled=True)
                new_name = c2.text_input("客戶名稱*", value=sel_row["客戶名稱"])
                new_remark = c3.text_input("備註說明", value=sel_row["備註說明"] or "")
                if st.form_submit_button("✏️ 儲存修改", type="primary"):
                    if not new_name:
                        st.error("名稱為必填")
                    else:
                        try:
                            conn = get_conn()
                            conn.cursor().execute(
                                "UPDATE cust SET cust_name=?, remark=? WHERE cust_code=?",
                                new_name, new_remark or None, sel_code
                            )
                            conn.close()
                            st.success("已更新")
                            st.rerun()
                        except Exception as e:
                            st.error(str(e))
        with col_del:
            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("🗑️ 刪除", type="secondary", key="cust_del"):
                st.session_state.cust_confirm_del = sel_code
            if st.session_state.get("cust_confirm_del") == sel_code:
                st.warning(f"確定刪除 {sel_code}？")
                if st.button("確定刪除", key="cust_del_ok"):
                    try:
                        conn = get_conn()
                        conn.cursor().execute("DELETE FROM cust WHERE cust_code=?", sel_code)
                        conn.close()
                        st.session_state.pop("cust_confirm_del", None)
                        st.success("已刪除")
                        st.rerun()
                    except Exception as e:
                        st.error(str(e))


# ── 廠商資料維護 ───────────────────────────────────────────
def fact_page():
    st.title("🏭 廠商資料維護")
    back_button()
    st.markdown("---")

    search = st.text_input("🔍 查詢（代碼 / 名稱 / 備註）", key="fact_search")
    conn = get_conn()
    cur = conn.cursor()
    if search:
        cur.execute(
            "SELECT fact_code,fact_name,remark FROM fact "
            "WHERE fact_code LIKE ? OR fact_name LIKE ? OR remark LIKE ? "
            "ORDER BY fact_code",
            f"%{search}%", f"%{search}%", f"%{search}%"
        )
    else:
        cur.execute("SELECT fact_code,fact_name,remark FROM fact ORDER BY fact_code")
    rows = cur.fetchall()
    conn.close()

    df = to_df(rows, ["廠商代碼", "廠商名稱", "備註說明"])

    with st.expander("➕ 新增廠商"):
        with st.form("fact_add"):
            c1, c2, c3 = st.columns(3)
            code = c1.text_input("廠商代碼*")
            name = c2.text_input("廠商名稱*")
            remark = c3.text_input("備註說明")
            if st.form_submit_button("新增", type="primary"):
                if not code or not name:
                    st.error("代碼與名稱為必填")
                else:
                    try:
                        conn = get_conn()
                        conn.cursor().execute(
                            "INSERT INTO fact VALUES (?,?,?)", code, name, remark or None
                        )
                        conn.close()
                        st.success(f"已新增 {code}")
                        st.rerun()
                    except Exception as e:
                        st.error(str(e))

    st.dataframe(df, use_container_width=True, hide_index=True)

    if not df.empty:
        st.markdown("**修改 / 刪除**")
        sel_code = st.selectbox("選擇廠商代碼", df["廠商代碼"].tolist(), key="fact_sel")
        sel_row = df[df["廠商代碼"] == sel_code].iloc[0]

        col_edit, col_del = st.columns([3, 1])
        with col_edit:
            with st.form("fact_edit"):
                c1, c2, c3 = st.columns(3)
                c1.text_input("廠商代碼", value=sel_row["廠商代碼"], disabled=True)
                new_name = c2.text_input("廠商名稱*", value=sel_row["廠商名稱"])
                new_remark = c3.text_input("備註說明", value=sel_row["備註說明"] or "")
                if st.form_submit_button("✏️ 儲存修改", type="primary"):
                    if not new_name:
                        st.error("名稱為必填")
                    else:
                        try:
                            conn = get_conn()
                            conn.cursor().execute(
                                "UPDATE fact SET fact_name=?, remark=? WHERE fact_code=?",
                                new_name, new_remark or None, sel_code
                            )
                            conn.close()
                            st.success("已更新")
                            st.rerun()
                        except Exception as e:
                            st.error(str(e))
        with col_del:
            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("🗑️ 刪除", type="secondary", key="fact_del"):
                st.session_state.fact_confirm_del = sel_code
            if st.session_state.get("fact_confirm_del") == sel_code:
                st.warning(f"確定刪除 {sel_code}？")
                if st.button("確定刪除", key="fact_del_ok"):
                    try:
                        conn = get_conn()
                        conn.cursor().execute("DELETE FROM fact WHERE fact_code=?", sel_code)
                        conn.close()
                        st.session_state.pop("fact_confirm_del", None)
                        st.success("已刪除")
                        st.rerun()
                    except Exception as e:
                        st.error(str(e))


# ── 商品資料維護 ───────────────────────────────────────────
def item_page():
    st.title("📦 商品資料維護")
    back_button()
    st.markdown("---")

    # 廠商下拉選項
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT fact_code, fact_name FROM fact ORDER BY fact_code")
    fact_rows = cur.fetchall()
    fact_options = {r[0]: f"{r[0]} {r[1]}" for r in fact_rows}
    fact_codes = list(fact_options.keys())

    search = st.text_input("🔍 查詢（代碼 / 名稱）", key="item_search")
    if search:
        cur.execute(
            "SELECT i.item_code, i.item_name, i.fact_code, f.fact_name "
            "FROM item i LEFT JOIN fact f ON i.fact_code=f.fact_code "
            "WHERE i.item_code LIKE ? OR i.item_name LIKE ? "
            "ORDER BY i.item_code",
            f"%{search}%", f"%{search}%"
        )
    else:
        cur.execute(
            "SELECT i.item_code, i.item_name, i.fact_code, f.fact_name "
            "FROM item i LEFT JOIN fact f ON i.fact_code=f.fact_code "
            "ORDER BY i.item_code"
        )
    rows = cur.fetchall()
    conn.close()

    df = to_df(rows, ["商品代碼", "商品名稱", "廠商代碼", "廠商名稱"])

    with st.expander("➕ 新增商品"):
        with st.form("item_add"):
            c1, c2, c3 = st.columns(3)
            code = c1.text_input("商品代碼*")
            name = c2.text_input("商品名稱*")
            fact = c3.selectbox("主供應商", fact_codes,
                                format_func=lambda x: fact_options[x])
            if st.form_submit_button("新增", type="primary"):
                if not code or not name:
                    st.error("代碼與名稱為必填")
                else:
                    try:
                        conn = get_conn()
                        conn.cursor().execute(
                            "INSERT INTO item VALUES (?,?,?)", code, name, fact
                        )
                        conn.close()
                        st.success(f"已新增 {code}")
                        st.rerun()
                    except Exception as e:
                        st.error(str(e))

    st.dataframe(df, use_container_width=True, hide_index=True)

    if not df.empty:
        st.markdown("**修改 / 刪除**")
        sel_code = st.selectbox("選擇商品代碼", df["商品代碼"].tolist(), key="item_sel")
        sel_row = df[df["商品代碼"] == sel_code].iloc[0]
        cur_fact_idx = fact_codes.index(sel_row["廠商代碼"]) if sel_row["廠商代碼"] in fact_codes else 0

        col_edit, col_del = st.columns([3, 1])
        with col_edit:
            with st.form("item_edit"):
                c1, c2, c3 = st.columns(3)
                c1.text_input("商品代碼", value=sel_row["商品代碼"], disabled=True)
                new_name = c2.text_input("商品名稱*", value=sel_row["商品名稱"])
                new_fact = c3.selectbox("主供應商", fact_codes, index=cur_fact_idx,
                                        format_func=lambda x: fact_options[x])
                if st.form_submit_button("✏️ 儲存修改", type="primary"):
                    if not new_name:
                        st.error("名稱為必填")
                    else:
                        try:
                            conn = get_conn()
                            conn.cursor().execute(
                                "UPDATE item SET item_name=?, fact_code=? WHERE item_code=?",
                                new_name, new_fact, sel_code
                            )
                            conn.close()
                            st.success("已更新")
                            st.rerun()
                        except Exception as e:
                            st.error(str(e))
        with col_del:
            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("🗑️ 刪除", type="secondary", key="item_del"):
                st.session_state.item_confirm_del = sel_code
            if st.session_state.get("item_confirm_del") == sel_code:
                st.warning(f"確定刪除 {sel_code}？")
                if st.button("確定刪除", key="item_del_ok"):
                    try:
                        conn = get_conn()
                        conn.cursor().execute("DELETE FROM item WHERE item_code=?", sel_code)
                        conn.close()
                        st.session_state.pop("item_confirm_del", None)
                        st.success("已刪除")
                        st.rerun()
                    except Exception as e:
                        st.error(str(e))


# ── 用戶資料維護 ───────────────────────────────────────────
def user_page():
    st.title("👤 用戶資料維護")
    back_button()
    st.markdown("---")

    search = st.text_input("🔍 查詢（代碼 / 名稱）", key="user_search")
    conn = get_conn()
    cur = conn.cursor()
    if search:
        cur.execute(
            "SELECT userid,username,pwd FROM [user] "
            "WHERE userid LIKE ? OR username LIKE ? "
            "ORDER BY userid",
            f"%{search}%", f"%{search}%"
        )
    else:
        cur.execute("SELECT userid,username,pwd FROM [user] ORDER BY userid")
    rows = cur.fetchall()
    conn.close()

    df = to_df(rows, ["用戶代碼", "用戶名稱", "用戶密碼"])

    with st.expander("➕ 新增用戶"):
        with st.form("user_add"):
            c1, c2, c3 = st.columns(3)
            code = c1.text_input("用戶代碼*")
            name = c2.text_input("用戶名稱*")
            pwd = c3.text_input("用戶密碼*", type="password")
            if st.form_submit_button("新增", type="primary"):
                if not code or not name or not pwd:
                    st.error("所有欄位為必填")
                else:
                    try:
                        conn = get_conn()
                        conn.cursor().execute(
                            "INSERT INTO [user] VALUES (?,?,?)", code, name, pwd
                        )
                        conn.close()
                        st.success(f"已新增 {code}")
                        st.rerun()
                    except Exception as e:
                        st.error(str(e))

    st.dataframe(df, use_container_width=True, hide_index=True)

    if not df.empty:
        st.markdown("**修改 / 刪除**")
        sel_code = st.selectbox("選擇用戶代碼", df["用戶代碼"].tolist(), key="user_sel")
        sel_row = df[df["用戶代碼"] == sel_code].iloc[0]

        col_edit, col_del = st.columns([3, 1])
        with col_edit:
            with st.form("user_edit"):
                c1, c2, c3 = st.columns(3)
                c1.text_input("用戶代碼", value=sel_row["用戶代碼"], disabled=True)
                new_name = c2.text_input("用戶名稱*", value=sel_row["用戶名稱"])
                new_pwd = c3.text_input("用戶密碼*", value=sel_row["用戶密碼"])
                if st.form_submit_button("✏️ 儲存修改", type="primary"):
                    if not new_name or not new_pwd:
                        st.error("名稱與密碼為必填")
                    else:
                        try:
                            conn = get_conn()
                            conn.cursor().execute(
                                "UPDATE [user] SET username=?, pwd=? WHERE userid=?",
                                new_name, new_pwd, sel_code
                            )
                            conn.close()
                            st.success("已更新")
                            st.rerun()
                        except Exception as e:
                            st.error(str(e))
        with col_del:
            st.markdown("<br>", unsafe_allow_html=True)
            if st.button("🗑️ 刪除", type="secondary", key="user_del"):
                st.session_state.user_confirm_del = sel_code
            if st.session_state.get("user_confirm_del") == sel_code:
                st.warning(f"確定刪除 {sel_code}？")
                if st.button("確定刪除", key="user_del_ok"):
                    try:
                        conn = get_conn()
                        conn.cursor().execute("DELETE FROM [user] WHERE userid=?", sel_code)
                        conn.close()
                        st.session_state.pop("user_confirm_del", None)
                        st.success("已刪除")
                        st.rerun()
                    except Exception as e:
                        st.error(str(e))


# ── 路由 ──────────────────────────────────────────────────
if "logged_in" not in st.session_state:
    st.session_state.logged_in = False
if "page" not in st.session_state:
    st.session_state.page = "login"

page = st.session_state.page
if not st.session_state.logged_in:
    login_page()
elif page == "menu":
    menu_page()
elif page == "cust":
    cust_page()
elif page == "fact":
    fact_page()
elif page == "item":
    item_page()
elif page == "user":
    user_page()
