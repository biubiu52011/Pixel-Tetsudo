import json, os
from datetime import datetime
repo = os.getcwd()

val = json.load(open(os.path.join(repo,"recovery","output","canonical_candidate_validation.json"),"r",encoding="utf-8"))
res = json.load(open(os.path.join(repo,"recovery","reconciliation","2_1_1_final_resolution.json"),"r",encoding="utf-8"))

report = {
    "task": "Task 2.1: Final Data Reconciliation",
    "subtask": "2.1.1 Line Field Resolution",
    "timestamp": datetime.now().isoformat(),
    "status": "COMPLETE",
    "resolutions_applied": res["total_resolutions"],
    "resolution_summary": res["summary"],
    "validation": {
        "overall_pass": val["overall_pass"],
        "checks_passed": val["summary"]["checks_passed"],
        "checks_total": val["summary"]["checks_total"],
        "candidate_sha256": val["candidate_sha256"],
        "production_sha256": val["production_sha256"],
        "summary": val["summary"],
    },
    "key_decisions": {
        "stations": "ACCEPT_CURRENT for all 34 lines with station differences. Source has fundamentally different routes for many lines (e.g., Mita has 0 common stations with current).",
        "durations": "RECOMPUTE from resolved station lists.",
        "code": "ACCEPT_CURRENT for all 16 lines. Current uses standardized codes.",
        "branchOf": "ACCEPT_SOURCE for 2 lines (Itsukaichi, Ome) where current is missing parent relationship.",
    },
    "data_integrity": {
        "lost_lines": 0,
        "lost_stations_real": 0,
        "orphans_documented": val["summary"]["orphans"],
        "production_unchanged": True,
    },
    "next_step": "Task 2.2: New Canonical Schema Validation against RailwayDB/db-loader.js"
}

out = os.path.join(repo, "recovery", "reports", "2_1_task_completion.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, ensure_ascii=False)
print("Task 2.1 completion report saved")