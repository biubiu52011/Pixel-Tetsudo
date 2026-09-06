import sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

src = open("js/translations.js", encoding="utf-8").readlines()
out = []
i = 0
while i < len(src):
    n = i + 1
    L = src[i]
    out.append(L)
    i += 1
open("js/translations.js", "w", encoding="utf-8").writelines(out)
print(len(src), len(out))
