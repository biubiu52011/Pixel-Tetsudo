import json, os
from datetime import datetime

repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate.json"),"r",encoding="utf-8"))

# Build full orphan analysis for ALL three datasets
for label, d in [("source", src), ("current", cur), ("candidate", cand)]:
    all_refs = set()
    for lid, l in d["lines"].items():
        for s in l.get("stations", []):
            all_refs.add(s)
    in_dict = set(d["stations"].keys())
    orphans = all_refs - in_dict
    print(f"{label}: refs={len(all_refs)} in_dict={len(in_dict)} orphans={len(orphans)}")
    if orphans:
        print(f"  Sample orphans: {sorted(orphans)[:10]}")

# Bakurōmae duplication analysis
print("\n=== Bakurōmae duplication ===")
for label, d in [("source", src), ("current", cur), ("candidate", cand)]:
    matches = [k for k in d["stations"].keys() if "Bakur" in k]
    print(f"{label}: {matches}")

# Check MarunouchiBranch for Y-no-kae reference
print("\n=== MarunouchiBranch station check ===")
for label, d in [("source", src), ("current", cur), ("candidate", cand)]:
    l = d["lines"].get("MarunouchiBranch", {})
    st = l.get("stations", [])
    print(f"{label} MarunouchiBranch stations: {st[:10]}...")
    # Check each station exists
    missing = [s for s in st if s not in d["stations"]]
    if missing:
        print(f"  Missing: {missing}")