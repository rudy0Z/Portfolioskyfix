import sqlite3, json

db_path = r'C:\Users\rudra\.traycer\host\opencode\line-2\db-3eefe635\opencode.db'
con = sqlite3.connect(db_path)
cur = con.cursor()

session_id = 'ses_e2f047aa8ffeex4svPY81NsQD5'
rows = cur.execute("SELECT id, time_created, data FROM session_message WHERE session_id = ? ORDER BY time_created ASC", (session_id,)).fetchall()
print(f"Total messages for {session_id}: {len(rows)}")

tool_calls = []
for mid, t, data_str in rows:
    try:
        data = json.loads(data_str)
        # check content or parts
        if "content" in data:
            for item in data["content"]:
                if isinstance(item, dict) and item.get("type") == "tool-call":
                    tool_calls.append((mid, item))
        if "text" in data and ("HANDOFF" in data["text"] or "19 files changed" in data["text"] or "make_resume" in data["text"]):
            print(f"[TEXT MATCH] {mid}: {data['text'][:300]}")
    except Exception as e:
        pass

print(f"Total tool calls found: {len(tool_calls)}")
for mid, tc in tool_calls[:20]:
    name = tc.get("name")
    args = tc.get("arguments", {})
    if isinstance(args, str):
        try:
            args = json.loads(args)
        except:
            pass
    path = args.get("path") or args.get("file") or args.get("filePath") if isinstance(args, dict) else ""
    print(f"Tool call: {name} -> {path}")
