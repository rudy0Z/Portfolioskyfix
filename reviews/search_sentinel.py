import sqlite3

db = r'C:\Users\rudra\.traycer\host\opencode\line-2\db-3eefe635\opencode.db'
conn = sqlite3.connect(db)
cur = conn.cursor()

print("=== Projects in opencode.db ===")
cur.execute("SELECT * FROM project;")
for r in cur.fetchall():
    print(r)

print("\n=== All Sessions in session_v2 ===")
cur.execute("SELECT id, directory, slug, title, time_created, time_updated FROM session_v2 ORDER BY time_updated DESC;")
for r in cur.fetchall():
    print(r)

print("\n=== Searching session_message for 'sentinel' ===")
cur.execute("SELECT session_id, count(*) FROM session_message WHERE lower(data) LIKE '%sentinel%' GROUP BY session_id;")
for r in cur.fetchall():
    print("Session with sentinel:", r)
