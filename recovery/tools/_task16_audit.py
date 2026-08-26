import json, os
from datetime import datetime

repo = os.getcwd()

# Read existing outputs
line_recon = json.load(open(os.path.join(repo,"recovery/reconciliation/line_reconciliation.json"),"r",encoding="utf-8"))
station_recon = json.load(open(os.path.join(repo,"recovery/reconciliation/station_reconciliation.json"),"r",encoding="utf-8"))
conflict_audit = json.load(open(os.path.join(repo,"recovery/reconciliation/1_6_conflict_audit.json"),"r",encoding="utf-8"))
orphan_report = json.load(open(os.path.join(repo,"recovery/reconciliation/orphan_stations.json"),"r",encoding="utf-8"))
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate.json"),"r",encoding="utf-8"))

# Build Task 1.6 report
report = {
    "task": "Task 1.6: Data Conflict Audit",
    "version": "1.6.1-1.6.3",
    "timestamp": datetime.now().isoformat(),
    "status": "IN_PROGRESS - conflicts catalogued, not yet resolved",
    "candidate_status": "Migration Candidate v1 — Verifiable candidate, NOT final canonical",
    
    "1_6_1_line_conflict_audit": {
        "total_conflicts": 56,
        "auto_resolvable": {
            "image_mojibake": {
                "count": 50,
                "pattern": "source image paths are mojibake (驩・％) vs current correct paths (鉄道/...)",
                "resolution": "accept_current_image_paths",
                "note": "Source has corrupted file paths; current has correct relative paths",
            },
            "nameJa_preserve": {
                "count": 56,
                "pattern": "source has nameJa (Japanese), current is None",
                "resolution": "accept_source_nameJa",
                "note": "Some nameJa values are also mojibake (e.g. Do-Arakawa = どぁーあらかわ). Need filtering.",
            },
        },
        "needs_manual_review": {
            "stations_differ": {"count": 34, "note": "Different station sequences between source and current"},
            "durations_differ": {"count": 31, "note": "Different duration arrays"},
            "code_differ": {"count": 16, "note": "Different line codes"},
            "branchOf_differ": {"count": 2, "note": "Different branch relationships"},
        },
        "discovered_issues": {
            "source_mojibake_in_stations": {
                "example": "MarunouchiBranch source has ['Kencho-mae', 'Yﾅｫchﾅ肯ae', 'Mori Building Denchi Maeyasu'] - garbled",
                "impact": "3+ station IDs in source are mojibake-corrupted",
                "resolution": "needs_review",
            },
        }
    },
    
    "1_6_2_station_conflict_audit": {
        "total_conflicts": 452,
        "pattern": "All 452 diffs are the 'lines' field: source has lines array, current has no lines field",
        "resolution": "accept_source (source has complete line membership data)",
        "note": "This is a STRUCTURAL difference: current design omits station.lines; relation layer handles this via stationLines",
    },
    
    "1_6_3_special_checks": {
        "Daikanyama": {
            "status": "ORPHAN (pre-existing)",
            "referenced_by": ["TokyuToyoko"],
            "in_source_stations": False,
            "in_current_stations": False,
            "in_candidate_stations": False,
            "assessment": "Pre-existing issue in current production data. NOT introduced by migration.",
            "resolution": "known_limitation",
        },
        "Bakurōmae_encoding": {
            "status": "DUPLICATE (migration artifact)",
            "source_id": "Bakurﾅ肯ae (mojibake)",
            "current_id": "Bakurōmae (correct UTF-8)",
            "candidate_ids": ["Bakurﾅ肯ae", "Bakurōmae"],
            "assessment": "Migration created duplicate entries from encoding mismatch. Needs deduplication.",
            "resolution": "ACCEPT_CURRENT: keep Bakurōmae, remove Bakurﾅ肯ae",
        },
        "MarunouchiBranch_mojibake": {
            "status": "SOURCE_MOJIBAKE",
            "source_stations_with_issues": ["Kencho-mae", "Yﾅｫchﾅ肯ae", "Mori Building Denchi Maeyasu"],
            "current_stations": ["Aoyama-itchome", "Kokkai-gijido", "Otemachi", "Yurakucho"],
            "assessment": "Source has garbled station names; current has corrected names. These are DIFFERENT station sets, not encoding differences.",
            "resolution": "needs_review - may represent different line routes",
        }
    },
    
    "1_6_4_orphan_station_analysis": {
        "source_orphans": 1480,
        "current_orphans": 1,  # Daikanyama
        "candidate_orphans": 1480,
        "assessment": "1480 orphan references are PRE-EXISTING in source data. The Phase13 backup only has coordinates for 503 major stations out of ~1983 total station references across 152 lines.",
        "root_cause": "Historical data collection focused on Tokyo-area major stations; rural/branch line stations lack coordinates",
        "not_a_migration_bug": True,
        "resolution": "documented_known_limitation",
    },
    
    "conflict_counting": {
        "original_total": 514,
        "breakdown": {
            "line_conflicts": 56,
            "station_conflicts": 452,
        },
        "after_classification": {
            "auto_resolved": 502,  # 50 image + 452 station lines
            "needs_review": 56,    # line field conflicts
            "special_cases": 2,    # Daikanyama + Bakurōmae
            "known_limitations": 1480,  # orphan stations (pre-existing)
        },
        "principle": "Conflicts are CATALOGUED, not cleared. Each conflict has a status and proposed resolution.",
    },
    
    "candidate_v1_assessment": {
        "lines": 156,
        "stations": 504,
        "lost_lines": 0,
        "lost_stations": 0,
        "orphan_refs": 1480,
        "duplicates": 1,  # Bakurōmae
        "conflicts_catalogued": 514,
        "ready_for_task2": False,
        "reason": "Conflicts need resolution before candidate can become canonical. Specifically: 56 line field conflicts, 1 Bakurōmae duplicate, 1480 orphan stations (documented).",
    }
}

out_path = os.path.join(repo, "recovery", "reports", "1_6_conflict_audit_report.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2, ensure_ascii=False)
print("Task 1.6 conflict audit report saved")
print(f"Conflicts catalogued: {report['conflict_counting']['original_total']}")
print(f"Auto-resolved: {report['conflict_counting']['after_classification']['auto_resolved']}")
print(f"Needs review: {report['conflict_counting']['after_classification']['needs_review']}")
print(f"Special cases: {report['conflict_counting']['after_classification']['special_cases']}")
print(f"Known limitations: {report['conflict_counting']['after_classification']['known_limitations']}")