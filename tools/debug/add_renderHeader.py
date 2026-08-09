import os
proj = r'C:\Users\80996\Documents\项目\像素铁道'
path = os.path.join(proj, 'js', 'sightseeing.js')
c = open(path, encoding='utf-8').read()

# Add renderHeader function after getSPOTS
old = "function getSPOTS() {\n    return window.TOURISM_DATA || {};\n  }"
new = """function getSPOTS() {
    return window.TOURISM_DATA || {};
  }

  function renderHeader() {
    if (dom.header) {
      const stationName = t('station_names.' + state.selectedStation) || state.selectedStation;
      dom.header.innerHTML = '<h2>' + stationName + ' ' + t('tourism.title') + '</h2>';
    }
  }"""

if old in c and 'renderHeader' not in c:
    c = c.replace(old, new)
    open(path, 'w', encoding='utf-8').write(c)
    print('Added renderHeader function')
else:
    print('renderHeader already exists or pattern not found')
