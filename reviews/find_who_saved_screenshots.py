import sqlite3
import json

db_path = r"C:\Users\rudra\.traycer\host\opencode\line-2\db-3eefe635\opencode.db"
con = sqlite3.connect(db_path)
cur = con.cursor()

# Find any message mentioning new-visual or live-work-fresh or taking screenshot
rows = cur.execute("""
    SELECT id, session_id, time_created, data 
    FROM session_message 
    WHERE data LIKE '%new-visual-hero.png%' 
       OR data LIKE '%new-visual-scroll-800%'
       OR data LIKE '%live-solar-dial-popover%'
""").fetchall()

print(f"Total matching messages: {len(rows)}")
for mid, sid, t, data_str in rows:
    data = json.loads(data_str)
    # Check if there is a tool call that created or saved this screenshot
    content = data.get("content", [])
    for c in content:
        if isinstance(c, dict) and c.get("type") == "tool":
            state = c.get("state", {})
            inp = state.get("input", {})
            out = str(state.get("output", ""))[:200]
            print(f"SID {sid} | Tool: {c.get('name')} | Input: {inp} | Out: {out}")
