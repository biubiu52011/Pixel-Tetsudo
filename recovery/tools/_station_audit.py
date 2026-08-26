import json, os
from datetime import datetime

repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate.json"),"r",encoding="utf-8"))

# 1.6.2: Station Conflict Audit - focus on the 452 different stations
station_audit = []
for sid in sorted(src["stations"].keys()):
    if sid not in cur["stations"]:
        continue
    ss = src["stations"][sid]
    cs = cur["stations"][sid]
    if ss == cs:
        continue

    diff = {"station_id": sid, "fields": {}, "status": "DIFFERENT"}
    for f in set(list(ss.keys()) + list(cs.keys())):
        sv = ss.get(f)
        cv = cs.get(f)
        if sv != cv:
            diff["fields"][f] = {"source": sv, "current": cv}
    station_audit.append(diff)

print(f"Station conflicts (detailed): {len(station_audit)}")

# Categorize station differences
field_counts = {}
for sa in station_audit:
    for f in sa["fields"]:
        field_counts[f] = field_counts.get(f, 0) + 1

print("\nStation field difference frequency:")
for f, cnt in sorted(field_counts.items(), key=lambda x: -x[1]):
    print(f"  {f}: {cnt}")

# Sample a few station conflicts
print("\n--- Sample station conflicts ---")
for sa in station_audit[:5]:
    print(f"\n{sa['station_id']}:")
    for f, v in sa["fields"].items():
        sv = str(v["source"])[:60] if v["source"] is not None else "None"
        cv = str(v["current"])[:60] if v["current"] is not None else "None"
        print(f"  {f}: source={sv} current={cv}")