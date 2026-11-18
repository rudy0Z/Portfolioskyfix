import sqlite3

con = sqlite3.connect(r'C:\Users\rudra\.local\share\opencode\opencode.db')
cur = con.cursor()

print("--- Recent Projects ---")
try:
    for row in cur.execute("SELECT * FROM project ORDER BY rowid DESC LIMIT 10").fetchall():
        print(row)
except Exception as e:
    print(e)

print("\n--- Recent Sessions ---")
try:
    cols = [d[0] for d in cur.execute("SELECT * FROM session LIMIT 1").description]
    print("Session cols:", cols)
    for row in cur.execute("SELECT id, title, time_created, time_updated FROM session ORDER BY time_updated DESC LIMIT 10").fetchall():
        print(row)
except Exception as e:
    print(e)

print("\n--- Search parts for 'make_resume.cjs' ---")
try:
    part_cols = [d[0] for d in cur.execute("SELECT * FROM part LIMIT 1").description]
    print("Part cols:", part_cols)
    for row in cur.execute("SELECT id, session_id, type, time_created, substr(data, 1, 200) FROM part WHERE data LIKE '%make_resume.cjs%' LIMIT 5").fetchall():
        print(row)
except Exception as e:
    print(e)
