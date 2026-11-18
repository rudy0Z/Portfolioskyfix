import os

repo_root = r"D:\Portfolioskyfix"
stats = {}

for root, dirs, files in os.walk(repo_root):
    # skip .git and node_modules
    parts = os.path.relpath(root, repo_root).split(os.sep)
    if ".git" in parts or "node_modules" in parts or "dist" in parts:
        continue
    rel = os.path.relpath(root, repo_root)
    top = rel.split(os.sep)[0] if rel != "." else "."
    if top not in stats:
        stats[top] = {"files": 0, "size": 0, "subdirs": set(), "exts": {}}
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

print(f"{'Directory':25s} | {'Files':6s} | {'Size (MB)':10s} | {'Top Extensions'}")
print("-" * 80)
total_size = 0
total_files = 0
for top, data in sorted(stats.items(), key=lambda x: x[1]["size"], reverse=True):
    mb = data["size"] / (1024 * 1024)
    total_size += data["size"]
    total_files += data["files"]
    ext_summary = ", ".join(f"{k}:{v}" for k, v in sorted(data["exts"].items(), key=lambda x: x[1], reverse=True)[:4])
    print(f"{top:25s} | {data['files']:6d} | {mb:10.2f} | {ext_summary}")

print("-" * 80)
print(f"{'TOTAL':25s} | {total_files:6d} | {total_size / (1024*1024):10.2f} MB")
