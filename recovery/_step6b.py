import json, os
from datetime import datetime
repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))

# Also diff stations
st_src = set(src["stations"].keys())
st_cur = set(cur["stations"].keys())
diff_stations = {
    "in_152_only": sorted(st_src - st_cur),
    "in_60_only": sorted(st_cur - st_src),
    "in_both": sorted(st_src & st_cur),
    "both_count": len(st_src & st_cur),
}

# Check station content differences
content_diffs = []
for sid in st_src & st_cur:
    ss = src["stations"][sid]
    cs = cur["stations"][sid]
    if ss != cs:
        content_diffs.append({"station_id": sid, "source_keys": sorted(ss.keys()), "current_keys": sorted(cs.keys())})

diff_stations["content_diffs"] = content_diffs[:20]
diff_stations["content_diff_count"] = len(content_diffs)

open(os.path.join(repo,"recovery","reports","06_station_diff.json"),"w",encoding="utf-8").write(json.dumps(diff_stations,indent=2,ensure_ascii=False)+chr(10))
print("Station diff done")
print("In 152 only:", len(diff_stations["in_152_only"]))
print("In 60 only:", len(diff_stations["in_60_only"]))
print("In both:", diff_stations["both_count"])
print("Content diffs:", diff_stations["content_diff_count"])