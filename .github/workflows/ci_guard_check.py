#!/usr/bin/env python3
import json, hashlib, os, sys

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
    cur_tourism = current.get('tourism', {})
    cur_tourism_stations = len(cur_tourism) if isinstance(cur_tourism, dict) else 0
    cur_tourism_spots = sum(len(v.get('spots',[])) for v in cur_tourism.values() if isinstance(v, dict)) if isinstance(cur_tourism, dict) else 0
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
        p = ', '.join(lost_lines[:10]) + (', ...' if len(lost_lines)>10 else '')
        errors.append('LOST LINES (%d): %s' % (len(lost_lines), p))
    if lost_stations:
        p = ', '.join(lost_stations[:10]) + (', ...' if len(lost_stations)>10 else '')
        errors.append('LOST STATIONS (%d): %s' % (len(lost_stations), p))
    if new_lines:
        warnings.append('NEW lines (%d): %s' % (len(new_lines), ', '.join(new_lines[:5])))
    if new_stations:
        warnings.append('NEW stations (%d): %s' % (len(new_stations), ', '.join(new_stations[:5])))
    mismatch_a = 0
    mismatch_b = 0
    for lid, sdict in cur_slo.items():
        for sid in sdict:
            if not any(e.get('line_id')==lid for e in cur_sl.get(sid,[])):
                mismatch_a += 1
    for sid, entries in cur_sl.items():
        for entry in entries:
            lid = entry.get('line_id')
            if lid not in cur_slo or sid not in cur_slo[lid]:
                mismatch_b += 1
    if mismatch_a > 0:
        errors.append('RELATION MISMATCH A (slo->sl): %d' % mismatch_a)
    if mismatch_b > 0:
        errors.append('RELATION MISMATCH B (sl->slo): %d' % mismatch_b)
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
