#!/usr/bin/env python3
import json, os, sys

REPO_ROOT = os.getcwd()
INVENTORY_PATH = os.path.join(REPO_ROOT, 'recovery', 'reports', 'unified_lines_3.3_inventory.json')

def main():
    if not os.path.exists(INVENTORY_PATH):
        print('ERROR: Inventory not found:', INVENTORY_PATH)
        sys.exit(1)
    with open(INVENTORY_PATH, 'r', encoding='utf-8') as f:
        inv = json.load(f)
    mig = sum(1 for x in inv['findings'] if x['decision'] == 'MIGRATE')
    ret = sum(1 for x in inv['findings'] if x['decision'] == 'RETAIN')
    ign = sum(1 for x in inv['findings'] if x['decision'] == 'IGNORE')
    print('=== ARCHITECTURE INTEGRITY GUARD (3.3) ===')
    print()
    print('Findings from inventory:')
    print('  MIGRATE (business runtime, needs migration): %d' % mig)
    print('  RETAIN (compatibility, no action): %d' % ret)
    print('  IGNORE (comments/docs): %d' % ign)
    print()
    # Check for new unclassified findings
    SKIP = {'recovery', '.git', 'node_modules', '__pycache__', 'data/core'}
    SCAN = [os.path.join(REPO_ROOT, 'js'), os.path.join(REPO_ROOT, 'pages')]
    known = {(x['file'].replace('\\', '/'), x['line']) for x in inv['findings']}
    new_errors = []
    new_warnings = []
    for sd in SCAN:
        if not os.path.exists(sd): continue
        for dp, _, fns in os.walk(sd):
            if any(d in dp for d in SKIP): continue
            for fn in fns:
                if not fn.endswith(('.js', '.html')): continue
                fp = os.path.join(dp, fn)
                rel = fp.replace(REPO_ROOT + os.sep, '').replace(chr(92), '/')
                try:
                    with open(fp, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                except: continue
                for i, line in enumerate(lines):
                    key = (rel, i+1)
                    if key in known: continue
                    s = line.strip()
                    if 'UNIFIED_LINES' in line and not (s.startswith('//') or s.startswith('/*') or s.startswith('*')):
                        new_warnings.append('UNCLASSIFIED_UNIFIED_LINES %s:%d: %s' % (rel, i+1, s[:80]))
                    if 'localhost' in line or '127.0.0.1' in line:
                        new_errors.append('LOCALHOST %s:%d: %s' % (rel, i+1, s[:80]))
                    if 'file://' in line:
                        new_errors.append('FILE_PROTOCOL %s:%d: %s' % (rel, i+1, s[:80]))
    # Forbidden files
    for dp, _, fns in os.walk(REPO_ROOT):
        if any(d in dp for d in SKIP): continue
        for fn in fns:
            if fn in ('station_to_tourism.json', 'line_station.json', 'station_line.json'):
                rel = os.path.join(dp, fn).replace(REPO_ROOT + os.sep, '')
                new_errors.append('FORBIDDEN_FILE %s' % rel)
    if new_errors:
        print('NEW ERRORS (%d):' % len(new_errors))
        for e in new_errors:
            print('  X %s' % e)
        print()
    if new_warnings:
        print('NEW WARNINGS (%d) - unclassified UNIFIED_LINES:' % len(new_warnings))
        for w in new_warnings:
            print('  ! %s' % w)
        print()
    if not new_errors and not new_warnings:
        print('All findings accounted for. No new violations.')
        print()
    if new_errors:
        print('RESULT: FAIL')
        sys.exit(1)
    else:
        print('RESULT: PASS')
        sys.exit(0)

if __name__ == '__main__':
    main()
