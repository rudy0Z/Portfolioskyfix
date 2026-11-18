import os

pattern = "human decisions meet autonomous"
matches = []

for root, dirs, files in os.walk(r'D:\Portfolioskyfix'):
    if 'node_modules' in root or '.git' in root or 'dist' in root:
        continue
    for f in files:
        if f.endswith(('.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.md', '.json')):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                    content = fp.read()
                    if pattern.lower() in content.lower():
                        matches.append(path)
            except:
                pass

print("Matches in D:\\Portfolioskyfix:", matches)

# Also search D:\skyportfolio or D:\Downloads if any
for extra in [r'D:\skyportfolio', r'D:\TraycerSavedWork']:
    if os.path.exists(extra):
        for root, dirs, files in os.walk(extra):
            if 'node_modules' in root or '.git' in root or 'dist' in root:
                continue
            for f in files:
                if f.endswith(('.ts', '.tsx', '.js', '.jsx', '.html', '.css', '.md', '.json')):
                    path = os.path.join(root, f)
                    try:
                        with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                            content = fp.read()
                            if pattern.lower() in content.lower():
                                matches.append(path)
                    except:
                        pass

print("Total matches:", len(matches))
for m in matches:
    print(" -", m)
