import pymssql
from config import DB_CONFIG


def get_conn():
    return pymssql.connect(
        server=DB_CONFIG["server"],
        port=DB_CONFIG["port"],
        user=DB_CONFIG["uid"],
        password=DB_CONFIG["pwd"],
        database=DB_CONFIG["database"],
        charset="UTF8",
        autocommit=True,
    )
