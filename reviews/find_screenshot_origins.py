import sqlite3, json

db_path = r'C:\Users\rudra\.traycer\host\opencode\line-2\db-3eefe635\opencode.db'
con = sqlite3.connect(db_path)
cur = con.cursor()

print("--- Searching messages for new-visual-scroll-800 or live-work-fresh ---")
rows = cur.execute("SELECT id, session_id, time_created, data FROM session_message WHERE data LIKE '%new-visual-scroll-800%' OR data LIKE '%live-work-fresh%'").fetchall()
print(f"Found {len(rows)} messages")
for mid, sid, t, data_str in rows:
    data = json.loads(data_str)
    print(f"Msg {mid} in {sid} at {t}:")
    if "content" in data:
        for c in data["content"]:
            if isinstance(c, dict):
                print(f"  part: {c.get('type')}, name={c.get('name')}")
                state = c.get('state', {})
                if 'input' in state:
                    inp = str(state['input'])[:250]
                    print(f"    input: {inp}")
                if 'output' in state:
                    out = str(state['output'])[:250]
                    print(f"    output: {out}")
    if "text" in data:
        print(f"  text: {data['text'][:250]}")
