import sqlite3

db_path = r'C:\Users\rudra\.traycer\host\opencode\line-2\db-3eefe635\opencode.db'
con = sqlite3.connect(db_path)
cur = con.cursor()

for s in cur.execute("SELECT id, project_id, directory, title, summary_additions, summary_deletions, summary_files FROM session_v2").fetchall():
    print(s)
