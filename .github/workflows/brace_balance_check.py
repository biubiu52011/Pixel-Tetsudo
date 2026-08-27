#!/usr/bin/env python3
import os, sys

REPO_ROOT = os.getcwd()
SQ = chr(39)
DQ = chr(34)
BQ = chr(96)

def check_brace_balance(path):
    with open(path, chr(114), encoding=chr(117)+chr(116)+chr(102)+chr(45)+chr(56), errors=chr(114)+chr(101)+chr(112)+chr(108)+chr(97)+chr(99)+chr(101)) as f:
        c = f.read()
    nest = 0
    in_string = None
    in_line_comment = False
    in_block_comment = False
    i = 0
    while i < len(c):
        ch = c[i]
        if in_block_comment:
            if ch == chr(42) and i+1 < len(c) and c[i+1] == chr(47):
                in_block_comment = False
                i += 2
                continue
            i += 1
            continue
        if not in_string and not in_line_comment:
            if ch == chr(47) and i+1 < len(c) and c[i+1] == chr(47):
                in_line_comment = True
                i += 2
                continue
            if ch == chr(47) and i+1 < len(c) and c[i+1] == chr(42):
                in_block_comment = True
                i += 2
                continue
            if ch in (DQ, SQ, BQ):
                in_string = ch
                i += 1
                continue
            if ch == chr(123):
                nest += 1
            elif ch == chr(125):
                nest -= 1
                if nest < 0:
                    return False, chr(117)+chr(110)+chr(116)+chr(101)+chr(114)+chr(109)+chr(105)+chr(110)+chr(97)+chr(116)+chr(101)+chr(100)+chr(32)+chr(97)+chr(116)+chr(32)+chr(112)+chr(111)+chr(115)+chr(32)+chr(37)+chr(100) % i
            i += 1
            continue
        if in_string:
            if ch == chr(92) and i+1 < len(c):
                i += 2
                continue
            if ch == in_string:
                in_string = None
            i += 1
            continue
        if in_line_comment:
            if ch == chr(10):
                in_line_comment = False
            i += 1
            continue
        i += 1
    if nest != 0:
        return False, chr(117)+chr(110)+chr(98)+chr(97)+chr(108)+chr(97)+chr(110)+chr(99)+chr(101)+chr(100)+chr(58)+chr(32)+chr(43)+chr(37)+chr(100) % nest
    return True, chr(111)+chr(107)

def main():
    errors = []
    skip_dirs = set()
    for root, dn, fns in os.walk(REPO_ROOT):
        dn[:] = [d for d in dn if d not in skip_dirs]
        for fn in fns:
            if not fn.endswith(chr(46)+chr(106)+chr(115)): continue
            fp = os.path.join(root, fn)
            ok, msg = check_brace_balance(fp)
            if not ok:
                errors.append(chr(37)+chr(115)+chr(58)+chr(32)+chr(37)+chr(115) % (fp, msg))
    if errors:
        print(chr(66)+chr(114)+chr(97)+chr(99)+chr(101)+chr(32)+chr(66)+chr(97)+chr(108)+chr(97)+chr(110)+chr(99)+chr(101)+chr(32)+chr(70)+chr(65)+chr(73)+chr(76)+chr(32)+chr(40)+chr(37)+chr(100)+chr(32)+chr(101)+chr(114)+chr(114)+chr(111)+chr(114)+chr(115)+chr(41)+chr(58) % len(errors))
        for e in errors:
            print(chr(32)+chr(32)+chr(88)+chr(32)+chr(37)+chr(115) % e)
        sys.exit(1)
    else:
        print(chr(65)+chr(108)+chr(108)+chr(32)+chr(74)+chr(83)+chr(32)+chr(102)+chr(105)+chr(108)+chr(101)+chr(115)+chr(32)+chr(104)+chr(97)+chr(118)+chr(101)+chr(32)+chr(98)+chr(97)+chr(108)+chr(97)+chr(110)+chr(99)+chr(101)+chr(100)+chr(32)+chr(98)+chr(114)+chr(97)+chr(99)+chr(101)+chr(115))
        sys.exit(0)

if __name__ == chr(39)+chr(39).join([chr(109)+chr(97)+chr(105)+chr(110)+chr(39)]):
    main()
