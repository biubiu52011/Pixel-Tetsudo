import codecs
path = r"C:\Users\80996\Documents\项目\像素铁道\js\supabase-client.js"
content = """/*
 * Supabase 客户端封装
 */

(function() {
    "use strict";
    const SUPABASE_URL = 'https://lcaixnrzdwhpmdwdiedx.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_Xrl2CLki_dRkjAsxFuWnxw_O9ajkQx0';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.__supabase = supabase;

    let _cache = null;
    let _stationsCache = null;

    const STATION_MAP = {
        'senso': 'Asakusa', 'nakamise': 'Asakusa', 'tokyo-skytree': 'Asakusa',
        'sumida-river': 'Asakusa', 'sumida-park': 'Asakusa', 'asakusa-arts': 'Asakusa',
        'meiji-dori': 'Shibuya', 'shibuya-crossing': 'Shibuya', 'shibuya-sky': 'Shibuya',
        'hachiko': 'Shibuya', 'shibuya-hikarie': 'Shibuya',
        'great-buddha': 'Kamakura', 'tsurugaoka': 'Kamakura', 'yuigahama': 'Kamakura',
        'inamuragasaki': 'Kamakura', 'kamakura-buddha': 'Kamakura',
        'toshogu': 'Nikko', 'futarasan': 'Nikko', 'lake-chuzenji': 'Nikko',
        'kegon-falls': 'Nikko', 'nikko-museum': 'Nikko',
        'shinjuku-gyoen': 'Shinjuku', 'kabukicho': 'Shinjuku',
        'toyo-gov-observatory': 'Shinjuku',
        'tokyo-national-museum': 'Ueno', 'ueno-zoo': 'Ueno',
        'ueno-park': 'Ueno', 'kan-ei-ji': 'Ueno'
    };

    window.fetchTourismFromSupabase = async function() {
        if (_cache) return _cache;
        const [spotsRes, stationsRes] = await Promise.all([
            supabase.from('spots').select('*').eq('publish_status', 1).order('sort_order'),
            supabase.from('stations').select('*')
        ]);
        if (spotsRes.error) { console.error('Supabase fetch error:', spotsRes.error); return null; }
        _stationsCache = {};
        (stationsRes.data || []).forEach(function(s) {
            _stationsCache[s.key] = { latitude: s.latitude, longitude: s.longitude };
        });
        _cache = {};
        spotsRes.data.forEach(function(r) {
            let stationKey = null;
            for (var prefix in STATION_MAP) {
                if (r.slug && r.slug.indexOf(prefix) === 0) {
                    stationKey = STATION_MAP[prefix];
                    break;
                }
            }
            if (!stationKey) return;
            if (!_cache[stationKey]) {
                const st = _stationsCache[stationKey] || { latitude: 35.7, longitude: 139.7 };
                _cache[stationKey] = { name: stationKey + ' Station', coord: [st.latitude, st.longitude], spots: [] };
            }
            _cache[stationKey].spots.push({
                emoji: r.emoji,
                name: r.name,
                dist: r.distance,
                dir: r.exit || 'Station',
                desc: r.description,
                tags: r.tags || ['all']
            });
        });
        window.TOURISM_DATA = _cache;
        window.TOURISM_STATIONS = Object.keys(_cache);
        return _cache;
    };
})();
"""
with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print('Done:', len(content), 'bytes')
