import sqlite3

db_path = r'C:\Users\rudra\.traycer\host\opencode\line-2\db-3eefe635\opencode.db'
con = sqlite3.connect(db_path)
cur = con.cursor()

tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print("Tables in Traycer opencode.db:", tables)

for t in tables:
    cnt = cur.execute(f"SELECT count(*) FROM {t}").fetchone()[0]
    print(f"  {t}: {cnt}")

print("\n--- Sessions in Traycer opencode.db ---")
try:
    for row in cur.execute("SELECT id, title, time_created, time_updated FROM session ORDER BY time_updated DESC LIMIT 10").fetchall():
        print(row)
except Exception as e:
    print("session error:", e)

try:
    for row in cur.execute("SELECT id, title, time_created, time_updated FROM session_v2 ORDER BY time_updated DESC LIMIT 10").fetchall():
        print(row)
except Exception as e:
    print("session_v2 error:", e)

print("\n--- Search for make_resume.cjs in part table ---")
try:
    for row in cur.execute("SELECT id, session_id, substr(data, 1, 200) FROM part WHERE data LIKE '%make_resume.cjs%' LIMIT 5").fetchall():
        print(row)
except Exception as e:
    print("part search error:", e)

print("\n--- Search for CaseStudyPage.tsx in part table ---")
try:
    for row in cur.execute("SELECT id, session_id, substr(data, 1, 200) FROM part WHERE data LIKE '%CaseStudyPage.tsx%' LIMIT 5").fetchall():
        print(row)
except Exception as e:
    print("part search error 2:", e)
