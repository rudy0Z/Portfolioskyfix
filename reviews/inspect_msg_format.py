import sqlite3, json

db_path = r'C:\Users\rudra\.traycer\host\opencode\line-2\db-3eefe635\opencode.db'
con = sqlite3.connect(db_path)
cur = con.cursor()

session_id = 'ses_e2f047aa8ffeex4svPY81NsQD5'
rows = cur.execute("SELECT id, time_created, data FROM session_message WHERE session_id = ? ORDER BY time_created ASC", (session_id,)).fetchall()
for i, (mid, t, data_str) in enumerate(rows):
    data = json.loads(data_str)
    print(f"Msg {i}: keys = {list(data.keys())}")
    if "agent" in data:
        print(f"   agent: {data.get('agent')}, model: {data.get('model')}")
    if "text" in data:
        print(f"   text[:100]: {data.get('text')[:100]}")
    if "content" in data:
        print(f"   content len: {len(data.get('content'))}")
        for c in data.get('content')[:3]:
            if isinstance(c, dict):
                print(f"      part type: {c.get('type')}, keys: {list(c.keys())}")
            else:
                print(f"      part: {type(c)}")
    if i >= 15:
        break
