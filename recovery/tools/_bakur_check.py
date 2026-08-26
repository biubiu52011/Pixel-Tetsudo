import json, os
repo = os.getcwd()
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate.json"),"r",encoding="utf-8"))

# Bakurōmae check
print("=== Bakurōmae in candidate ===")
for k in cand["stations"].keys():
    if "Baku" in k:
        print(f"  station_id: {repr(k)} -> {cand['stations'][k]}")
        refs = [lid for lid,l in cand["lines"].items() if k in l.get("stations",[])]
        print(f"    referenced by: {refs}")

# Check name_map for Bakur
print("\n=== name_map containing 'Baku' ===")
for k, v in cand["name_map"].items():
    if "Baku" in k or "Baku" in v:
        print(f"  {repr(k)} -> {repr(v)}")

# Daikanyama check  
print("\n=== Daikanyama in candidate ===")
print(f"  in stations: {'Daikanyama' in cand['stations']}")
refs = [lid for lid,l in cand["lines"].items() if "Daikanyama" in l.get("stations",[])]
print(f"  referenced by: {refs}")
for lid in refs:
    order = cand["lines"][lid]["stations"].index("Daikanyama")
    print(f"    {lid} order={order}")

# Check all unique station IDs in lines
all_refs = set()
for l in cand["lines"].values():
    all_refs.update(l.get("stations",[]))
in_dict = set(cand["stations"].keys())
orphans = all_refs - in_dict
print(f"\n=== Orphan stations summary ===")
print(f"  Total unique station refs: {len(all_refs)}")
print(f"  In stations dict: {len(in_dict)}")
print(f"  Orphans: {len(orphans)}")
print(f"  Sample orphans: {sorted(orphans)[:10]}")