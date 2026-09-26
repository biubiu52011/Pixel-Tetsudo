#!/usr/bin/env python3
import difflib
import json, hashlib, os, re, sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

SCRIPT_FILE = os.path.abspath(__file__)
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(SCRIPT_FILE)))
BASELINE_PATH = os.path.join(REPO_ROOT, 'recovery', 'baseline', 'production_baseline.json')
CANONICAL_PATH = os.path.join(REPO_ROOT, 'data', 'core', 'railway_data.json')
MANIFEST_PATH = os.path.join(REPO_ROOT, 'recovery', 'baseline', 'approved_removal_manifest.json')

def sha256_file(path):
    with open(path, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest().upper()

def sha256_git(path):
    import subprocess
    # Use relative path for git (git show expects path relative to repo root)
    import os
    rel_path = os.path.relpath(path, REPO_ROOT).replace(chr(92), chr(47))
    r = subprocess.run(['git', 'show', 'HEAD:' + rel_path], capture_output=True)
    if r.returncode != 0:
        return sha256_file(path)
    return hashlib.sha256(r.stdout).hexdigest().upper()

def normalize_id(value):
    return re.sub(r'[^a-z0-9]+', '', str(value).lower())

def load_tourism_counts_and_keys():
    cur_tourism_stations = 0
    cur_tourism_spots = 0
    cur_tourism_spot_keys = set()
    cur_tourism = None
    if os.path.exists(CANONICAL_PATH):
        with open(CANONICAL_PATH, 'r', encoding='utf-8') as f:
            cur_tourism = json.load(f).get('tourism')
    if isinstance(cur_tourism, dict) and cur_tourism:
        cur_tourism_stations = len(cur_tourism)
        for sid, value in cur_tourism.items():
            if not isinstance(value, dict):
                continue
            spots = value.get('spots', [])
            cur_tourism_spots += len(spots)
            for spot in spots:
                cur_tourism_spot_keys.add(tourism_spot_key(spot, station_id=sid))
    else:
        # tourism 数据已迁移至独立文件 data/core/tourism_data.json（4.3.59x）
        tp = os.path.join(REPO_ROOT, 'data', 'core', 'tourism_data.json')
        if os.path.exists(tp):
            try:
                with open(tp, 'r', encoding='utf-8') as f:
                    td = json.load(f)
                if isinstance(td, dict):
                    cur_tourism_stations = len(td.get('station_exits', {}))
                    spots = td.get('spots', [])
                    cur_tourism_spots = len(spots)
                    for spot in spots:
                        cur_tourism_spot_keys.add(tourism_spot_key(spot))
            except Exception:
                pass
    return cur_tourism_stations, cur_tourism_spots, cur_tourism_spot_keys

def tourism_spot_key(spot, station_id=None):
    if not isinstance(spot, dict):
        return str(spot)
    explicit = spot.get('id') or spot.get('spot_id')
    if explicit:
        return str(explicit)
    name = spot.get('name') or spot.get('name_ja') or spot.get('title') or ''
    lat = spot.get('lat')
    lng = spot.get('lng')
    coord = ''
    if isinstance(lat, (int, float)) and isinstance(lng, (int, float)):
        coord = '@%.6f,%.6f' % (lat, lng)
    scope = station_id or spot.get('station_id') or spot.get('nearest_station') or ''
    return '%s|%s%s' % (scope, name, coord)

def possible_station_migrations(lost_station_id, current):
    stations = current.get('stations', {})
    name_map = current.get('name_map', {})
    if lost_station_id in stations:
        return [lost_station_id]
    candidates = []
    name_target = normalize_id(lost_station_id)
    station_norm = {}
    for sid in stations.keys():
        station_norm.setdefault(normalize_id(sid), []).append(sid)
    candidates.extend(station_norm.get(name_target, []))
    for key, value in name_map.items():
        values = value if isinstance(value, list) else [value]
        if normalize_id(key) == name_target:
            candidates.extend([v for v in values if v in stations])
        for v in values:
            if normalize_id(v) == name_target and v in stations:
                candidates.append(v)
    if len(candidates) < 5:
        ids = list(stations.keys())
        close = difflib.get_close_matches(lost_station_id, ids, n=5, cutoff=0.78)
        candidates.extend(close)
    out = []
    seen = set()
    for sid in candidates:
        if sid not in seen:
            seen.add(sid)
            out.append(sid)
    return out[:5]

def format_full_list(title, items, formatter=str):
    lines = ['%s (%d):' % (title, len(items))]
    for item in items:
        lines.append('    %s' % formatter(item))
    return '\n'.join(lines)

def main():
    with open(BASELINE_PATH, 'r', encoding='utf-8') as f:
        baseline = json.load(f)
    with open(CANONICAL_PATH, 'r', encoding='utf-8') as f:
        current = json.load(f)
    current_sha = sha256_git(CANONICAL_PATH)
    baseline_sha = baseline['canonical_sha256'].upper()
    errors = []
    warnings = []
    if current_sha != baseline_sha:
        warnings.append('SHA changed: baseline=%s current=%s' % (baseline_sha[:16], current_sha[:16]))
    ec = baseline['entity_counts']
    cur_lines = set(current.get('lines', {}).keys())
    cur_stations = set(current.get('stations', {}).keys())
    cur_name_map = set(current.get('name_map', {}).keys())
    cur_slo = current.get('lineStationOrder', {})
    cur_sl = current.get('stationLines', {})
    cur_tourism_stations, cur_tourism_spots, cur_tourism_spot_keys = load_tourism_counts_and_keys()
    counts = {
        'lines': len(cur_lines),
        'stations': len(cur_stations),
        'name_map': len(cur_name_map),
        'stationLines': len(cur_sl),
        'lineStationOrder': len(cur_slo),
        'tourism_stations': cur_tourism_stations,
        'tourism_spots': cur_tourism_spots,
    }
    # Load approved removal manifest
    approved_removals = {'lines': set(), 'stations': set(), 'count_adjustments': {}}
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
            manifest = json.load(f)
        removed = manifest.get('removed_entities', {})
        approved_removals['lines'] = set(removed.get('lines', []))
        approved_removals['stations'] = set(removed.get('stations', []))
        if approved_removals['lines']:
            approved_removals['count_adjustments']['lines'] = -len(approved_removals['lines'])
            warnings.append('Approved line removals: %s' % sorted(approved_removals['lines']))
        if approved_removals['stations']:
            approved_removals['count_adjustments']['stations'] = -len(approved_removals['stations'])
            warnings.append('Approved station removals: %s' % sorted(approved_removals['stations']))
    # Effective baseline counts
    effective_ec = dict(ec)
    for key, delta in approved_removals['count_adjustments'].items():
        effective_ec[key] = ec.get(key, 0) + delta
    for name, expected in effective_ec.items():
        actual = counts.get(name, 0)
        if actual < expected:
            errors.append('ENTITY LOSS: %s %d -> %d (lost %d)' % (name, expected, actual, expected - actual))
        elif actual > expected:
            warnings.append('ENTITY GAIN: %s %d -> %d' % (name, expected, actual))
    # ID subset check with approved removals
    baseline_line_ids = set(baseline.get('line_ids', []))
    baseline_station_ids = set(baseline.get('station_ids', []))
    effective_baseline_lines = baseline_line_ids - approved_removals['lines']
    effective_baseline_stations = baseline_station_ids - approved_removals['stations']
    lost_lines = sorted(effective_baseline_lines - cur_lines)
    lost_stations = sorted(effective_baseline_stations - cur_stations)
    new_lines = sorted(cur_lines - baseline_line_ids)
    new_stations = sorted(cur_stations - baseline_station_ids)
    if lost_lines:
        errors.append(format_full_list('LOST LINES', lost_lines))
    if lost_stations:
        errors.append(format_full_list(
            'LOST STATIONS',
            lost_stations,
            lambda sid: '%s -> %s' % (sid, ', '.join(possible_station_migrations(sid, current)) or 'NO_CANDIDATE')
        ))
    baseline_tourism_spot_keys = set(baseline.get('tourism_spot_keys', []))
    lost_tourism_spots = sorted(baseline_tourism_spot_keys - cur_tourism_spot_keys)
    if lost_tourism_spots:
        errors.append(format_full_list('LOST TOURISM SPOTS', lost_tourism_spots))
    if new_lines:
        warnings.append('NEW lines (%d): %s' % (len(new_lines), ', '.join(new_lines[:5])))
    if new_stations:
        warnings.append('NEW stations (%d): %s' % (len(new_stations), ', '.join(new_stations[:5])))
    mismatch_a_items = []
    mismatch_b_items = []
    # stationLines 实际格式：{站ID: [lineId, ...]}（字符串数组），按此格式做关系一致性校验
    for lid, sdict in cur_slo.items():
        for sid in sdict:
            if not any(e == lid for e in cur_sl.get(sid, [])):
                mismatch_a_items.append((lid, sid))
    for sid, entries in cur_sl.items():
        for entry in entries:
            lid = entry
            if lid not in cur_slo or sid not in cur_slo[lid]:
                mismatch_b_items.append((sid, lid))
    mismatch_a = len(mismatch_a_items)
    mismatch_b = len(mismatch_b_items)
    if mismatch_a > 0:
        errors.append(format_full_list(
            'RELATION MISMATCH A (lineStationOrder -> stationLines)',
            mismatch_a_items,
            lambda item: '%s -> %s' % item
        ))
    if mismatch_b > 0:
        errors.append(format_full_list(
            'RELATION MISMATCH B (stationLines -> lineStationOrder)',
            mismatch_b_items,
            lambda item: '%s -> %s' % item
        ))
    known = baseline.get('known_limitations', {})
    for k, v in known.items():
        warnings.append('KNOWN: %s = %s' % (k, v))
    print('=== CANONICAL ENTITY PRESERVATION GUARD ===')
    print('Baseline SHA: %s' % baseline_sha)
    print('Current SHA:  %s' % current_sha)
    print()
    print('Entity counts (effective baseline):')
    for name, expected in effective_ec.items():
        actual = counts.get(name, 0)
        status = 'OK' if actual >= expected else 'LOSS (-%d)' % (expected - actual)
        print('  %s: %d [%s]' % (name, actual, status))
    print()
    print('ID preservation:')
    print('  lines:   %d lost, %d new' % (len(lost_lines), len(new_lines)))
    print('  stations: %d lost, %d new' % (len(lost_stations), len(new_stations)))
    print('  relation mismatches: A=%d B=%d' % (mismatch_a, mismatch_b))
    print()
    if errors:
        print('ERRORS:')
        for e in errors:
            print('  X %s' % e)
        print()
        print('RESULT: FAIL')
        sys.exit(1)
    else:
        if warnings:
            print('WARNINGS:')
            for w in warnings:
                print('  ! %s' % w)
        print()
        print('RESULT: PASS')
        sys.exit(0)

if __name__ == '__main__':
    main()
