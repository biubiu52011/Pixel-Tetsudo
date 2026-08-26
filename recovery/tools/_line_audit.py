import json, os
from datetime import datetime

repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate.json"),"r",encoding="utf-8"))

# 1.6.1: Line Conflict Audit
fields_to_compare = ["name","nameEn","nameJa","code","color","operator","region","type",
                     "image","durationTotalMin","branchOf","durations","stations",
                     "throughServices","transferStations"]

line_audit = []
for lid in sorted(src["lines"].keys()):
    if lid not in cur["lines"]:
        continue  # source-only, already recorded
    sl = src["lines"][lid]
    cl = cur["lines"][lid]
    if sl == cl:
        continue  # identical

    diff = {"line_id": lid, "fields": {}, "summary": {}}
    for f in fields_to_compare:
        sv = sl.get(f)
        cv = cl.get(f)
        if sv != cv:
            diff["fields"][f] = {
                "source": sv,
                "current": cv,
                "status": "DIFFERENT"
            }
    line_audit.append(diff)

print(f"Line conflicts (detailed): {len(line_audit)}")

# Categorize by which fields differ
from collections import Counter
field_counts = Counter()
for la in line_audit:
    for f in la["fields"]:
        field_counts[f] += 1

print("\nField difference frequency:")
for f, cnt in field_counts.most_common():
    print(f"  {f}: {cnt}")

# Sample a few interesting conflicts
print("\n--- Sample conflicts ---")
for la in line_audit[:5]:
    print(f"\n{la['line_id']}:")
    for f, v in la["fields"].items():
        print(f"  {f}:")
        sv = str(v["source"])[:80] if v["source"] is not None else "None"
        cv = str(v["current"])[:80] if v["current"] is not None else "None"
        print(f"    source: {sv}")
        print(f"    current: {cv}")