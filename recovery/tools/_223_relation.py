import json, os, hashlib
from datetime import datetime

repo = os.getcwd()
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_canonical_candidate.json"),"r",encoding="utf-8"))
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# 2.2.3: Relation Layer Bidirectional Consistency
print("=== 2.2.3 Relation Layer Consistency ===")

# Build computed relations
computed_sl = {}
computed_lso = {}
for lid, l in cand["lines"].items():
    computed_lso[lid] = {}
    for order, sid in enumerate(l.get("stations", [])):
        computed_lso[lid][sid] = order
        computed_sl.setdefault(sid, []).append({"line_id": lid, "station_order": order})

# Compare with stored
sl_mismatches = 0
lso_mismatches = 0
for sid in set(list(computed_sl.keys()) + list(cand["stationLines"].keys())):
    ck = set(x["line_id"] for x in computed_sl.get(sid, []))
    sk = set(x["line_id"] for x in cand["stationLines"].get(sid, []))
    if ck != sk:
        sl_mismatches += 1
        if sl_mismatches <= 3:
            print(f"  stationLines mismatch at {sid}: computed={len(ck)} stored={len(sk)}")

for lid in set(list(computed_lso.keys()) + list(cand["lineStationOrder"].keys())):
    if computed_lso.get(lid) != cand["lineStationOrder"].get(lid):
        lso_mismatches += 1
        if lso_mismatches <= 3:
            print(f"  lineStationOrder mismatch at {lid}")

print(f"stationLines mismatches: {sl_mismatches}")
print(f"lineStationOrder mismatches: {lso_mismatches}")

# Cross-check: for each line, every station in stations[] must appear in lineStationOrder
line_st_order_check = 0
for lid, l in cand["lines"].items():
    lso = cand["lineStationOrder"].get(lid, {})
    for sid in l.get("stations", []):
        if sid not in lso:
            line_st_order_check += 1
            if line_st_order_check <= 3:
                print(f"  {lid}: station {sid} not in lineStationOrder")

print(f"Stations in lines but missing from lineStationOrder: {line_st_order_check}")

# Cross-check: for each station in stationLines, the line must reference it
sl_line_check = 0
for sid, lines in cand["stationLines"].items():
    for entry in lines:
        lid = entry["line_id"]
        order = entry["station_order"]
        if lid not in cand["lines"]:
            sl_line_check += 1
            if sl_line_check <= 3:
                print(f"  stationLines[{sid}]: line {lid} not found")
        elif sid not in cand["lines"][lid].get("stations", []):
            sl_line_check += 1
            if sl_line_check <= 3:
                print(f"  stationLines[{sid}]: {lid} references station but station not in line.stations")

print(f"stationLines entries with broken line references: {sl_line_check}")

overall_relation_pass = (sl_mismatches == 0 and lso_mismatches == 0 and 
                          line_st_order_check == 0 and sl_line_check == 0)
print(f"\nRelation layer: {'PASS' if overall_relation_pass else 'FAIL'}")

# Save
out = {
    "task": "2.2.3 Relation Layer Consistency",
    "timestamp": datetime.now().isoformat(),
    "pass": overall_relation_pass,
    "stationLines_mismatches": sl_mismatches,
    "lineStationOrder_mismatches": lso_mismatches,
    "missing_in_lso": line_st_order_check,
    "broken_sl_refs": sl_line_check,
}
with open(os.path.join(repo,"recovery","output","2_2_3_relation_consistency.json"),"w",encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
print("Saved")