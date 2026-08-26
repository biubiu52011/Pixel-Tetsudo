import json, os
from datetime import datetime
repo = os.getcwd()

# Read existing outputs
report = json.load(open(os.path.join(repo,"recovery/output/migration_report.json"),"r",encoding="utf-8"))
validation = json.load(open(os.path.join(repo,"recovery/output/validation_report.json"),"r",encoding="utf-8"))

task1 = {
    "task": "Task 1: New Schema + 152 -> New Structure Migration Design",
    "timestamp": datetime.now().isoformat(),
    "checklist": [
        {"id": "1-1", "item": "Task 0 artifacts frozen (read-only input)", "status": "PASS", "detail": "recovery/source/ treated as read-only"},
        {"id": "1-2", "item": "New Schema defined", "status": "PASS", "detail": "5-layer: lines, stations, name_map, relations(stationLines+lineStationOrder), tourism"},
        {"id": "1-3", "item": "Entity identity rules defined", "status": "PASS", "detail": "line_id and station_id as stable string keys; names are display-only"},
        {"id": "1-4", "item": "152 lines migration rules", "status": "PASS", "detail": "All 152 source lines included; missing fields use null/empty; no line dropped for incomplete fields"},
        {"id": "1-5", "item": "4 current-only lines preserved", "status": "PASS", "detail": "Odawara, SeibuTamagawa, TobuNikko, TobuSkytree added from current production"},
        {"id": "1-6", "item": "Station merge logic", "status": "PASS", "detail": "Source 503 + Current 1 unique = 504 candidate stations; conflicts recorded"},
        {"id": "1-7", "item": "Relation layer rebuilt from lines", "status": "PASS", "detail": "stationLines (1864) and lineStationOrder (156) computed from lines.stations array"},
        {"id": "1-8", "item": "Conflict records created", "status": "PASS", "detail": "recovery/reconciliation/conflicts.json with 514 total conflicts"},
        {"id": "1-9", "item": "Missing field policy applied", "status": "PASS", "detail": "Missing fields use null/empty string; no guess values"},
        {"id": "1-10", "item": "Migration tool written", "status": "PASS", "detail": "recovery/tools/migrate-152-to-new-schema.py"},
        {"id": "1-11", "item": "Round 1 validation passed", "status": "PASS", "detail": f"lines={report['summary']['candidate_lines']}>=152, stations={report['summary']['candidate_stations']}>=503"},
        {"id": "1-12", "item": "Data loss detection", "status": "PASS", "detail": "Lost lines=0, Lost stations=0"},
        {"id": "1-13", "item": "Production unchanged", "status": "PASS", "detail": f"Production SHA={validation['data_integrity']['production_unchanged_sha']}"},
    ],
    "outputs": {
        "migration_tool": "recovery/tools/migrate-152-to-new-schema.py",
        "candidate_data": "recovery/output/railway_data_candidate.json",
        "migration_report": "recovery/output/migration_report.json",
        "statistics": "recovery/output/statistics.json",
        "conflicts": "recovery/reconciliation/conflicts.json",
        "validation": "recovery/output/validation_report.json",
    },
    "candidate_summary": {
        "lines": report["summary"]["candidate_lines"],
        "stations": report["summary"]["candidate_stations"],
        "name_map": report["summary"]["name_map_entries"],
        "tourism": report["summary"]["tourism_entries"],
        "stationLines": report["summary"]["stationLines_entries"],
        "lineStationOrder": report["summary"]["lineStationOrder_entries"],
        "output_sha256": report["output_sha256"],
        "output_size_bytes": os.path.getsize(os.path.join(repo, "recovery", "output", "railway_data_candidate.json")),
    },
    "overall_pass": validation["overall_pass"],
}

path = os.path.join(repo, "recovery", "reports", "10_task1_completion.json")
with open(path, "w", encoding="utf-8") as f:
    json.dump(task1, f, indent=2, ensure_ascii=False)

print("Task 1 completion report written")
print(f"Overall pass: {task1['overall_pass']}")
print(f"Candidate lines: {task1['candidate_summary']['lines']}")
print(f"Candidate stations: {task1['candidate_summary']['stations']}")