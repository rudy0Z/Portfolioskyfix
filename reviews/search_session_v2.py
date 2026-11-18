import sqlite3

con = sqlite3.connect(r'C:\Users\rudra\.local\share\opencode\opencode.db')
cur = con.cursor()

print("--- session_v2 ---")
try:
    cols = [d[0] for d in cur.execute("SELECT * FROM session_v2 LIMIT 1").description]
    print("session_v2 cols:", cols)
    for row in cur.execute("SELECT id, title, time_created, time_updated FROM session_v2 ORDER BY time_updated DESC LIMIT 10").fetchall():
        print(row)
except Exception as e:
    print(e)

print("\n--- Search part table for make_resume.cjs ---")
try:
    for row in cur.execute("SELECT id, message_id, session_id, time_created, substr(data, 1, 300) FROM part WHERE data LIKE '%make_resume.cjs%' LIMIT 5").fetchall():
        print(row)
except Exception as e:
    print(e)
