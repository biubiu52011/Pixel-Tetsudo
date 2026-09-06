with open(chr(39)+chr(106)+chr(115)+chr(47)+chr(116)+chr(114)+chr(97)+chr(110)+chr(115)+chr(108)+chr(97)+chr(116)+chr(105)+chr(111)+chr(110)+chr(115)+chr(46)+chr(106)+chr(115)+chr(39), chr(39)+chr(114)+chr(39), encoding=chr(39)+chr(117)+chr(116)+chr(102)+chr(45)+chr(56)+chr(39)) as f:
    lines = f.readlines()
for i, l in enumerate(lines):
    if chr(34)+chr(111)+chr(112)+chr(46)+chr(74)+chr(82)+chr(45)+chr(87)+chr(101)+chr(115)+chr(116)+chr(34) in l and i > 700:
        indent = len(l) - len(l.lstrip())
        parts = l.strip().split(chr(58)+chr(32))
        key_part = parts[0] + chr(58)
        val_part = parts[1].rstrip(chr(44))
        new_line = chr(32)*indent + chr(34) + key_part + chr(34) + chr(32) + chr(34) + chr(111)+chr(112)+chr(46)+chr(74)+chr(82)+chr(32)+chr(87)+chr(101)+chr(115)+chr(116)+chr(34) + chr(32) + chr(58) + chr(32) + chr(34) + val_part + chr(44) + chr(34) + chr(10)
        lines.insert(i+1, new_line)
        print(chr(65)+chr(100)+chr(100)+chr(101)+chr(100)+chr(32)+chr(75)+chr(79)+chr(32)+chr(108)+chr(105)+chr(110)+chr(101))
        break
with open(chr(39)+chr(106)+chr(115)+chr(47)+chr(116)+chr(114)+chr(97)+chr(110)+chr(115)+chr(108)+chr(97)+chr(116)+chr(105)+chr(111)+chr(110)+chr(115)+chr(46)+chr(106)+chr(115)+chr(39), chr(39)+chr(119)+chr(39), encoding=chr(39)+chr(117)+chr(116)+chr(102)+chr(45)+chr(56)+chr(39), newline=chr(39)+chr(10)+chr(39)) as f:
    f.writelines(lines)
print(chr(100)+chr(111)+chr(110)+chr(101))
