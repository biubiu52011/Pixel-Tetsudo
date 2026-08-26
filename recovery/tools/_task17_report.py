import json, os
from datetime import datetime
repo = os.getcwd()

# Compile task 1.7 completion report
v2_val = json.load(open(os.path.join(repo,"recovery/output/candidate_v2_validation.json"),"r",encoding="utf-8"))
line_res = json.load(open(os.path.join(repo,"recovery/reconciliation/1_7_1_line_field_resolution.json"),"r",encoding="utf-8"))
spec_res = json.load(open(os.path.join(repo,"recovery/reconciliation/1_7_2_special_case_resolution.json"),"r",encoding="utf-8"))

report = {
    "task": "Task 1.7: Candidate Data Reconciliation",
    "version": "1.7.1-1.7.6",
    "timestamp": datetime.now().isoformat(),
    "subtasks": {
        "1.7.1_Line_Field_Resolution": {
            "status": "DONE",
            "lines_analyzed": line_res["total_lines_analyzed"],
            "field_decisions": line_res["total_field_decisions"],
            "decision_summary": line_res["statistics"],
        },
        "1.7.2_Special_Case_Resolution": {
            "status": "DONE",
            "bakurōmae": {
                "action": "DEDUP",
                "kept": "Bakurōmae",
                "removed": "Bakurﾅ肯ae (mojibake duplicate)",
                "status": "RESOLVED",
            },
            "daikanyama": {
                "action": "DOCUMENT_ORPHAN",
                "referenced_by": ["TokyuToyoko"],
                "status": "ACCEPTED_AS_KNOWN_LIMITATION",
            }
        },
        "1.7.3_Station_Identity": {
            "status": "DONE",
            "dedup": "Bakurōmae resolved",
            "orphan": "Daikanyama documented",
        },
        "1.7.4_Orphan_Reference_Classification": {
            "status": "DONE",
            "orphan_count": 1477,
            "classification": "DATA_QUALITY_LIMITATION (pre-existing, not migration bug)",
            "policy": "Keep line references intact; do NOT truncate lines due to missing station entities",
        },
        "1.7.5_Data_Loss_Audit": {
            "status": "DONE",
            "lost_lines": 0,
            "lost_stations_real": 0,
            "lost_stations_dedup": 1,
            "all_checks_pass": v2_val["overall_pass"],
        },
        "1.7.6_Candidate_v2_Validation": {
            "status": "DONE",
            "overall_pass": v2_val["overall_pass"],
            "checks_passed": v2_val["summary"]["checks_passed"],
            "checks_total": v2_val["summary"]["checks_total"],
            "candidate_sha256": v2_val["candidate_sha256"],
            "summary": v2_val["summary"],
        }
    },
    "candidate_v2_summary": {
        "lines": 156,
        "stations": 503,
        "stationLines": 1862,
        "lineStationOrder": 156,
        "orphans": 1477,
        "clean_nameJa": 131,
        "mojibake_nameJa": 0,
        "mojibake_image": 0,
    },
    "production_status": {
        "file": "data/core/railway_data.json",
        "sha256": "D759E38E5F54C0077137F4E137D0F32CD4DEBB01C6FDB68D5658C2B421E7677B",
        "modified": False,
    },
    "next_step": "Task 1.7 complete. Candidate v2 ready for review. Task 2 (formal canonical replacement) pending user approval."
}

out_path = os.path.join(repo, "recovery", "reports", "1_7_task_completion.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, ensure_ascii=False)
print("Task 1.7 completion report saved")
print(f"Overall pass: {v2_val['overall_pass']}")
print(f"Candidate v2 SHA: {v2_val['candidate_sha256']}")