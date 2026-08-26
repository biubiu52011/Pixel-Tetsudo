import json, os
from datetime import datetime
repo = os.getcwd()

# Load resolution results
line_res = json.load(open(os.path.join(repo,"recovery/reconciliation/1_7_1_line_field_resolution.json"),"r",encoding="utf-8"))
spec_res = json.load(open(os.path.join(repo,"recovery/reconciliation/1_7_2_special_case_resolution.json"),"r",encoding="utf-8"))

# Build application script that applies resolutions to create candidate v2
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# Start from candidate
import copy
v2 = copy.deepcopy(json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate.json"),"r",encoding="utf-8")))

applied = []
unresolved_keep = []

# Apply line field resolutions
for lr in line_res["resolutions"]:
    lid = lr["line_id"]
    for field, decision in lr["fields"].items():
        if decision["decision"] == "ACCEPT_SOURCE":
            v2["lines"][lid][field] = lr.get("source_value") or src["lines"][lid].get(field)
            applied.append({"line": lid, "field": field, "action": "ACCEPT_SOURCE"})
        elif decision["decision"] == "ACCEPT_CURRENT":
            v2["lines"][lid][field] = cur["lines"][lid].get(field)
            applied.append({"line": lid, "field": field, "action": "ACCEPT_CURRENT"})
        elif decision["decision"] == "UNRESOLVED":
            unresolved_keep.append({"line": lid, "field": field, "reason": decision["reason"]})

# Apply special cases
# Bakurōmae: remove mojibake duplicate, keep correct one
if spec_res["bakurōmae_dedup"]["status"] == "PENDING_APPROVAL":
    for sid in list(v2["stations"].keys()):
        if sid != "Bakurōmae" and "Baku" in sid:
            del v2["stations"][sid]
            applied.append({"station": sid, "action": "REMOVE_DUPLICATE"})
    # Update name_map references
    new_nm = {}
    for k, v in v2["name_map"].items():
        if k == "Bakurﾅ肯ae":
            new_nm["Bakurōmae"] = v
        elif v == "Bakurﾅ肯ae":
            new_nm[k] = "Bakurōmae"
        else:
            new_nm[k] = v
    v2["name_map"] = new_nm
    applied.append({"action": "DEDUP_BAKUR", "details": "Removed mojibake ID, merged name_map refs"})

# Keep Daikanyama as orphan (do nothing)
applied.append({"action": "DOCUMENT_DAIKANYAMA_ORPHAN", "status": "accepted"})

# Recompute relation layer from resolved lines
station_lines = {}
line_station_order = {}
for lid, l in v2["lines"].items():
    line_station_order[lid] = {}
    for order, sid in enumerate(l.get("stations", [])):
        line_station_order[lid][sid] = order
        station_lines.setdefault(sid, []).append({"line_id": lid, "station_order": order})

v2["stationLines"] = station_lines
v2["lineStationOrder"] = line_station_order

# Statistics
print(f"Applied resolutions: {len(applied)}")
print(f"Unresolved keeping: {len(unresolved_keep)}")
print(f"Candidate v2 lines: {len(v2['lines'])}")
print(f"Candidate v2 stations: {len(v2['stations'])}")
print(f"Candidate v2 stationLines: {len(v2['stationLines'])}")
print(f"Candidate v2 lineStationOrder: {len(v2['lineStationOrder'])}")

# Data loss check
src_lines = set(src["lines"].keys())
cand_lines = set(v2["lines"].keys())
lost_lines = src_lines - cand_lines
print(f"Lost lines: {lost_lines}")

src_st = set(src["stations"].keys())
cand_st = set(v2["stations"].keys())
lost_st = src_st - cand_st
print(f"Lost stations: {lost_st}")

# Check orphans in v2
all_refs = set()
for l in v2["lines"].values():
    all_refs.update(l.get("stations", []))
orphans = all_refs - cand_st
print(f"Orphan refs in v2: {len(orphans)}")

# Save v2
out_path = os.path.join(repo, "recovery", "output", "railway_data_candidate_v2.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(v2, f, ensure_ascii=False, indent=2)
print(f"\nSaved candidate v2 to {out_path}")

# Save application log
log = {
    "timestamp": datetime.now().isoformat(),
    "task": "1.7 Candidate Data Reconciliation",
    "applied": applied,
    "unresolved": unresolved_keep,
    "validation": {
        "lines": len(v2["lines"]),
        "stations": len(v2["stations"]),
        "lost_lines": sorted(lost_lines),
        "lost_stations": sorted(lost_st),
        "orphan_refs": len(orphans),
        "all_checks_pass": len(lost_lines) == 0 and len(lost_st) == 0,
    }
}
log_path = os.path.join(repo, "recovery", "output", "candidate_v2_log.json")
with open(log_path, "w", encoding="utf-8") as f:
    json.dump(log, f, indent=2, ensure_ascii=False)
print(f"Saved log to {log_path}")