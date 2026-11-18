import sqlite3, json

db_path = r'C:\Users\rudra\.traycer\host\opencode\line-2\db-3eefe635\opencode.db'
con = sqlite3.connect(db_path)
cur = con.cursor()

session_id = 'ses_e2f047aa8ffeex4svPY81NsQD5'
rows = cur.execute("SELECT id, time_created, data FROM session_message WHERE session_id = ? ORDER BY time_created ASC", (session_id,)).fetchall()

edits = []
for mid, t, data_str in rows:
    data = json.loads(data_str)
    for c in data.get('content', []):
        if isinstance(c, dict) and c.get('type') == 'tool':
            name = c.get('name')
            state = c.get('state', {})
            # let's inspect the keys of state
            if name in ['edit', 'write']:
                edits.append((name, state))

print(f"Total edit/write tools: {len(edits)}")
for name, state in edits:
    print(f"\n--- {name} ---")
    print("state keys:", list(state.keys()))
    input_data = state.get('input') or state.get('arguments') or state.get('parameters')
    if isinstance(input_data, dict):
        print("input keys:", list(input_data.keys()))
        print("path:", input_data.get('path') or input_data.get('filePath') or input_data.get('file'))
    else:
        print("input raw:", str(input_data)[:200])
