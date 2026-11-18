import sqlite3, json

db_path = r'C:\Users\rudra\.traycer\host\opencode\line-2\db-3eefe635\opencode.db'
con = sqlite3.connect(db_path)
cur = con.cursor()

session_id = 'ses_e2f047aa8ffeex4svPY81NsQD5'
rows = cur.execute("SELECT id, time_created, data FROM session_message WHERE session_id = ? ORDER BY time_created ASC", (session_id,)).fetchall()

tool_records = []
for mid, t, data_str in rows:
    data = json.loads(data_str)
    for c in data.get('content', []):
        if isinstance(c, dict) and c.get('type') == 'tool':
            tool_records.append((mid, c))

print(f"Total tool items: {len(tool_records)}")
for mid, t in tool_records:
    name = t.get('name')
    state = t.get('state', {})
    args = state.get('arguments', {})
    path = args.get('path') or args.get('file') or args.get('filePath') if isinstance(args, dict) else ""
    status = state.get('status')
    print(f"Tool {name} [{status}] -> {path}")
