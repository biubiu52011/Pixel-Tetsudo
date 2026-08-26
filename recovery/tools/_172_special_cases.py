import json, os
from datetime import datetime

repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate.json"),"r",encoding="utf-8"))

# ========== 1.7.2 Special Case Resolution ==========

# 1.7.2a: Bakurōmae deduplication
print("=== 1.7.2a: Bakurōmae Deduplication ===")
# Find all references to both IDs
bak_mojibake = None
bak_correct = None
for sid in cand["stations"].keys():
    if "Bakur" in sid and "Ō" not in sid and "ō" not in sid:
        bak_mojibake = sid
    elif sid == "Bakurōmae":
        bak_correct = sid

print(f"Mojibake ID: {bak_mojibake}")
print(f"Correct ID: {bak_correct}")

# Find which lines reference each
if bak_mojibake:
    lines_ref_moj = [lid for lid, l in cand["lines"].items() if bak_mojibake in l.get("stations",[])]
    print(f"Lines referencing mojibake ID: {lines_ref_moj}")
if bak_correct:
    lines_ref_corr = [lid for lid, l in cand["lines"].items() if bak_correct in l.get("stations",[])]
    print(f"Lines referencing correct ID: {lines_ref_corr}")

# Check name_map references
nm_src_moj = [(k,v) for k,v in cand["name_map"].items() if bak_mojibake and (k == bak_mojibake or v == bak_mojibake)]
nm_src_corr = [(k,v) for k,v in cand["name_map"].items() if bak_correct and (k == bak_correct or v == bak_correct)]
print(f"name_map refs to mojibake: {nm_src_moj}")
print(f"name_map refs to correct: {nm_src_corr}")

# 1.7.2b: Daikanyama orphan documentation
print("\n=== 1.7.2b: Daikanyama Orphan ===")
print(f"In stations dict: {'Daikanyama' in cand['stations']}")
ref_lines = [lid for lid, l in cand["lines"].items() if "Daikanyama" in l.get("stations",[])]
print(f"Referenced by: {ref_lines}")
for lid in ref_lines:
    order = cand["lines"][lid]["stations"].index("Daikanyama")
    print(f"  {lid} at order {order}")

# Save special case resolution
resolution = {
    "timestamp": datetime.now().isoformat(),
    "task": "1.7.2 Special Case Resolution",
    "bakurōmae_dedup": {
        "mojibake_id": bak_mojibake,
        "correct_id": bak_correct,
        "action": "MERGE",
        "resolution": "Replace all references from mojibake ID to correct ID; remove duplicate station entry",
        "status": "PENDING_APPROVAL",
    },
    "daikanyama_orphan": {
        "station_id": "Daikanyama",
        "in_stations_dict": False,
        "referenced_by": ref_lines,
        "action": "DOCUMENT_AS_ORPHAN",
        "resolution": "Pre-existing orphan; do NOT create fake entity; keep line references as-is",
        "status": "ACCEPTED",
    }
}

out_path = os.path.join(repo, "recovery", "reconciliation", "1_7_2_special_case_resolution.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(resolution, f, indent=2, ensure_ascii=False)
print(f"\nSaved to {out_path}")