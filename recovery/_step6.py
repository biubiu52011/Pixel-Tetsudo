import json, os
from datetime import datetime
repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

diff = {"timestamp": datetime.now().isoformat(), "A_existing": [], "B_152_only": [], "C_60_only": [], "D_field_diff": [], "E_content_diff": []}

src_lines = set(src["lines"].keys())
cur_lines = set(cur["lines"].keys())

# A: Both exist
for lid in sorted(src_lines & cur_lines):
    diff["A_existing"].append(lid)

# B: 152 has, 60 doesn't
for lid in sorted(src_lines - cur_lines):
    diff["B_152_only"].append(lid)

# C: 60 has, 152 doesn't
for lid in sorted(cur_lines - src_lines):
    diff["C_60_only"].append(lid)

# D: Both exist but fields differ
for lid in src_lines & cur_lines:
    sl = src["lines"][lid]
    cl = cur["lines"][lid]
    sf = set(sl.keys())
    cf = set(cl.keys())
    if sf != cf:
        diff["D_field_diff"].append({"line_id": lid, "source_fields": sorted(sf), "current_fields": sorted(cf)})

# E: ID same but content different (same fields but different values)
for lid in src_lines & cur_lines:
    sl = src["lines"][lid]
    cl = cur["lines"][lid]
    if sl != cl:
        diff["E_content_diff"].append({"line_id": lid, "source_station_count": len(sl.get("stations",[])), "current_station_count": len(cl.get("stations",[]))})

open(os.path.join(repo,"recovery","reports","06_diff_152_vs_60.json"),"w",encoding="utf-8").write(json.dumps(diff,indent=2,ensure_ascii=False)+chr(10))
print("06 done")
print("A (both):", len(diff["A_existing"]))
print("B (152 only):", len(diff["B_152_only"]))
print("C (60 only):", len(diff["C_60_only"]))
print("D (field diff):", len(diff["D_field_diff"]))
print("E (content diff):", len(diff["E_content_diff"]))