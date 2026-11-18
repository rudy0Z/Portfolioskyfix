import os

reviews_root = r"D:\Portfolioskyfix\reviews"
stats = {}

for root, dirs, files in os.walk(reviews_root):
    rel = os.path.relpath(root, reviews_root)
    top = rel.split(os.sep)[0] if rel != "." else "."
    if top not in stats:
        stats[top] = {"files": 0, "size": 0, "exts": {}}
    for f in files:
        p = os.path.join(root, f)
        try:
            sz = os.path.getsize(p)
            stats[top]["files"] += 1
            stats[top]["size"] += sz
            ext = os.path.splitext(f)[1].lower() or "no-ext"
            stats[top]["exts"][ext] = stats[top]["exts"].get(ext, 0) + 1
        except Exception:
            pass

print(f"{'Reviews Subdir':35s} | {'Files':6s} | {'Size (MB)':10s} | {'Top Extensions'}")
print("-" * 80)
for top, data in sorted(stats.items(), key=lambda x: x[1]["size"], reverse=True):
    mb = data["size"] / (1024 * 1024)
    ext_summary = ", ".join(f"{k}:{v}" for k, v in sorted(data["exts"].items(), key=lambda x: x[1], reverse=True)[:3])
    print(f"{top:35s} | {data['files']:6d} | {mb:10.2f} | {ext_summary}")
