#!/usr/bin/env python3
import os, re, sys

REPO_ROOT = os.getcwd()
SCAN_DIRS = [
    os.path.join(REPO_ROOT, 'js'),
    os.path.join(REPO_ROOT, 'pages'),
    os.path.join(REPO_ROOT, 'data', '\u94c1\u9053'),
]
ALLOWED_UNIFIED = {'data/core/db-loader.js'}
SKIP_DIRS = {'recovery', '.git', 'node_modules', '__pycache__', 'data/core'}

def is_comment(line):
    s = line.strip()
    return s.startswith('//') or s.startswith('/*') or s.startswith('*')

def main():
    errors = []
    warnings = []
    for scan_dir in SCAN_DIRS:
        if not os.path.exists(scan_dir):
            continue
        for dirpath, _, filenames in os.walk(scan_dir):
            if any(d in dirpath for d in SKIP_DIRS):
                continue
            for fn in filenames:
                if not (fn.endswith('.js') or fn.endswith('.html')):
                    continue
                fp = os.path.join(dirpath, fn)
                rel = fp.replace(REPO_ROOT + os.sep, '')
                try:
                    with open(fp, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                except Exception:
                    continue
                for i, line in enumerate(lines):
                    s = line.strip()
                    if is_comment(s):
                        continue
                    # UNIFIED_LINES in business code (WARNING - technical debt)
                    if re.search(r'window\.UNIFIED_LINES|\bUNIFIED_LINES\b', line):
                        if rel not in ALLOWED_UNIFIED:
                            warnings.append('UNIFIED_LINES [BUSINESS] %s:%d: %s' % (rel, i+1, s[:100]))
                    # localhost / 127.0.0.1
                    if re.search(r'localhost|127\.0\.0\.1', line):
                        errors.append('LOCALHOST %s:%d: %s' % (rel, i+1, s[:100]))
                    # file://
                    if 'file://' in line:
                        errors.append('FILE_PROTOCOL %s:%d: %s' % (rel, i+1, s[:100]))
                    # Second DB patterns
                    if re.search(r'\b(LINES_DB|STATIONS_DB|railwayDB2|localRailwayData)\b', line):
                        errors.append('SECOND_DB %s:%d: %s' % (rel, i+1, s[:100]))
    # Check forbidden files
    for dirpath, _, filenames in os.walk(REPO_ROOT):
        if any(d in dirpath for d in SKIP_DIRS):
            continue
        for fn in filenames:
            if fn in ('station_to_tourism.json', 'line_station.json', 'station_line.json'):
                fp = os.path.join(dirpath, fn)
                rel = fp.replace(REPO_ROOT + os.sep, '')
                errors.append('FORBIDDEN_FILE %s: %s' % (rel, fn))
    print('=== ARCHITECTURE INTEGRITY GUARD ===')
    print()
    if errors:
        print('ERRORS (%d):' % len(errors))
        for e in errors:
            print('  X %s' % e)
        print()
    if warnings:
        print('WARNINGS (%d) - UNIFIED_LINES in business code (technical debt):' % len(warnings))
        for w in warnings:
            print('  ! %s' % w)
        print()
    if not errors and not warnings:
        print('No architecture violations detected.')
        print()
    elif not errors:
        print('RESULT: PASS (with %d warnings)' % len(warnings))
        print('NOTE: Business code should migrate from window.UNIFIED_LINES to RailwayDB getters.')
        sys.exit(0)
    else:
        print('RESULT: FAIL')
        sys.exit(1)

if __name__ == '__main__':
    main()
