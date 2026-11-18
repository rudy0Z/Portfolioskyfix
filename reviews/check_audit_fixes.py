import json, re

# Let's read the audit HTML and extract all 24 findings
with open(r'D:\Portfolioskyfix\reviews\traycer-artifacts\audit\index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract FINDINGS array
match = re.search(r'const FINDINGS = (\[.*?\]);', text, re.DOTALL)
if match:
    findings = json.loads(match.group(1))
    print(f"Loaded {len(findings)} findings from audit HTML.")
    for f in findings:
        print(f"[{f['sev']}] {f['id']}: {f['title']}")
else:
    print("Could not extract FINDINGS array")
