import re

with open(r'"'"'C:\Users\80996\Documents\项目\像素铁道\js\sightseeing.js'"'"', '"'"'r'"'"', encoding='"'"'utf-8'"'"') as f:
    content = f.read()

# 修复 renderHeader 函数 - 替换整个函数
old_func = """  function renderHeader() {
    if (!dom.header) return;
    let html = '"'"'<h2 data-i18n="tourism.title">'"'"' + t('"'"'tourism.title'"'"') + '"'"'</h2>'"'"';
    if (state.autoDetected && state.selectedStation) {
      const stationLabel = t('"'"'station_names.'"'"' + state.selectedStation) || state.selectedStation;
              t('"'"'tourism.auto_detected'"'"') + '"'"': '"'"' + stationLabel + '"'"'</span></div>'"'"';
    }
    dom.header.innerHTML = html;
  }"""

new_func = """  function renderHeader() {
    if (!dom.header) return;
    let html = '"'"'<h2 data-i18n="tourism.title">'"'"' + t('"'"'tourism.title'"'"') + '"'"'</h2>'"'"';
    if (state.autoDetected && state.selectedStation) {
      const stationLabel = t('"'"'station_names.'"'"' + state.selectedStation) || state.selectedStation;
      html += '"'"'<div id="smAutoBadge" class="sm-auto-badge"><span>'"'"' + 
              t('"'"'tourism.auto_detected'"'"') + '"'"': '"'"' + stationLabel + '"'"'</span></div>'"'"';
    }
    dom.header.innerHTML = html;
  }"""

if old_func in content:
    content = content.replace(old_func, new_func)
    print("Replaced renderHeader")
else:
    print("Old function not found, checking...")
    # 查找函数位置
    idx = content.find("function renderHeader()")
    if idx >= 0:
        print(f"Found at index {idx}")
        print(content[idx:idx+500])

with open(r'"'"'C:\Users\80996\Documents\项目\像素铁道\js\sightseeing.js'"'"', '"'"'w'"'"', encoding='"'"'utf-8'"'"') as f:
    f.write(content)
print("Done")
