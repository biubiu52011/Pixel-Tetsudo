import os, re
os.chdir(r"C:\Users\80996\Documents\项目\像素铁道")
with open("js/sightseeing.js", "r", encoding="utf-8") as f:
    text = f.read()
bug = "onLanguageChange === 'function' && window._langCallbacks"
print("Has onLanguageChange bug:", bug in text)
print("Has onLanguageChange at all:", "onLanguageChange" in text)
print("File size:", len(text))
