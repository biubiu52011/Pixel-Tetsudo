lines = open(chr(106)+chr(115)+chr(47)+chr(116)+chr(114)+chr(97)+chr(110)+chr(115)+chr(108)+chr(97)+chr(116)+chr(105)+chr(111)+chr(110)+chr(115)+chr(46)+chr(106)+chr(115), encoding=chr(117)+chr(116)+chr(102)+chr(45)+chr(56)).readlines()
out = []
added = 0
for line in lines:
    out.append(line)
    if chr(115)+chr(101)+chr(97)+chr(114)+chr(99)+chr(104)+chr(95)+chr(114)+chr(101)+chr(115)+chr(117)+chr(108)+chr(116)+chr(46)+chr(116)+chr(114)+chr(97)+chr(110)+chr(115)+chr(102)+chr(101)+chr(114)+chr(95)+chr(97)+chr(116) in line:
        if chr(84)+chr(114)+chr(97)+chr(110)+chr(115)+chr(102)+chr(101)+chr(114) in line:
            out.append(chr(32)*6+chr(34)+chr(115)+chr(101)+chr(97)+chr(114)+chr(99)+chr(104)+chr(95)+chr(114)+chr(101)+chr(115)+chr(117)+chr(108)+chr(116)+chr(46)+chr(116)+chr(114)+chr(97)+chr(110)+chr(115)+chr(102)+chr(101)+chr(114)+chr(95)+chr(99)+chr(111)+chr(117)+chr(110)+chr(116)+chr(34)+chr(58)+chr(32)+chr(34)+chr(116)+chr(114)+chr(97)+chr(110)+chr(115)+chr(102)+chr(101)+chr(114)+chr(40)+chr(115)+chr(41)+chr(34)+chr(44)+chr(10))
            added += 1
        elif chr(25435) in line:
            out.append(chr(32)*6+chr(34)+chr(115)+chr(101)+chr(97)+chr(114)+chr(99)+chr(104)+chr(95)+chr(114)+chr(101)+chr(115)+chr(117)+chr(108)+chr(116)+chr(46)+chr(116)+chr(114)+chr(97)+chr(110)+chr(115)+chr(102)+chr(101)+chr(114)+chr(95)+chr(99)+chr(111)+chr(117)+chr(110)+chr(116)+chr(34)+chr(58)+chr(32)+chr(34)+chr(27425)+chr(25435)+chr(20116)+chr(34)+chr(44)+chr(10))
            added += 1
        elif chr(36744) in line:
            out.append(chr(32)*6+chr(34)+chr(115)+chr(101)+chr(97)+chr(114)+chr(99)+chr(104)+chr(95)+chr(114)+chr(101)+chr(115)+chr(117)+chr(108)+chr(116)+chr(46)+chr(116)+chr(114)+chr(97)+chr(110)+chr(115)+chr(102)+chr(101)+chr(114)+chr(95)+chr(99)+chr(111)+chr(117)+chr(110)+chr(116)+chr(34)+chr(58)+chr(32)+chr(34)+chr(36680)+chr(36335)+chr(34)+chr(44)+chr(10))
            added += 1
        elif chr(55356)+chr(57289) in line:
            out.append(chr(32)*6+chr(34)+chr(115)+chr(101)+chr(97)+chr(114)+chr(99)+chr(104)+chr(95)+chr(114)+chr(101)+chr(115)+chr(117)+chr(108)+chr(116)+chr(46)+chr(116)+chr(114)+chr(97)+chr(110)+chr(115)+chr(102)+chr(101)+chr(114)+chr(95)+chr(99)+chr(111)+chr(117)+chr(110)+chr(116)+chr(34)+chr(58)+chr(32)+chr(34)+chr(55356)+chr(57289)+chr(34)+chr(44)+chr(10))
            added += 1
open(chr(106)+chr(115)+chr(47)+chr(116)+chr(114)+chr(97)+chr(110)+chr(115)+chr(108)+chr(97)+chr(116)+chr(105)+chr(111)+chr(110)+chr(115)+chr(46)+chr(106)+chr(115), chr(119), encoding=chr(117)+chr(116)+chr(102)+chr(45)+chr(56), newline=chr(39)+chr(39))).writelines(out)
c = chr(10).join(out)
print(added, c.count(chr(116)+chr(114)+chr(97)+chr(110)+chr(115)+chr(102)+chr(101)+chr(114)+chr(95)+chr(99)+chr(111)+chr(117)+chr(110)+chr(116)))
