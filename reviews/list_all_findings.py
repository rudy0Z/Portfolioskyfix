import re

with open("reviews/findings_raw.js", "r", encoding="utf-8") as f:
    code = f.read()

findings = re.findall(r'id:\s*"(.*?)",\s*sev:\s*"(.*?)",\s*cat:\s*"(.*?)",\s*title:\s*"(.*?)"', code)
print(f"Total findings: {len(findings)}")
for fid, sev, cat, title in findings:
    print(f"{fid} [{sev}] ({cat}): {title}")
