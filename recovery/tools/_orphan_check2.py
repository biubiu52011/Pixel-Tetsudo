import json, os
from datetime import datetime

repo = os.getcwd()
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate.json"),"r",encoding="utf-8"))
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))

# Comprehensive orphan analysis
all_ref_stations = set()
ref_by_line = {}
for lid, l in cand["lines"].items():
    for s in l.get("stations", []):
        all_ref_stations.add(s)
        ref_by_line.setdefault(s, []).append(lid)

in_dict = set(cand["stations"].keys())
orphans = all_ref_stations - in_dict

# Classify orphans
# Type 1: Referenced by 1 line (likely a real station that just lacks coords)
# Type 2: Referenced by multiple lines (definitely a real station)
single_ref = {s: ref_by_line[s] for s in orphans if len(ref_by_line[s]) == 1}
multi_ref = {s: ref_by_line[s] for s in orphans if len(ref_by_line[s]) > 1}

# Check which orphans exist in source stations
in_src = orphans & set(src["stations"].keys())
not_in_src = orphans - set(src["stations"].keys())

print(f"Total orphan stations: {len(orphans)}")
print(f"  Single-line references: {len(single_ref)}")
print(f"  Multi-line references: {len(multi_ref)}")
print(f"  In source stations: {len(in_src)}")
print(f"  NOT in source stations: {len(not_in_src)}")

# Top multi-reference orphans
print("\nTop multi-reference orphans:")
for s in sorted(multi_ref.keys(), key=lambda x: -len(multi_ref[x]))[:20]:
    print(f"  {s}: {[l[:20] for l in multi_ref[s]]}")

# Save full orphan report
orphan_report = {
    "timestamp": datetime.now().isoformat(),
    "total_orphan_stations": len(orphans),
    "single_line_refs": len(single_ref),
    "multi_line_refs": len(multi_ref),
    "orphans_in_source": len(in_src),
    "orphans_not_in_source": len(not_in_src),
    "sample_orphans": sorted(list(orphans))[:50],
    "top_multi_ref_orphans": {s: multi_ref[s] for s in sorted(multi_ref.keys(), key=lambda x: -len(multi_ref[x]))[:20]},
}
out_path = os.path.join(repo, "recovery", "reconciliation", "orphan_stations.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(orphan_report, f, indent=2, ensure_ascii=False)
print(f"\nSaved to {out_path}")