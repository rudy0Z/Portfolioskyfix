import sqlite3

db_path = r'C:\Users\rudra\.local\share\opencode\opencode.db'
con = sqlite3.connect(db_path)
cur = con.cursor()

print("--- Searching the 2.4GB opencode.db for new-visual-scroll-800 ---")
try:
    rows = cur.execute("SELECT id, session_id, time_created, substr(data, 1, 300) FROM part WHERE data LIKE '%new-visual-scroll-800%' LIMIT 5").fetchall()
    print("Found in part:", len(rows))
    for r in rows:
        print(r)
except Exception as e:
    print("part err:", e)

try:
    rows2 = cur.execute("SELECT id, session_id, time_created, substr(data, 1, 300) FROM session_message WHERE data LIKE '%new-visual-scroll-800%' LIMIT 5").fetchall()
    print("Found in session_message:", len(rows2))
    for r in rows2:
        print(r)
except Exception as e:
    print("msg err:", e)
