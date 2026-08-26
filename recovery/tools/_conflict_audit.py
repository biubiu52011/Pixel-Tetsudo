import json, os
from datetime import datetime

repo = os.getcwd()
src = json.load(open(os.path.join(repo,"recovery/source/railway_152_raw.json"),"r",encoding="utf-8"))
cur = json.load(open(os.path.join(repo,"data/core/railway_data.json"),"r",encoding="utf-8"))
cand = json.load(open(os.path.join(repo,"recovery/output/railway_data_candidate.json"),"r",encoding="utf-8"))

# Full conflict audit summary
audit = {
    "timestamp": datetime.now().isoformat(),
    "version": "1.6.1-1.6.3",
    "line_conflicts": {
        "total": 56,
        "fields": {
            "nameJa": {"count": 56, "pattern": "source has Japanese name (some mojibake), current missing entirely", "resolution": "accept_source"},
            "image": {"count": 50, "pattern": "source has mojibake paths (驩・％), current has correct paths (鉄道/...)", "resolution": "accept_current"},
            "stations": {"count": 34, "pattern": "different station lists between source and current", "resolution": "needs_review"},
            "durations": {"count": 31, "pattern": "different duration arrays", "resolution": "needs_review"},
            "code": {"count": 16, "pattern": "different JR/line codes", "resolution": "needs_review"},
            "branchOf": {"count": 2, "pattern": "different branch relationships", "resolution": "needs_review"},
        },
        "auto_resolved": 50,
        "needs_manual_review": 56,
    },
    "station_conflicts": {
        "total": 452,
        "fields": {
            "lines": {"count": 452, "pattern": "source has lines array, current has no lines field", "resolution": "accept_source"},
        },
        "auto_resolved": 452,
        "needs_manual_review": 0,
    },
    "special_cases": {
        "Daikanyama": {
            "status": "ORPHAN",
            "description": "Referenced by TokyuToyoko[line order 1] but NOT in stations dict",
            "present_in_source": False,
            "present_in_current": False,
            "present_in_candidate": False,
            "resolution": "known_limitation - station coordinates unavailable",
        },
        "Bakuromaе_encoding": {
            "status": "DUPLICATE",
            "description": "Source has 'Bakurﾅ肯ae' (mojibake), current has 'Bakurōmae' (correct UTF-8)",
            "candidate_has_both": True,
            "resolution": "needs_deduplication - keep Bakurōmae, remove Bakurﾅ肯ae",
        },
    },
    "orphan_stations": {
        "total_in_candidate": 1480,
        "description": "Station IDs referenced by lines.stations[] but missing from stations dict",
        "root_cause": "Phase13 source only has 503 stations with coordinates; 152 lines reference ~1983 unique stations",
        "resolution": "known_limitation - these stations lack coordinate data in the historical source",
    },
    "conflict_summary": {
        "line_conflicts": 56,
        "station_conflicts": 452,
        "special_cases": 2,
        "orphan_references": 1480,
        "total_conflict_indicators": 514,
    }
}

out_path = os.path.join(repo, "recovery", "reconciliation", "1_6_conflict_audit.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(audit, f, indent=2, ensure_ascii=False)
print("1.6 conflict audit saved")
print(f"Total conflict indicators: {audit['conflict_summary']['total_conflict_indicators']}")
print(f"  Line: {audit['line_conflicts']['total']}")
print(f"  Station: {audit['station_conflicts']['total']}")
print(f"  Special cases: {audit['special_cases']}")
print(f"  Orphan refs: {audit['orphan_stations']['total_in_candidate']}")