import json, os
repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# Code field differences
print("=== CODE FIELD DIFFERENCES ===")
for lid in sorted(src["lines"].keys()):
    if lid not in cur["lines"]:
        continue
    sc = src["lines"][lid].get("code", "")
    cc = cur["lines"][lid].get("code", "")
    if sc != cc:
        print(f"  {lid}: source={repr(sc)} current={repr(cc)}")

# branchOf differences
print("\n=== BRANCHOF FIELD DIFFERENCES ===")
for lid in sorted(src["lines"].keys()):
    if lid not in cur["lines"]:
        continue
    sb = src["lines"][lid].get("branchOf")
    cb = cur["lines"][lid].get("branchOf")
    if sb != cb:
        print(f"  {lid}: source={repr(sb)} current={repr(cb)}")