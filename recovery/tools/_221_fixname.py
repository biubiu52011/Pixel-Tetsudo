import json, os
from datetime import datetime

repo = os.getcwd()
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_canonical_candidate.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# Fix: Some current-only lines might be missing "name" field
# Check which lines have no name
no_name = [lid for lid, l in cand["lines"].items() if not l.get("name")]
print(f"Lines missing 'name' field: {len(no_name)}")
for lid in no_name:
    l = cand["lines"][lid]
    print(f"  {lid}: keys={sorted(l.keys())}")

# Also check: are these lines in the current production?
in_cur = [lid for lid in no_name if lid in cur["lines"]]
print(f"\nAlso missing in current production: {in_cur}")

# The issue is likely that these 4 current-only lines (Odawara etc) were added 
# without a "name" field. Let's check
for lid in ["Odawara", "SeibuTamagawa", "TobuNikko", "TobuSkytree"]:
    if lid in cand["lines"]:
        l = cand["lines"][lid]
        print(f"\n{lid}: name={l.get('name','MISSING')}, nameEn={l.get('nameEn','MISSING')}")
        if lid in cur["lines"]:
            cl = cur["lines"][lid]
            print(f"  Current: name={cl.get('name','MISSING')}, nameEn={cl.get('nameEn','MISSING')}")