# Offline extraction of published 2026 Odakyu vehicle plans.
# Usage: python tools/extract-odakyu-planned-vehicles.py SOURCE_DIR
# SOURCE_DIR contains local-w/local-h.html and the four official timetable PDFs.
# Does not fetch daily formation reports or write to the database.
import re,json,pdfplumber,sys
from pathlib import Path
from html import unescape
root=Path(sys.argv[1])
clean=lambda t:re.sub(r"\s+"," ",unescape(re.sub(r"<[^>]+>"," ",t))).strip()
out=[]
for suffix,cal,date in [("w","weekday","2026-03-16"),("h","holiday","2026-03-14")]:
 text=(root/("local-"+suffix+".html")).read_text(encoding="utf8")
 count=0
 for table in re.findall(r"<table\b[^>]*>([\s\S]*?)</table>",text):
  trs=re.findall(r"<tr\b[^>]*>([\s\S]*?)</tr>",table)
  head=[clean(x) for x in re.findall(r"<t[dh]\b[^>]*>([\s\S]*?)</t[dh]>",trs[0])]
  if len(head)!=3 or not re.fullmatch(r"(?:11[1-4]|[ABC]\d\d)",head[0]):continue
  models=list(dict.fromkeys("小田急"+m+"形" for m in re.findall(r"(\d{4})-\d+",head[2])))
  if not models:raise ValueError(head)
  for tr in trs[2:]:
   cells=[clean(x) for x in re.findall(r"<t[dh]\b[^>]*>([\s\S]*?)</t[dh]>",tr)]
   if len(cells)<9 or not re.fullmatch(r"\d{4}",cells[1]) or cells[0]=="回送" or cells[5]!="→":continue
   if not re.fullmatch(r"\d{4}",cells[4]) or not re.fullmatch(r"\d{4}",cells[8]):continue
   out.append(dict(trainNumber=cells[1],calendarType=cal,effectiveFrom=date,models=models,operation=head[0],origin=cells[2],destination=cells[6],departure=cells[4],arrival=cells[8],sourceUrl="https://yozakura-room.net/oerunyo/oerunyo2026-local-"+suffix+"/",grade="C",kind="ordinary"))
   count+=1
 print(cal,"ordinary",count)
for file in root.glob("*.pdf"):
 cal,direction=file.stem.split("_")
 p=pdfplumber.open(file).pages[0]
 # The three horizontal timetable blocks share the published column grid.
 modelys=[256.42,447.03,637.63]
 nr=0;skips=0
 for block,my in enumerate(modelys):
  ny=74.56+190.605*block
  # Number glyphs are split at every 4-digit/M-suffixed public number,
  # using actual cell boundary lines, never PDF word concatenation.
  cs=[c for c in p.chars if abs(c["top"]-ny)<.8 and re.fullmatch("[0-9M]",c["text"]) and 140<c["x0"]<487]
  runs=[];run=[]
  for c in sorted(cs,key=lambda c:c["x0"]):
   if run and c["x0"]-run[-1]["x1"]>1.0:runs.append(run);run=[]
   run.append(c)
  if run:runs.append(run)
  # Adjacent four-digit cells have small gaps, split if necessary.
  nums=[]
  for chars in runs:
   while chars:
    length=5 if len(chars)>4 and chars[4]["text"]=="M" else 4
    group=chars[:length];chars=chars[length:]
    number="".join(c["text"] for c in group)
    if not re.fullmatch(r"\d{4}M?",number):raise ValueError((file,number))
    nums.append((number,(group[0]["x0"]+group[-1]["x1"])/2))
  for num,x in nums:
   symbols=[c["text"] for c in p.chars if abs(c["top"]-my)<.8 and abs((c["x0"]+c["x1"])/2-x)<6.0 and c["text"] in "ＭＥＧ▲"]
   if not symbols or "▲" in symbols:
    skips+=1;continue # Variable-day GSE and unextracted vector badges stay candidates.
   symbols=list(dict.fromkeys(symbols))
   if len(symbols)!=1:raise ValueError((file,num,symbols))
   model={"Ｍ":["小田急60000形"],"Ｇ":["小田急70000形"],"Ｅ":["小田急30000形（EXE）","小田急30000形（EXEα）"]}[symbols[0]]
   out.append(dict(trainNumber=num,calendarType=cal,effectiveFrom="2026-03-14",models=model,sourceUrl="https://www.odakyu.jp/romancecar/timetable/doc/260314/"+file.stem+"2026.pdf",grade="B",kind="romancecar",symbol=symbols[0],direction=direction))
   nr+=1
 print(file.name,"fixed",nr,"variable/skipped",skips)
# One plan per public number/calendar. Preserve unions for explicitly coupled
# ordinary workings; do not invent an exact member of a multi-model fleet.
groups={}
for r in out:
 k=(r["calendarType"],r["trainNumber"])
 if k not in groups:groups[k]={**r,"models":list(r["models"]),"operations":[]}
 g=groups[k]
 for m in r["models"]:
  if m not in g["models"]:g["models"].append(m)
 if r.get("operation") and r["operation"] not in g["operations"]:g["operations"].append(r["operation"])
 if g["sourceUrl"]!=r["sourceUrl"]:raise ValueError(("cross-source collision",k))
plans=sorted(groups.values(),key=lambda r:(r["calendarType"],r["trainNumber"]))
(root/"plans.json").write_text(json.dumps(plans,ensure_ascii=False,indent=2),encoding="utf8")
(root/"source-rows.json").write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding="utf8")
print("TOTAL",len(plans))
