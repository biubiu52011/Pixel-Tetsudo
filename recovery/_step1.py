import json, hashlib, os, subprocess
from datetime import datetime
repo = os.getcwd()
r = subprocess.run(["git","rev-parse","HEAD"], capture_output=True, text=True)
head = r.stdout.strip()
r2 = subprocess.run(["git","branch","--show-current"], capture_output=True, text=True)
branch = r2.stdout.strip()
r3 = subprocess.run(["git","remote","-v"], capture_output=True, text=True)
remote = r3.stdout.strip()
r4 = subprocess.run(["git","status","--short"], capture_output=True, text=True)
wt = r4.stdout.strip()
state = {"timestamp": datetime.now().isoformat(), "head_sha": head, "branch": branch, "remote": remote, "working_tree_clean": wt == "", "untracked_count": len([l for l in wt.split(chr(10)) if l.startswith("??")]) if wt else 0, "railway_data_json": {"path": "data/core/railway_data.json", "sha256": "D759E38E5F54C0077137F4E137D0F32CD4DEBB01C6FDB68D5658C2B421E7677B", "size_bytes": 313327}}
open(os.path.join(repo,"recovery","reports","01_frozen_state.json"),"w",encoding="utf-8").write(json.dumps(state,indent=2,ensure_ascii=False)+chr(10))
print("01 done")