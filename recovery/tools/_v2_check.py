import json, os
repo = os.getcwd()
v2 = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate_v2.json"),"r",encoding="utf-8"))
v1 = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate.json"),"r",encoding="utf-8"))
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))

# Check specific field resolutions
print("=== Image field check (sample) ===")
for lid in ["ChuoRapid", "Yamanote", "KeihinTohoku"]:
    if lid in v2["lines"]:
        print(f"  {lid}: {v2['lines'][lid].get('image','')[:60]}")

print("\n=== nameJa field check (sample) ===")
for lid in ["ChuoRapid", "Asakusa", "Do-Arakawa"]:
    if lid in v2["lines"]:
        print(f"  {lid}: {repr(v2['lines'][lid].get('nameJa',''))}")

print("\n=== Station lists comparison (sample) ===")
for lid in ["ChuoRapid", "MarunouchiBranch"]:
    if lid in v2["lines"] and lid in src["lines"]:
        vs = v2["lines"][lid]["stations"]
        ss = src["lines"][lid]["stations"]
        cs = v1["lines"][lid]["stations"]
        print(f"  {lid}:")
        print(f"    v1: {cs[:5]}...")
        print(f"    v2: {vs[:5]}...")
        print(f"    src: {ss[:5]}...")

print("\n=== Candidate v1 vs v2 diff ===")
print(f"v1 lines: {len(v1['lines'])}, v2 lines: {len(v2['lines'])}")
print(f"v1 stations: {len(v1['stations'])}, v2 stations: {len(v2['stations'])}")
print(f"v1 stationLines: {len(v1['stationLines'])}, v2 stationLines: {len(v2['stationLines'])}")

# Check what changed
v1_line_ids = set(v1["lines"].keys())
v2_line_ids = set(v2["lines"].keys())
print(f"Line ID diff: {v1_line_ids.symmetric_difference(v2_line_ids)}")

v1_st_ids = set(v1["stations"].keys())
v2_st_ids = set(v2["stations"].keys())
print(f"Station ID diff: {v1_st_ids.symmetric_difference(v2_st_ids)}")