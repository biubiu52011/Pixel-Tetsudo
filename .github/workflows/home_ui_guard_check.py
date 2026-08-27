#!/usr/bin/env python3
import json, hashlib, os, sys, re

REPO_ROOT = os.getcwd()
BL = os.path.join(REPO_ROOT, 'recovery', 'baseline', 'home_ui_baseline.json')
CP = os.path.join(REPO_ROOT, 'data', 'core', 'railway_data.json')
TP = os.path.join(REPO_ROOT, 'data', 'core', 'translations.js')

def sha256_file(p):
    with open(p, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()

def find_home_files():
    result = []
    for root, dn, _ in os.walk(REPO_ROOT):
        dn[:] = [d for d in dn if d not in ('.git','node_modules','__pycache__','recovery')]
        try:
            if 'home.html' in os.listdir(root):
                hp = os.path.join(root, 'home.html')
                if os.path.exists(hp): result.append(hp)
        except: pass
    return result

def main():
    errors = []
    warnings = []
    if not os.path.exists(BL):
        print('ERROR: baseline not found:', BL)
        sys.exit(1)
    with open(BL, 'r', encoding='utf-8') as f:
        bl = json.load(f)
    cs = sha256_file(CP).upper()
    es = bl['constraints']['railway_data_sha_frozen'].upper()
    if cs != es:
        errors.append('CANONICAL SHA CHANGED: expected=%s got=%s' % (es[:16], cs[:16]))
    else:
        print('  [OK] railway_data.json SHA unchanged')
    hfs = find_home_files()
    ph = os.path.join(REPO_ROOT, 'pages', 'home.html')
    if os.path.exists(ph) and ph not in hfs: hfs.append(ph)
    if not hfs:
        errors.append('NO home.html found')
        print('RESULT: FAIL')
        sys.exit(1)
    shas = {hf: sha256_file(hf) for hf in hfs}
    if len(set(shas.values())) > 1:
        errors.append('HOME FILES OUT OF SYNC')
    else:
        print('  [OK] All home.html identical (SHA: %s)' % list(shas.values())[0][:12])
    hf = hfs[0]
    with open(hf, 'r', encoding='utf-8') as f:
        hc = f.read()
    mc = bl.get('modules', {})
    DQ = chr(34)
    for mn, ms in mc.items():
        mid = ms.get('id')
        check_id = 'id='+DQ+mid+DQ
        if mid and check_id not in hc:
            errors.append('MODULE MISSING: %s (id=%s)' % (mn, mid))
        else:
            print('  [OK] Module %s (#%s) present' % (mn, mid))
        tk = ms.get('title_i18n_key')
        check_title = 'data-i18n='+DQ+tk+DQ
        if tk and check_title not in hc:
            errors.append('TITLE i18n MISSING: %s key=%s' % (mn, tk))
        elif tk:
            print('  [OK] Module %s title uses i18n key' % mn)
        svb = ms.get('relocate_svg_viewBox')
        if svb and svb not in hc:
            errors.append('RELOCATE SVG CHANGED: expected viewBox=%s' % svb)
        elif svb:
            print('  [OK] Relocate SVG viewBox locked (%s)' % svb)
        bid = ms.get('relocate_btn_id')
        if bid and bid not in hc:
            errors.append('RELOCATE BTN MISSING: id=%s' % bid)
    if bl['constraints'].get('no_new_home_modules'):
        cc = hc.count('pixel-card')
        if cc < 2:
            warnings.append('MODULE COUNT: only %d pixel-card' % cc)
        else:
            print('  [OK] %d pixel-card modules found' % cc)
    if os.path.exists(TP):
        with open(TP, 'r', encoding='utf-8') as f:
            tc = f.read()
        for mn, ms in mc.items():
            tk = ms.get('title_i18n_key')
            if tk and tk not in tc:
                warnings.append('TRANSLATION KEY MISSING: %s' % tk)
            elif tk:
                print('  [OK] Translation key %s exists' % tk)
    csha = sha256_file(hf)
    bsha = bl.get('sha256', '')
    if csha != bsha:
        warnings.append('HOME HTML SHA changed: baseline=%s current=%s' % (bsha[:12], csha[:12]))
    else:
        print('  [OK] Home HTML SHA matches baseline')
    print()
    if errors:
        print('ERRORS (%d):' % len(errors))
        for e in errors: print('  X %s' % e)
        print()
        print('RESULT: FAIL')
        sys.exit(1)
    else:
        if warnings:
            print('WARNINGS (%d):' % len(warnings))
            for w in warnings: print('  ! %s' % w)
        print()
        print('RESULT: PASS')
        sys.exit(0)

if __name__ == '__main__':
    main()
