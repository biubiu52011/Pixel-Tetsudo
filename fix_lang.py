with open(chr(39)+chr(106)+chr(115)+chr(47)+chr(108)+chr(97)+chr(110)+chr(103)+chr(45)+chr(105)+chr(110)+chr(105)+chr(116)+chr(46)+chr(106)+chr(115)+chr(39), chr(39)+chr(114)+chr(39), encoding=chr(39)+chr(117)+chr(116)+chr(102)+chr(45)+chr(56)+chr(39)) as f:
    lines = f.readlines()
for i, l in enumerate(lines):
    if chr(95)+chr(111)+chr(112)+chr(73)+chr(100)+chr(115) in l and chr(74)+chr(82)+chr(45)+chr(87)+chr(101)+chr(115)+chr(116) in l:
        idx = l.index(chr(74)+chr(82)+chr(45)+chr(87)+chr(101)+chr(115)+chr(116))
        new_l = l[:idx+7] + chr(39)+chr(44)+chr(39)+chr(32)+chr(39)+chr(74)+chr(82)+chr(32)+chr(87)+chr(101)+chr(115)+chr(116)+chr(39)+chr(39) + l[idx+7:]
        lines[i] = new_l
        print(chr(70)+chr(105)+chr(120)+chr(101)+chr(100)+chr(32)+chr(108)+chr(97)+chr(110)+chr(103)+chr(45)+chr(105)+chr(110)+chr(105)+chr(116))
        break
with open(chr(39)+chr(106)+chr(115)+chr(47)+chr(108)+chr(97)+chr(110)+chr(103)+chr(45)+chr(105)+chr(110)+chr(105)+chr(116)+chr(46)+chr(106)+chr(115)+chr(39), chr(39)+chr(119)+chr(39), encoding=chr(39)+chr(117)+chr(116)+chr(102)+chr(45)+chr(56)+chr(39), newline=chr(39)+chr(10)+chr(39)) as f:
    f.writelines(lines)
print(chr(100)+chr(111)+chr(110)+chr(101))
