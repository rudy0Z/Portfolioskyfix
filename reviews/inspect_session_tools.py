import sqlite3
import json

db_path = r"C:\Users\rudra\.traycer\host\opencode\line-2\db-3eefe635\opencode.db"
con = sqlite3.connect(db_path)
cur = con.cursor()

session_id = 'ses_e2f047aa8ffeex4svPY81NsQD5'
rows = cur.execute("SELECT id, time_created, data FROM session_message WHERE session_id = ? ORDER BY time_created ASC", (session_id,)).fetchall()

print(f"Total messages: {len(rows)}")
for mid, t, data_str in rows:
    data = json.loads(data_str)
    content = data.get("content", [])
    for c in content:
        if isinstance(c, dict) and c.get("type") == "tool":
            name = c.get("name")
            state = c.get("state", {})
            inp = state.get("input", {})
            path = inp.get("path") or inp.get("filePath") or inp.get("file") or ""
            cmd = inp.get("command") or inp.get("CommandLine") or ""
            if path:
                print(f"{t} | {name} -> {path}")
            elif cmd and ("git" in cmd or "npm" in cmd or "cp" in cmd):
                print(f"{t} | {name} -> {cmd[:100]}")
