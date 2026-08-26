import json, os
from datetime import datetime
repo = os.getcwd()

# Step 7: Define migration rules (old structure -> new structure)
rules = {
    "timestamp": datetime.now().isoformat(),
    "migration_rules": {
        "line.stations[] -> lineStationOrder": {
            "description": "Line stations array becomes a dict mapping station_id to order index",
            "old": "line.stations = ['A','B','C']",
            "new": "lineStationOrder[line_id] = {'A': 0, 'B': 1, 'C': 2}",
            "computed": True
        },
        "line.stations[] + line_id -> stationLines": {
            "description": "Each station gets a list of line refs from all lines that include it",
            "old": "line.stations = [...]",
            "new": "stationLines[station_id] = [{'line_id': lid, 'station_order': i}, ...]",
            "computed": True
        },
        "station.lines[] -> stationLines (derived)": {
            "description": "Station-level lines array is redundant with stationLines; can be derived",
            "old": "station.lines = ['LineA', 'LineB']",
            "new": "stationLines[station_id] already contains this info",
            "computed": True
        },
        "station.{lat, lng}": {
            "description": "Coordinate fields remain unchanged",
            "old": "station = {'lat': 35.x, 'lng': 139.x}",
            "new": "station = {'lat': 35.x, 'lng': 139.x}",
            "computed": False
        },
        "name_map": {
            "description": "Japanese name -> other language name mapping preserved as-is",
            "computed": False
        },
        "tourism": {
            "description": "Tourism spots preserved as-is",
            "computed": False
        }
    },
    "structure_comparison": {
        "old_model": ["stations (dict)", "lines (dict)", "name_map (dict)", "tourism (dict)", "stationLines (dict)", "lineStationOrder (dict)"],
        "new_model": ["stations (dict, lat+lng only)", "lines (dict, stations array preserved)", "name_map (dict)", "tourism (dict)", "stationLines (dict, computed at runtime)", "lineStationOrder (dict, computed at runtime)"],
        "note": "Relationship layers (stationLines, lineStationOrder) are derived from lines.stations at runtime by db-loader.js fallback"
    },
    "missing_field_policy": {
        "station.lines field": {
            "status": "MISSING in current, PRESENT in source",
            "action": "Derivable from stationLines / lines.stations",
            "canonical_entry": False,
            "note": "Not stored in canonical; derived on demand"
        },
        "stationLines field": {
            "status": "MISSING in current (0 entries), PRESENT in source (1864 entries)",
            "action": "Can be derived from lines.stations at runtime",
            "canonical_entry": False,
            "note": "Runtime computation covers this"
        },
        "lineStationOrder field": {
            "status": "MISSING in current (0 entries), PRESENT in source (152 entries)",
            "action": "Can be derived from lines.stations at runtime",
            "canonical_entry": False,
            "note": "Runtime computation covers this"
        }
    }
}
open(os.path.join(repo,"recovery","reports","07_migration_rules.json"),"w",encoding="utf-8").write(json.dumps(rules,indent=2,ensure_ascii=False)+chr(10))
print("07 done")