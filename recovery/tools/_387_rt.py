path = r'C:\Users\80996\Documents\项目\像素铁道\js\realtime-view.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old = \"const getDisplayName = (line) => (line && line.nameJa) ? line.nameJa : (window.tLineName ? window.tLineName(line) : (line && line.nameEn) ? line.nameEn : (line && line.name) ? line.name : line && line.id);\"
new = '''const getDisplayName = (line) => {
    var _lang = (window.currentLang || 'ja').toLowerCase();
    var _nameKey = 'name' + _lang.charAt(0).toUpperCase() + _lang.slice(1);
    return (line && line[_nameKey]) || (line && line.nameJa) || (line && line.nameEn) || (line && line.name) || (line && line.id);
  };'''

if old in content:
    content = content.replace(old, new, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK')
else:
    print('ERROR: pattern not found')
