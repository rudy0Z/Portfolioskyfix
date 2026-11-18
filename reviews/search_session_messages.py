import sqlite3

db_path = r'C:\Users\rudra\.traycer\host\opencode\line-2\db-3eefe635\opencode.db'
con = sqlite3.connect(db_path)
cur = con.cursor()

print("--- worktree table ---")
cols = [d[0] for d in cur.execute("SELECT * FROM worktree LIMIT 1").description]
print("worktree cols:", cols)
for row in cur.execute("SELECT * FROM worktree").fetchall():
    print(row)

print("\n--- session_message table ---")
mcols = [d[0] for d in cur.execute("SELECT * FROM session_message LIMIT 1").description]
print("session_message cols:", mcols)
for row in cur.execute("SELECT id, session_id, time_created, substr(data, 1, 200) FROM session_message ORDER BY time_created DESC LIMIT 10").fetchall():
    print(row)
