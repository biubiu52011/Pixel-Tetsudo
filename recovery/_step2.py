import json, hashlib, os, subprocess, re
from datetime import datetime
repo = os.getcwd()
backup_files = [
    "data/core/railway_data_phase13_pre_coordinate_fix_backup.json",
    "data/core/railway_data_phase15_pre_cleanup_backup.json",
    "data/core/railway_data_phase29e1p0_pre_recover_backup.json",
]
results = []
for bf in backup_files:
    fp = os.path.join(repo, bf)
    if os.path.exists(fp):
        h = hashlib.sha256(open(fp,"rb").read()).hexdigest().upper()
        d = json.load(open(fp,"r",encoding="utf-8"))
        sl = d.get("stationLines")
        lso = d.get("lineStationOrder")
        results.append({"file": bf, "sha256": h, "size_bytes": os.path.getsize(fp), "lines_count": len(d.get("lines",{})), "stations_count": len(d.get("stations",{})), "name_map_count": len(d.get("name_map",{})), "stationLines_count": len(sl) if sl else 0, "lineStationOrder_count": len(lso) if lso else 0, "tourism_count": len(d.get("tourism",{})), "has_stationLines": "stationLines" in d, "has_lineStationOrder": "lineStationOrder" in d})
git_log = subprocess.run(["git","log","--all","--oneline","--","data/core/railway_data*","data/core/railway-data*"], capture_output=True, text=True).stdout.strip().split(chr(10))
r = subprocess.run(["git","show","56b2cee:data/railway/line-control-new.js"], capture_output=True, text=True, encoding="utf-8")
new_js = r.stdout
lines_new = re.findall(r'"([A-Za-z][A-Za-z0-9_]*)":\s*\{', new_js)
r2 = subprocess.run(["git","show","caeae43^:data/railway/line-control.js"], capture_output=True, text=True, encoding="utf-8")
old_js = r2.stdout
lines_old = re.findall(r'"([A-Za-z][A-Za-z0-9_]*)":\s*\{', old_js)
out = {"timestamp": datetime.now().isoformat(), "backup_analysis": results, "js_source_analysis": {"line-control-new.js@56b2cee": {"line_count": len(lines_new), "lines": sorted(lines_new)}, "line-control.js@caeae43^": {"line_count": len(lines_old), "lines": sorted(lines_old)}, "combined_unique": sorted(set(lines_new + lines_old))}, "git_history_for_data_files": [x for x in git_log if x]}
open(os.path.join(repo,"recovery","reports","02_source_analysis.json"),"w",encoding="utf-8").write(json.dumps(out,indent=2,ensure_ascii=False)+chr(10))
print("02 done")
print("line-control-new lines:", len(lines_new))
print("line-control lines:", len(lines_old))
print("combined unique:", len(set(lines_new + lines_old)))