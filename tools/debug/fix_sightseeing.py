import re

with open('js/sightseeing_v2.js', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add STATION_NAME_MAP after TAG_ICONS
map_block = '''
  // 日语/英语站名映射到 TOURISM_DATA 的英文键
  const STATION_NAME_MAP = {
    '押上': 'Asakusa',
    '浅草': 'Asakusa',
    '渋谷': 'Shibuya',
    '鎌倉': 'Kamakura',
    '日光': 'Nikko',
    '新宿': 'Shinjuku',
    '上野': 'Ueno',
    '品川': 'Shinagawa',
    '秋葉原': 'Akihabara',
    '六本木': 'Roppongi',
    '原宿': 'Harajuku',
    '銀座': 'Ginza',
    '横浜': 'Yokohama',
    '東京': 'Tokyo',
    '池袋': 'Ikebukuro',
    '京都': 'Kyoto',
    '大阪': 'Osaka',
    '博多': 'Fukuoka',
    '札幌': 'Sapporo',
    '広島': 'Hiroshima',
    '那覇': 'Okinawa'
  };

'''
c = c.replace('  const RIVERS = [', map_block + '  const RIVERS = [')

# 2. Update TAG_ICONS - replace emojis with unicode symbols
c = c.replace("all: '\\uD83D\\uDCCC',", "all: '\\u2605',")
c = c.replace("night: '\\uD83C\\uDF19',", "night: '\\u263E',")
c = c.replace("history: '\\uD83C\\uDFDB\\uFE0F',", "history: '\\u2696',")
c = c.replace("nature: '\\uD83C\\uDF3F',", "nature: '\\u2668',")
c = c.replace("shrine: '\\u26E9\\uFE0F',", "shrine: '\\u264F',")
c = c.replace("food: '\\uD83C\\uDF5C',", "food: '\\u26C4',")
c = c.replace("seasonal: '\\uD83C\\uDF38'", "seasonal: '\\u2744'")

# 3. Fix findNearestStation - iterate over coords and add mapping
old_func = '''  function findNearestStation() {
    // Use station-coords.js for all stations
    for (const stationKey of Object.keys(coords)) {
      const coord = coords[stationKey];
      const dist = haversineDistance(state.userLat, state.userLng, coord[0], coord[1]);
      if (dist < minDistance) { minDistance = dist; nearestStation = stationKey; }
    }

    if (nearestStation) {'''

new_func = '''  function findNearestStation() {
    const spots = getSPOTS();
    const coords = getStationCoords();
    let nearestStation = null;
    let minDistance = Infinity;

    // 遍历所有站点坐标，找到最近的站
    for (const stationKey of Object.keys(coords)) {
      const coord = coords[stationKey];
      const dist = haversineDistance(state.userLat, state.userLng, coord[0], coord[1]);
      if (dist < minDistance) { minDistance = dist; nearestStation = stationKey; }
    }

    // 将日语站名映射到英语站名
    if (nearestStation && STATION_NAME_MAP[nearestStation]) {
      nearestStation = STATION_NAME_MAP[nearestStation];
    }

    if (nearestStation) {'''

c = c.replace(old_func, new_func)

with open('js/sightseeing.js', 'w', encoding='utf-8') as f:
    f.write(c)
print('sightseeing.js updated!')
print(f'Lines: {len(c.splitlines())}')
print(f'Has STATION_NAME_MAP: {"STATION_NAME_MAP" in c}')
print(f'Has mapping logic: {"STATION_NAME_MAP[nearestStation]" in c}')
print(f'Has unicode icons: {"\\\\u2605" in c or chr(0x2605) in c}')
