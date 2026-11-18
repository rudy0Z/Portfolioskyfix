import sqlite3, datetime

db_path = r'C:\Users\rudra\.traycer\host\opencode\line-2\db-3eefe635\opencode.db'
con = sqlite3.connect(db_path)
cur = con.cursor()

print("--- All sessions in Traycer opencode.db ---")
for row in cur.execute("SELECT id, project_id, directory, title, time_created, time_updated FROM session_v2 ORDER BY time_updated DESC").fetchall():
    t_c = datetime.datetime.fromtimestamp(row[4]/1000).isoformat() if row[4] else 'None'
    t_u = datetime.datetime.fromtimestamp(row[5]/1000).isoformat() if row[5] else 'None'
    print(f"Session {row[0]}: dir={row[2]}, created={t_c}, updated={t_u}, title={row[3]}")

print("\n--- Check total messages across all sessions ---")
for row in cur.execute("SELECT session_id, count(*) FROM session_message GROUP BY session_id").fetchall():
    print(f"Session {row[0]}: {row[1]} messages")
