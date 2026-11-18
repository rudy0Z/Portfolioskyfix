import sqlite3, json

db_path = r'C:\Users\rudra\.traycer\host\opencode\line-2\db-3eefe635\opencode.db'
con = sqlite3.connect(db_path)
cur = con.cursor()

session_id = 'ses_e2f047aa8ffeex4svPY81NsQD5'
rows = cur.execute("SELECT id, time_created, data FROM session_message WHERE session_id = ? ORDER BY time_created ASC", (session_id,)).fetchall()

handoff_content = None
for mid, t, data_str in rows:
    data = json.loads(data_str)
    for c in data.get('content', []):
        if isinstance(c, dict) and c.get('type') == 'tool':
            state = c.get('state', {})
            inp = state.get('input', {})
            if isinstance(inp, dict) and inp.get('path', '').endswith('HANDOFF.md'):
                handoff_content = inp.get('content')

if handoff_content:
    print(f"Found HANDOFF.md! Length: {len(handoff_content)} characters")
    with open(r'D:\Portfolioskyfix\HANDOFF.md', 'w', encoding='utf-8') as f:
        f.write(handoff_content)
    print("Successfully wrote D:\\Portfolioskyfix\\HANDOFF.md!")
    print("\n--- Preview of HANDOFF.md (first 500 chars) ---")
    print(handoff_content[:500])
else:
    print("HANDOFF.md not found in tool inputs.")
