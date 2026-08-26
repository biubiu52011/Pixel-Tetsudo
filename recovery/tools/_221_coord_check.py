import json, os
repo = os.getcwd()
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_canonical_candidate.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# Check which stations have invalid coords in candidate vs current
print("=== Station Coordinate Quality ===")
cand_invalid = [sid for sid, s in cand["stations"].items() 
                if not isinstance(s.get("lat"), (int, float)) or not isinstance(s.get("lng"), (int, float))]
cur_invalid = [sid for sid, s in cur["stations"].items() 
               if not isinstance(s.get("lat"), (int, float)) or not isinstance(s.get("lng"), (int, float))]
print(f"Candidate invalid coord stations: {len(cand_invalid)}")
print(f"Current invalid coord stations: {len(cur_invalid)}")
if cand_invalid:
    print(f"  Sample: {cand_invalid[:5]}")
    for sid in cand_invalid[:3]:
        print(f"    {sid}: {cand['stations'][sid]}")

# Also check the 364 vs 503 discrepancy from loader check
valid_cand = sum(1 for s in cand["stations"].values() 
                 if isinstance(s.get("lat"), (int, float)) and isinstance(s.get("lng"), (int, float)))
valid_cur = sum(1 for s in cur["stations"].values() 
                if isinstance(s.get("lat"), (int, float)) and isinstance(s.get("lng"), (int, float)))
print(f"\nCand valid coords: {valid_cand}/503")
print(f"Cur valid coords: {valid_cur}/503")