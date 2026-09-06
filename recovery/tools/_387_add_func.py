path = r'C:\Users\80996\Documents\项目\像素铁道\js\trains-detail.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the line with _rS and add getDisplayLineName after it
marker = "function(id){ return id; };"
if marker in content:
    helper = '''
  function getDisplayLineName(line) {
    var _lang = (window.currentLang || 'ja').toLowerCase();
    var _nameKey = 'name' + _lang.charAt(0).toUpperCase() + _lang.slice(1);
    return (line && line[_nameKey]) || (line && line.nameJa) || (line && line.nameEn) || (line && line.name) || (line && line.id);
  }'''
    content = content.replace(marker, marker + helper, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK')
else:
    print('NOT FOUND')
