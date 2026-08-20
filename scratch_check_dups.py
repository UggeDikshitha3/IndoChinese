import json
import re
from collections import Counter

with open('src/data/initialData.ts', 'r', encoding='utf-8') as f:
    ts_code = f.read()

pattern = re.compile(
    r"\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*description:\s*'([^']*)',\s*price:\s*([\d\.]+),\s*category:\s*'([^']+)',\s*isVeg:\s*(true|false),\s*isSpicy:\s*(true|false)(?:,\s*spiceLevel:\s*(\d+))?(?:,\s*isChefSpecial:\s*(true|false))?(?:,\s*isPopular:\s*(true|false))?",
    re.MULTILINE
)

matches = pattern.findall(ts_code)
print(f"Total items in initialData.ts: {len(matches)}")

names = [m[1].strip() for m in matches]
ids = [m[0].strip() for m in matches]

name_counts = Counter(names)
id_counts = Counter(ids)

dup_names = {k: v for k, v in name_counts.items() if v > 1}
dup_ids = {k: v for k, v in id_counts.items() if v > 1}

print("Duplicate names in initialData.ts:", dup_names)
print("Duplicate IDs in initialData.ts:", dup_ids)

# Check data/store.json
try:
    with open('data/store.json', 'r', encoding='utf-8') as f:
        store = json.load(f)
    store_names = [it['name'].strip() for it in store.get('menuItems', [])]
    store_ids = [it['id'].strip() for it in store.get('menuItems', [])]
    print(f"Total items in data/store.json: {len(store_names)}")
    print("Duplicate names in data/store.json:", {k: v for k, v in Counter(store_names).items() if v > 1})
    print("Duplicate IDs in data/store.json:", {k: v for k, v in Counter(store_ids).items() if v > 1})
except Exception as e:
    print("Error reading store.json:", e)
