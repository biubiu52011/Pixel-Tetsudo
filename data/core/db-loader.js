/**
 * Pixel Tetsudo - Database Loader
 * 从 railway_data.json 加载所有数据到全局变量
 * 新增：IndexedDB 实时数据缓存（train positions + delay info）
 */
(function() {
  "use strict";

  // ========== IndexedDB Real-Time Cache ==========
  var RT_DB_NAME = "PixelTetsudoRT";
  var RT_STORE_NAME = "realtime";
  var _rtDb = null;

  function openRTDb() {
    return new Promise(function(resolve, reject) {
      if (_rtDb) { resolve(_rtDb); return; }
      var req = indexedDB.open(RT_DB_NAME, 1);
      req.onupgradeneeded = function(e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(RT_STORE_NAME)) {
          db.createObjectStore(RT_STORE_NAME, { keyPath: "key" });
        }
      };
      req.onsuccess = function(e) { _rtDb = e.target.result; resolve(_rtDb); };
      req.onerror = function() { reject(req.error); };
    });
  }

  function rtPut(key, value) {
    return openRTDb().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(RT_STORE_NAME, "readwrite");
        tx.objectStore(RT_STORE_NAME).put({ key: key, value: value, ts: Date.now() });
        tx.oncomplete = function() { resolve(); };
        tx.onerror = function() { reject(tx.error); };
      });
    });
  }

  function rtGet(key) {
    return openRTDb().then(function(db) {
      return new Promise(function(resolve, reject) {
        var tx = db.transaction(RT_STORE_NAME, "readonly");
        var req = tx.objectStore(RT_STORE_NAME).get(key);
        req.onsuccess = function() { resolve(req.result ? req.result.value : null); };
        req.onerror = function() { reject(tx.error); };
      });
    });
  }

  window.RTCache = {
    put: rtPut,
    get: rtGet,
    savePositions: function(positions) { return rtPut("positions", positions); },
    saveDelayInfo: function(delayInfo) { return rtPut("delayInfo", delayInfo); },
    loadPositions: function() { return rtGet("positions"); },
    loadDelayInfo: function() { return rtGet("delayInfo"); }
  };

  var DATA_FILE = "../data/core/railway_data.json";
  var STATION_I18N_FILE = "../data/core/station_i18n.json";
  var TOURISM_DATA_FILE = "../data/core/tourism_data.json";
  var _stationI18n = {};
  var loaded = false;
  var error = null;

  // Apply station data from an object with .stations, .lines, .tourism structure
function applyData(data, i18n) {
    _stationI18n = i18n || {};
    window.STATION_COORDS = {};
    Object.keys(data.stations).forEach(function(id) {
      var s = data.stations[id];
      if (s.lat && s.lng) {
        window.STATION_COORDS[id] = [s.lat, s.lng];
      }
    });

    window.STATION_NAME_MAP = data.name_map || {};
    window.EN_STATION_NAME_MAP = {};
    Object.keys(window.STATION_NAME_MAP).forEach(function(jp) {
      var v = window.STATION_NAME_MAP[jp];
      if (v && v.en) window.EN_STATION_NAME_MAP[v.en] = jp;
    });

    window.UNIFIED_LINES = data.lines || {};
    
    // ========== Data Correction Layer ==========
    // Fix known data issues in railway_data.json (locked file)
    (function applyDataCorrections() {
      // 1. Fix Arakawa Line station name: Kataomo_Bashi -> Omokage_Bashi (面影橋)
      if (window.UNIFIED_LINES.Arakawa && window.UNIFIED_LINES.Arakawa.stations) {
        var stations = window.UNIFIED_LINES.Arakawa.stations;
        for (var i = 0; i < stations.length; i++) {
          if (stations[i] === 'Kataomo_Bashi') {
            stations[i] = 'Omokage_Bashi';
          }
        }
      }
      
      // 2. Fix station name map for Omokage_Bashi
      if (window.STATION_NAME_MAP) {
        if (!window.STATION_NAME_MAP['Omokage_Bashi']) {
          window.STATION_NAME_MAP['Omokage_Bashi'] = { ja: '面影橋', en: 'Omokagebashi' };
        }
        if (window.EN_STATION_NAME_MAP) {
          window.EN_STATION_NAME_MAP['Omokagebashi'] = '面影橋';
        }
      }
      
      // 3. Fix station coordinates if available
      if (window.STATION_COORDS && window.STATION_COORDS['Kataomo_Bashi']) {
        window.STATION_COORDS['Omokage_Bashi'] = window.STATION_COORDS['Kataomo_Bashi'];
      }
      
      // 4. Fix line ID with diacritics: Tōnami -> Tonami
      if (window.UNIFIED_LINES['Tōnami']) {
        window.UNIFIED_LINES['Tonami'] = window.UNIFIED_LINES['Tōnami'];
        delete window.UNIFIED_LINES['Tōnami'];
        
        // Fix STATION_LINES references
        if (window.STATION_LINES) {
          Object.keys(window.STATION_LINES).forEach(function(sid) {
            window.STATION_LINES[sid].forEach(function(sl) {
              if (sl.line_id === 'Tōnami') {
                sl.line_id = 'Tonami';
              }
            });
          });
        }
        
        // Fix LINE_STATION_ORDER references
        if (window.LINE_STATION_ORDER && window.LINE_STATION_ORDER['Tōnami']) {
          window.LINE_STATION_ORDER['Tonami'] = window.LINE_STATION_ORDER['Tōnami'];
          delete window.LINE_STATION_ORDER['Tōnami'];
        }
      }
      
      // 5. Add Marunouchi Line Branch (Honancho Branch)
      if (!window.UNIFIED_LINES['MarunouchiBranch']) {
        window.UNIFIED_LINES['MarunouchiBranch'] = {
          name: 'MarunouchiBranch',
          nameEn: 'Marunouchi Line Branch',
          nameJa: '丸ノ内線（方南町支線）',
          code: 'Mb',
          color: '#f31630',
          operator: 'TokyoMetro',
          region: 'Tokyo Area',
          type: 'branch',
          branchOf: 'Marunouchi',
          image: '../images/鉄道/東京メトロ/丸ノ内線.png',
          durationTotalMin: 5,
          stations: [
            'Nakano-Sakaue',
            'Nishi-Shinjuku-Gochome',
            'Honancho'
          ],
          durations: [2, 2],
          throughServices: [],
          transferStations: []
        };
        
        // Add station definitions if missing
        if (!data.stations['Nishi-Shinjuku-Gochome']) {
          data.stations['Nishi-Shinjuku-Gochome'] = { lat: 35.6918, lng: 139.6867 };
        }
        if (!data.stations['Honancho']) {
          data.stations['Honancho'] = { lat: 35.6938, lng: 139.6817 };
        }
        
        // Add station name map
        if (window.STATION_NAME_MAP) {
          if (!window.STATION_NAME_MAP['Nishi-Shinjuku-Gochome']) {
            window.STATION_NAME_MAP['Nishi-Shinjuku-Gochome'] = { ja: '西新宿五丁目', en: 'Nishi-Shinjuku-gochome' };
          }
          if (!window.STATION_NAME_MAP['Honancho']) {
            window.STATION_NAME_MAP['Honancho'] = { ja: '方南町', en: 'Honancho' };
          }
          if (window.EN_STATION_NAME_MAP) {
            window.EN_STATION_NAME_MAP['Nishi-Shinjuku-gochome'] = '西新宿五丁目';
            window.EN_STATION_NAME_MAP['Honancho'] = '方南町';
          }
        }
        
        // Add STATION_LINES references
        if (window.STATION_LINES) {
          var branchStations = ['Nakano-Sakaue', 'Nishi-Shinjuku-Gochome', 'Honancho'];
          branchStations.forEach(function(sid, order) {
            if (!window.STATION_LINES[sid]) {
              window.STATION_LINES[sid] = [];
            }
            // Check if already added
            var alreadyExists = window.STATION_LINES[sid].some(function(sl) {
              return sl.line_id === 'MarunouchiBranch';
            });
            if (!alreadyExists) {
              window.STATION_LINES[sid].push({ line_id: 'MarunouchiBranch', station_order: order });
            }
          });
        }
        
        // Add LINE_STATION_ORDER
        if (window.LINE_STATION_ORDER) {
          window.LINE_STATION_ORDER['MarunouchiBranch'] = {};
          var branchStations = ['Nakano-Sakaue', 'Nishi-Shinjuku-Gochome', 'Honancho'];
          branchStations.forEach(function(sid, order) {
            window.LINE_STATION_ORDER['MarunouchiBranch'][sid] = order;
          });
        }
      }
      
      // 6. Add Tsurumi Line Branches (Umi-Shibaura Branch & Okawa Branch)
      // Umi-Shibaura Branch: Anzen -> Umi-Shibaura
      if (!window.UNIFIED_LINES['TsurumiUmiShibaura']) {
        window.UNIFIED_LINES['TsurumiUmiShibaura'] = {
          name: 'TsurumiUmiShibaura',
          nameEn: 'Tsurumi Line Umi-Shibaura Branch',
          nameJa: '鶴見線（海芝浦支線）',
          code: 'JI-U',
          color: '#ffd400',
          operator: 'JR-East',
          region: 'Tokyo Area',
          type: 'branch',
          branchOf: 'Tsurumi',
          image: '../images/鉄道/JR東日本/鶴見線.png',
          durationTotalMin: 3,
          stations: [
            'Anzen',
            'Umi-Shibaura'
          ],
          durations: [2],
          throughServices: [],
          transferStations: []
        };
        
        // Add station definition if missing
        if (!data.stations['Umi-Shibaura']) {
          data.stations['Umi-Shibaura'] = { lat: 35.4833, lng: 139.7833 };
        }
        
        // Add station name map
        if (window.STATION_NAME_MAP) {
          if (!window.STATION_NAME_MAP['Umi-Shibaura']) {
            window.STATION_NAME_MAP['Umi-Shibaura'] = { ja: '海芝浦', en: 'Umi-Shibaura' };
          }
          if (window.EN_STATION_NAME_MAP) {
            window.EN_STATION_NAME_MAP['Umi-Shibaura'] = '海芝浦';
          }
        }
        
        // Add STATION_LINES references
        if (window.STATION_LINES) {
          var branchStations = ['Anzen', 'Umi-Shibaura'];
          branchStations.forEach(function(sid, order) {
            if (!window.STATION_LINES[sid]) {
              window.STATION_LINES[sid] = [];
            }
            var alreadyExists = window.STATION_LINES[sid].some(function(sl) {
              return sl.line_id === 'TsurumiUmiShibaura';
            });
            if (!alreadyExists) {
              window.STATION_LINES[sid].push({ line_id: 'TsurumiUmiShibaura', station_order: order });
            }
          });
        }
        
        // Add LINE_STATION_ORDER
        if (window.LINE_STATION_ORDER) {
          window.LINE_STATION_ORDER['TsurumiUmiShibaura'] = {};
          var branchStations = ['Anzen', 'Umi-Shibaura'];
          branchStations.forEach(function(sid, order) {
            window.LINE_STATION_ORDER['TsurumiUmiShibaura'][sid] = order;
          });
        }
      }
      
      // Okawa Branch: Asano -> Okawa
      if (!window.UNIFIED_LINES['TsurumiOkawa']) {
        window.UNIFIED_LINES['TsurumiOkawa'] = {
          name: 'TsurumiOkawa',
          nameEn: 'Tsurumi Line Okawa Branch',
          nameJa: '鶴見線（大川支線）',
          code: 'JI-O',
          color: '#ffd400',
          operator: 'JR-East',
          region: 'Tokyo Area',
          type: 'branch',
          branchOf: 'Tsurumi',
          image: '../images/鉄道/JR東日本/鶴見線.png',
          durationTotalMin: 3,
          stations: [
            'Asano',
            'Okawa'
          ],
          durations: [2],
          throughServices: [],
          transferStations: []
        };
        
        // Add station definition if missing
        if (!data.stations['Okawa']) {
          data.stations['Okawa'] = { lat: 35.4917, lng: 139.7917 };
        }
        
        // Add station name map
        if (window.STATION_NAME_MAP) {
          if (!window.STATION_NAME_MAP['Okawa']) {
            window.STATION_NAME_MAP['Okawa'] = { ja: '大川', en: 'Okawa' };
          }
          if (window.EN_STATION_NAME_MAP) {
            window.EN_STATION_NAME_MAP['Okawa'] = '大川';
          }
        }
        
        // Add STATION_LINES references
        if (window.STATION_LINES) {
          var branchStations = ['Asano', 'Okawa'];
          branchStations.forEach(function(sid, order) {
            if (!window.STATION_LINES[sid]) {
              window.STATION_LINES[sid] = [];
            }
            var alreadyExists = window.STATION_LINES[sid].some(function(sl) {
              return sl.line_id === 'TsurumiOkawa';
            });
            if (!alreadyExists) {
              window.STATION_LINES[sid].push({ line_id: 'TsurumiOkawa', station_order: order });
            }
          });
        }
        
        // Add LINE_STATION_ORDER
        if (window.LINE_STATION_ORDER) {
          window.LINE_STATION_ORDER['TsurumiOkawa'] = {};
          var branchStations = ['Asano', 'Okawa'];
          branchStations.forEach(function(sid, order) {
            window.LINE_STATION_ORDER['TsurumiOkawa'][sid] = order;
          });
        }
      }
      
      // 7. Reorder Oedo Line stations to reflect "6-shaped" loop
      // Correct order: Tochomae -> Hikarigaoka branch -> Tochomae -> Loop -> Tochomae
      if (window.UNIFIED_LINES['Oedo'] && window.UNIFIED_LINES['Oedo'].stations) {
        var oldStations = window.UNIFIED_LINES['Oedo'].stations;
        
        // Find Tochomae index
        var tochomaeIndex = oldStations.indexOf('Tochomae');
        
        if (tochomaeIndex > 0) {
          // Split into two parts:
          // Part 1: Hikarigaoka -> Tochomae (光丘方向)
          var hikarigaokaPart = oldStations.slice(0, tochomaeIndex + 1);
          // Part 2: Tochomae -> Shinjuku-Sanchome (环线方向)
          var loopPart = oldStations.slice(tochomaeIndex);
          
          // New order: Tochomae -> Hikarigaoka (reverse) -> Tochomae -> Loop (skip first Tochomae)
          // This reflects the "6-shaped" line
          var hikarigaokaReverse = hikarigaokaPart.slice().reverse();
          var loopWithoutFirst = loopPart.slice(1);
          
          // Combine: Tochomae (start) -> Hikarigaoka -> Tochomae -> Loop -> Tochomae (end)
          // But we don't want duplicate Tochomae, so:
          // Tochomae -> Hikarigaoka direction (reverse, ending at Tochomae) -> Loop direction (starting after Tochomae)
          var newStations = hikarigaokaReverse.concat(loopWithoutFirst);
          
          // Update stations
          window.UNIFIED_LINES['Oedo'].stations = newStations;
          
          // Update durations to match new station count
          if (window.UNIFIED_LINES['Oedo'].durations) {
            var newDurations = [];
            for (var i = 0; i < newStations.length - 1; i++) {
              newDurations.push(2); // Default 2 minutes
            }
            window.UNIFIED_LINES['Oedo'].durations = newDurations;
          }
          
          // Update LINE_STATION_ORDER
          if (window.LINE_STATION_ORDER) {
            window.LINE_STATION_ORDER['Oedo'] = {};
            newStations.forEach(function(sid, order) {
              window.LINE_STATION_ORDER['Oedo'][sid] = order;
            });
          }
          
          // Update STATION_LINES references
          if (window.STATION_LINES) {
            newStations.forEach(function(sid, order) {
              if (!window.STATION_LINES[sid]) {
                window.STATION_LINES[sid] = [];
              }
              // Remove old Oedo references
              window.STATION_LINES[sid] = window.STATION_LINES[sid].filter(function(sl) {
                return sl.line_id !== 'Oedo';
              });
              // Add new Oedo reference
              window.STATION_LINES[sid].push({ line_id: 'Oedo', station_order: order });
            });
          }
          
          // Mark as special 6-shaped loop
          window.UNIFIED_LINES['Oedo'].isSixShapedLoop = true;
          window.UNIFIED_LINES['Oedo'].loopJunction = 'Tochomae';
        }
      }

      // 8. Fix wrong station lists copied from other lines (Kiryu/Sano copied Sagami Line, Yamagata copied Senseki Line)
      //    Verified against official/Wikipedia station lists (2026-09-07):
      //    - Tobu Kiryu Line: Ota -> Akagi (8 stations)
      //    - Tobu Sano Line: Tatebayashi -> Kuzu (10 stations)
      //    - JR Yamagata Line (Ou Main Line Fukushima-Shinjo section): 35 stations
      var LINE_STATION_FIXES = {
        Kiryu: {
          name: 'Kiryu', nameEn: 'Kiryu Line', nameJa: '東武桐生線',
          stations: ['Ota', 'Sanmaihashi', 'Jiroembashi', 'Yabuzuka', 'Azami', 'Shin-Kiryu', 'Aioi', 'Akagi']
        },
        Sano: {
          name: 'Sano', nameEn: 'Sano Line', nameJa: '東武佐野線',
          stations: ['Tatebayashi', 'Watarase', 'Tajima', 'Sano-Shi', 'Sano', 'Horigome', 'Yoshimizu', 'Tanuma', 'Tada', 'Kuzu']
        },
        Yamagata: {
          name: 'Yamagata', nameEn: 'Yamagata Line', nameJa: '山形線',
          stations: ['Fukushima', 'Sasakino', 'Niwasaka', 'Itaya', 'Toge', 'Osawa', 'Sekine', 'Yonezawa', 'Oitama', 'Takahata', 'Akayu', 'Nakagawa', 'Uzen-Nakayama', 'Kaminoyama-Onsen', 'Mokichi-Kinenkan-mae', 'Zao', 'Yamagata', 'Kita-Yamagata', 'Uzen-Chitose', 'Minami-Dewa', 'Urushiyama', 'Takatama', 'Tendo-Minami', 'Tendo', 'Midaregawa', 'Jimmachi', 'Sakurambo-Higashine', 'Higashine', 'Murayama', 'Sodesaki', 'Oishida', 'Kita-Oishida', 'Ashisawa', 'Funagata', 'Shinjo']
        }
      };
      // Missing station definitions (ID, ja, zh, ko, approx lat/lng). Coordinates are approximate (km-level accuracy, sufficient for proximity features).
      var STATION_FIX_DATA = {
        'Sanmaihashi':           { ja: '三枚橋',   zh: '三枚桥',  ko: '산마이하시',         lat: 36.2930, lng: 139.3810 },
        'Jiroembashi':           { ja: '治良門橋', zh: '治良门桥', ko: '지로에몬바시',       lat: 36.3060, lng: 139.3500 },
        'Yabuzuka':              { ja: '藪塚',     zh: '薮冢',     ko: '야부즈카',           lat: 36.3180, lng: 139.3300 },
        'Azami':                 { ja: '阿左美',   zh: '阿左美',   ko: '아자미',             lat: 36.3330, lng: 139.3010 },
        'Shin-Kiryu':            { ja: '新桐生',   zh: '新桐生',   ko: '신키류',             lat: 36.3980, lng: 139.3210 },
        'Aioi':                  { ja: '相老',     zh: '相老',     ko: '아이오이',           lat: 36.4210, lng: 139.3190 },
        'Watarase':              { ja: '渡瀬',     zh: '渡濑',     ko: '와타라세',           lat: 36.2280, lng: 139.5250 },
        'Tajima':                { ja: '田島',     zh: '田岛',     ko: '타지마',             lat: 36.3080, lng: 139.5620 },
        'Sano-Shi':              { ja: '佐野市',   zh: '佐野市',   ko: '사노시',             lat: 36.3120, lng: 139.5750 },
        'Horigome':              { ja: '堀米',     zh: '堀米',     ko: '호리고메',           lat: 36.3160, lng: 139.5850 },
        'Yoshimizu':             { ja: '吉水',     zh: '吉水',     ko: '요시미즈',           lat: 36.3150, lng: 139.5550 },
        'Tanuma':                { ja: '田沼',     zh: '田沼',     ko: '타누마',             lat: 36.3650, lng: 139.5450 },
        'Tada':                  { ja: '多田',     zh: '多田',     ko: '타다',               lat: 36.3720, lng: 139.5350 },
        'Niwasaka':              { ja: '庭坂',     zh: '庭坂',     ko: '니와사카',           lat: 37.7640, lng: 140.3920 },
        'Osawa':                 { ja: '大沢',     zh: '大泽',     ko: '오사와',             lat: 37.8660, lng: 140.2100 },
        'Oitama':                { ja: '置賜',     zh: '置赐',     ko: '오이타마',           lat: 37.9080, lng: 140.1420 },
        'Takahata':              { ja: '高畠',     zh: '高畠',     ko: '다카하타',           lat: 37.9850, lng: 140.1720 },
        'Uzen-Nakayama':         { ja: '羽前中山', zh: '羽前中山', ko: '우젠나카야마',       lat: 38.1520, lng: 140.3010 },
        'Mokichi-Kinenkan-mae':  { ja: '茂吉記念館前', zh: '茂吉纪念馆前', ko: '모키치키넨칸마에', lat: 38.2010, lng: 140.3210 },
        'Urushiyama':            { ja: '漆山',     zh: '漆山',     ko: '우루시야마',         lat: 38.3320, lng: 140.3610 },
        'Takatama':              { ja: '高擶',     zh: '高擶',     ko: '다카타마',           lat: 38.3510, lng: 140.3640 },
        'Tendo-Minami':          { ja: '天童南',   zh: '天童南',   ko: '덴도미나미',         lat: 38.3420, lng: 140.3710 },
        'Midaregawa':            { ja: '乱川',     zh: '乱川',     ko: '미다레가와',         lat: 38.3680, lng: 140.3800 },
        'Jimmachi':              { ja: '神町',     zh: '神町',     ko: '진마치',             lat: 38.4010, lng: 140.3900 },
        'Sakurambo-Higashine':   { ja: 'さくらんぼ東根', zh: '樱桃东根', ko: '사쿠란보히가시네', lat: 38.4200, lng: 140.3830 },
        'Higashine':             { ja: '東根',     zh: '东根',     ko: '히가시네',           lat: 38.4310, lng: 140.3820 },
        'Sodesaki':              { ja: '袖崎',     zh: '袖崎',     ko: '소데사키',           lat: 38.4890, lng: 140.3880 },
        'Oishida':               { ja: '大石田',   zh: '大石田',   ko: '오이시다',           lat: 38.5940, lng: 140.3740 },
        'Kita-Oishida':          { ja: '北大石田', zh: '北大石田', ko: '기타오이시다',       lat: 38.6110, lng: 140.3720 },
        'Ashisawa':              { ja: '芦沢',     zh: '芦泽',     ko: '아시사와',           lat: 38.6590, lng: 140.3710 }
      };
      Object.keys(LINE_STATION_FIXES).forEach(function(lid) {
        var fix = LINE_STATION_FIXES[lid];
        var line = window.UNIFIED_LINES[lid];
        if (!line) return;
        // Fix display names (Kiryu/Sano had Sagami Line names copied)
        if (fix.name) line.name = fix.name;
        if (fix.nameEn) line.nameEn = fix.nameEn;
        if (fix.nameJa) line.nameJa = fix.nameJa;
        // Replace station list
        var newStations = fix.stations.slice();
        line.stations = newStations;
        // Reset durations (approximate 3 min intervals, keep simple)
        var newDurations = [];
        for (var di = 0; di < newStations.length - 1; di++) newDurations.push(3);
        line.durations = newDurations;
        // Sync LINE_STATION_ORDER
        if (window.LINE_STATION_ORDER) {
          window.LINE_STATION_ORDER[lid] = {};
          newStations.forEach(function(sid, order) {
            window.LINE_STATION_ORDER[lid][sid] = order;
          });
        }
      });
      // Add missing station definitions
      Object.keys(STATION_FIX_DATA).forEach(function(sid) {
        var sd = STATION_FIX_DATA[sid];
        // station coordinates + display names
        if (!data.stations[sid]) {
          data.stations[sid] = { lat: sd.lat, lng: sd.lng, nameJa: sd.ja, nameEn: sid, nameZh: sd.zh, nameKo: sd.ko };
        }
        // i18n (feeds resolveStationName)
        if (!_stationI18n[sid]) {
          _stationI18n[sid] = { ja: sd.ja, zh: sd.zh, ko: sd.ko };
        }
        // name maps (feeds getStationName)
        if (window.STATION_NAME_MAP) {
          if (!window.STATION_NAME_MAP[sid]) {
            window.STATION_NAME_MAP[sid] = { ja: sd.ja, en: sid };
          }
          if (window.EN_STATION_NAME_MAP && !window.EN_STATION_NAME_MAP[sid]) {
            window.EN_STATION_NAME_MAP[sid] = sd.ja;
          }
        }
      });

      // 9. Add Chiyoda Line Kita-Ayase Branch (branch: Ayase -> Kita-Ayase)
      //    Kita-Ayase is a branch terminal, not part of the Chiyoda main line run.
      var _chiyoda = window.UNIFIED_LINES['Chiyoda'];
      if (_chiyoda && _chiyoda.stations) {
        var _kaIdx = _chiyoda.stations.indexOf('Kita-Ayase');
        if (_kaIdx >= 0) {
          _chiyoda.stations.splice(_kaIdx, 1);
          if (_chiyoda.durations && _chiyoda.durations.length > _kaIdx - 1) {
            _chiyoda.durations.splice(_kaIdx - 1, 1);
          }
        }
        if (!window.UNIFIED_LINES['ChiyodaBranch']) {
          window.UNIFIED_LINES['ChiyodaBranch'] = {
            name: 'ChiyodaBranch',
            nameEn: 'Chiyoda Line (Kita-Ayase Branch)',
            nameJa: '千代田線（北綾瀬支線）',
            code: 'C-b',
            color: '#009944',
            operator: 'TokyoMetro',
            region: 'Tokyo Area',
            type: 'branch',
            branchOf: 'Chiyoda',
            image: '../images/鉄道/東京メトロ/北綾瀬支線.png',
            durationTotalMin: 2,
            stations: ['Ayase', 'Kita-Ayase'],
            durations: [2],
            throughServices: [],
            transferStations: []
          };
        }
        // Station coords + name maps (i18n already present)
        if (!data.stations['Ayase']) {
          data.stations['Ayase'] = { lat: 35.7620, lng: 139.8258, nameJa: '綾瀬', nameEn: 'Ayase', nameZh: '绫濑', nameKo: '아야세' };
        }
        if (!data.stations['Kita-Ayase']) {
          data.stations['Kita-Ayase'] = { lat: 35.7928, lng: 139.8261, nameJa: '北綾瀬', nameEn: 'Kita-Ayase', nameZh: '北绫濑', nameKo: '키타아야세' };
        }
        if (window.STATION_NAME_MAP) {
          if (!window.STATION_NAME_MAP['Ayase']) window.STATION_NAME_MAP['Ayase'] = { ja: '綾瀬', en: 'Ayase' };
          if (!window.STATION_NAME_MAP['Kita-Ayase']) window.STATION_NAME_MAP['Kita-Ayase'] = { ja: '北綾瀬', en: 'Kita-Ayase' };
        }
      }

      // 10. Line image fixes (align with actual icon library) — I2
      var LINE_IMAGE_FIXES = {
        "Keisei": "../images/鉄道/京成電鉄/京成本線.png",
        "TamaMonorail": "../images/鉄道/多摩都市モノレール/多摩都市モノレール線.png",
        "SotetsuMain": "../images/鉄道/相鉄/相鉄本線.png",
        "Ikebukuro": "../images/鉄道/西武鉄道/西武池袋線.png",
        "TobuNikko": "../images/鉄道/東武鉄道/日光線 宇都宮線 鬼怒川線.png",
        "HitachiNakaKaimin": "../images/鉄道/ひたちなか海浜鉄道/湊線.png",
        "TokyuDenEn": "../images/鉄道/東急電鉄/田園都市線.png",
        "Keikyu": "../images/鉄道/京急電鉄/京急本線.png",
        "MinatoMirai": "../images/鉄道/横浜高速鉄道/みなとみらい線.png",
        "KeioInokashira": "../images/鉄道/京王電鉄/井の頭線.png",
        "KeioMain": "../images/鉄道/京王電鉄/京王線.png",
        "KeioShin": "../images/鉄道/京王電鉄/京王新線.png",
        "Nippori_Toneri": "../images/鉄道/都営地下鉄/日暮里・舎人ライナー.png",
        "TsukubaExpress": "../images/鉄道/首都圏新都市鉄道/つくばエクスプレス.png",
        "TokyuOimachi": "../images/鉄道/東急電鉄/大井町線.png",
        "TokyuMeguro": "../images/鉄道/東急電鉄/目黒線.png",
        "TokyuIkegami": "../images/鉄道/東急電鉄/池上線.png",
        "TokyuSetagaya": "../images/鉄道/東急電鉄/世田谷線.png",
        "TokyuKodomonokuni": "../images/鉄道/東急電鉄/こどもの国線.png",
        "KeiseiOshiage": "../images/鉄道/京成電鉄/京成押上線.png",
        "KeiseiKanamachi": "../images/鉄道/京成電鉄/京成金町線.png",
        "KeiseiChiba": "../images/鉄道/京成電鉄/京成千葉線.png",
        "KeiseiChihara": "../images/鉄道/京成電鉄/京成千原線.png",
        "NaritaSkyAccess": "../images/鉄道/京成電鉄/成田スカイアクセス.png",
        "SotetsuIzumino": "../images/鉄道/相鉄/相鉄いずみ野線.png",
        "NewShuttle": "../images/鉄道/埼玉新都市交通/伊奈線.png",
        "ChibaUrbanMonorail": "../images/鉄道/千葉都市モノレール/千葉都市モノレール1号線.png",
        "TokyoMonorail": "../images/鉄道/東京モノレール/東京モノレール羽田空港線.png",
        "Tojo": "../images/鉄道/東武鉄道/東武東上線.png",
        "SobuMain": "../images/鉄道/JR東日本/総武線快速横須賀線.png",
        "ChuoMain": "../images/鉄道/JR東日本/中央快速線.png",
        "TokaidoMain": "../images/鉄道/JR東日本/東海道線.png",
        "Oyama": "../images/鉄道/JR東日本/宇都宮線.png",
        "SotetsuShin-Yokohama": "../images/鉄道/相鉄/相鉄新横浜線.png",
        "ChiyodaBranch": "../images/列车/東京メトロ/北綾瀬支線.png",
      };
      Object.keys(LINE_IMAGE_FIXES).forEach(function(lid) {
        var line = window.UNIFIED_LINES[lid];
        if (line) line.image = LINE_IMAGE_FIXES[lid];
      });
    })();
    
    Object.keys(window.UNIFIED_LINES).forEach(function(lid) {
      var l = window.UNIFIED_LINES[lid];
      if (!l.durations) l.durations = [2] * (l.stations ? l.stations.length : 0);
      if (!l.throughServices) l.throughServices = [];
      if (!l.transferStations) l.transferStations = [];
    });

    // Tourism data: global spots pool (no station binding) + station coordinate corrections
    window.TOURISM_SPOTS = [];
    // Backward compat: collect spots from old station-grouped format in railway_data.json
    if (data.tourism && typeof data.tourism === 'object') {
      Object.keys(data.tourism).forEach(function(stationKey) {
        var st = data.tourism[stationKey];
        if (st && st.spots && Array.isArray(st.spots)) {
          st.spots.forEach(function(spot) {
            window.TOURISM_SPOTS.push(spot);
          });
        }
      });
    }
    // Merge JS-based tourism override (works under file:// protocol where fetch is blocked)
    // New format: { spots: [...], station_coords: { ... } }
    if (window.TOURISM_OVERRIDE && typeof window.TOURISM_OVERRIDE === 'object') {
      if (window.TOURISM_OVERRIDE.spots && Array.isArray(window.TOURISM_OVERRIDE.spots)) {
        window.TOURISM_SPOTS = window.TOURISM_OVERRIDE.spots;
      }
      if (window.TOURISM_OVERRIDE.station_coords && typeof window.TOURISM_OVERRIDE.station_coords === 'object') {
        Object.keys(window.TOURISM_OVERRIDE.station_coords).forEach(function(stationKey) {
          var coord = window.TOURISM_OVERRIDE.station_coords[stationKey];
          if (coord && coord.length === 2) {
            window.STATION_COORDS[stationKey] = coord;
          }
        });

      }
      // Load station exits (only exits that actually exist at each station)
      if (window.TOURISM_OVERRIDE.station_exits && typeof window.TOURISM_OVERRIDE.station_exits === 'object') {
        window.STATION_EXITS = window.TOURISM_OVERRIDE.station_exits;
      } else {
        window.STATION_EXITS = {};
      }
      // Backward compat: old station-grouped override format
      Object.keys(window.TOURISM_OVERRIDE).forEach(function(key) {
        if (key === 'spots' || key === 'station_coords') return;
        var st = window.TOURISM_OVERRIDE[key];
        if (st && st.coord && st.coord.length === 2) {
          window.STATION_COORDS[key] = st.coord;
        }
      });
    }
    // Keep TOURISM_DATA as empty object for backward compatibility (old code may check it)
    window.TOURISM_DATA = {};
    window.TOURISM_STATIONS = [];

    // Build canonical StationLine relation
    window.STATION_LINES = {};
    if (data.stationLines) {
      Object.assign(window.STATION_LINES, data.stationLines);
    } else {
      Object.keys(window.UNIFIED_LINES).forEach(function(lid) {
        var line = window.UNIFIED_LINES[lid];
        if (line.stations) {
          line.stations.forEach(function(sid, order) {
            if (!window.STATION_LINES[sid]) window.STATION_LINES[sid] = [];
            window.STATION_LINES[sid].push({line_id: lid, station_order: order});
          });
        }
      });
    }

    // Build line->station order map
    window.LINE_STATION_ORDER = {};
    if (data.lineStationOrder) {
      Object.assign(window.LINE_STATION_ORDER, data.lineStationOrder);
    } else {
      Object.keys(window.UNIFIED_LINES).forEach(function(lid) {
        var line = window.UNIFIED_LINES[lid];
        if (line.stations) {
          window.LINE_STATION_ORDER[lid] = {};
          line.stations.forEach(function(sid, order) {
            window.LINE_STATION_ORDER[lid][sid] = order;
          });
        }
      });
    }

    // 8b. Re-sync STATION_LINES / LINE_STATION_ORDER for the corrected lines
    //     (must run AFTER the canonical maps are built from the locked JSON)
    var _fixedLineIds = ['Kiryu', 'Sano', 'Yamagata', 'ChiyodaBranch'];
    _fixedLineIds.forEach(function(lid) {
      var line = window.UNIFIED_LINES[lid];
      if (!line || !line.stations) return;
      // Rebuild LINE_STATION_ORDER
      if (window.LINE_STATION_ORDER) {
        window.LINE_STATION_ORDER[lid] = {};
        line.stations.forEach(function(sid, order) {
          window.LINE_STATION_ORDER[lid][sid] = order;
        });
      }
      // Rebuild STATION_LINES
      if (window.STATION_LINES) {
        line.stations.forEach(function(sid, order) {
          if (!window.STATION_LINES[sid]) window.STATION_LINES[sid] = [];
          window.STATION_LINES[sid] = window.STATION_LINES[sid].filter(function(sl) {
            return sl.line_id !== lid;
          });
          window.STATION_LINES[sid].push({ line_id: lid, station_order: order });
        });
      }
    });

    // ========== Unified Railway Data Access Layer ==========
          // Name map cache
      var _nameMapCache = {};

      window.RailwayDB = {
      // Station queries
      getStation: function(id) { return data.stations[id] || null; },
      getStations: function() { return data.stations; },
      getStationLocation: function(id) {
        var s = data.stations[id];
        return s && s.lat && s.lng ? [s.lat, s.lng] : null;
      },
      getStationLines: function(id) { return window.STATION_LINES[id] || []; },
      getStationName: function(id, lang) {
        if (!id) return null;
        var nm = window.STATION_NAME_MAP;
        if (lang === 'en') {
          var enMap = window.EN_STATION_NAME_MAP || {};
          if (nm[id] && nm[id].en) return nm[id].en;
          for (var k in nm) { if (nm[k].en === id) return nm[k].ja || k; }
          return id;
        }
        return nm[id] && nm[id].ja ? nm[id].ja : id;
      },

      // Line queries
      getLine: function(id) { return data.lines[id] || null; },
      getAllLines: function() { return data.lines; },
      getLineStations: function(id) {
        var line = data.lines[id];
        return line ? line.stations || [] : [];
      },
      getLineStationOrder: function(lineId, stationId) {
        var orderMap = window.LINE_STATION_ORDER[lineId];
        return orderMap ? orderMap[stationId] : null;
      },
      getLineColors: function() {
        var colors = {};
        Object.keys(data.lines).forEach(function(k){ colors[k] = data.lines[k].color; });
        return colors;
      },
      // Display name resolution
      resolveLineName: function(id, lang) {
        if (!id) return '';
        lang = (lang || window.currentLang || 'ja').toLowerCase();
        var line = data.lines ? data.lines[id] : null;
        if (!line) return id;
        var nameKey = 'name' + lang.charAt(0).toUpperCase() + lang.slice(1);
        return line[nameKey] || line.nameJa || line.nameEn || line.name || id;
      },
      // Nearby queries
      getNearbyStations: function(lat, lng, radiusKm, limit) {
        limit = limit || 10;
        radiusKm = radiusKm || 2;
        var results = [];
        Object.keys(data.stations).forEach(function(id) {
          var s = data.stations[id];
          if (!s.lat || !s.lng) return;
          var d = Math.sqrt(Math.pow(s.lat-lat,2)+Math.pow(s.lng-lng,2))*111;
          if (d <= radiusKm) results.push({id: id, dist: d, name: s});
        });
        results.sort(function(a,b){return a.dist-b.dist;});
        return results.slice(0, limit).map(function(r){return r.id;});
      },
      getNearbySpots: function(lat, lng, radiusKm, limit) {
        limit = limit || 10;
        radiusKm = radiusKm || 5;
        var results = [];
        Object.keys(data.tourism || {}).forEach(function(sid) {
          var ts = data.tourism[sid];
          if (!ts.spots) return;
          ts.spots.forEach(function(sp){
            var spLat = sp.lat || (sp.coord && sp.coord[0]);
            var spLng = sp.lng || (sp.coord && sp.coord[1]);
            if (!spLat || !spLng) return;
            var d = Math.sqrt(Math.pow(spLat-lat,2)+Math.pow(spLng-lng,2))*111;
            if (d <= radiusKm) results.push({stationId: sid, spot: sp, dist: d});
          });
        });
        results.sort(function(a,b){return a.dist-b.dist;});
        return results.slice(0, limit);
      },

      // Name map
      getNameMap: function() { return data.name_map; },
      resolveStationName: function(id, lang) {
        if (!id) return null;
        lang = lang || window.currentLang || 'ja';
        // 0. Check dedicated station_i18n data (zh/ko/ja) first
        if (_stationI18n && _stationI18n[id]) {
          var _i18n = _stationI18n[id];
          if (lang === 'zh' && _i18n.zh) return _i18n.zh;
          if (lang === 'ko' && _i18n.ko) return _i18n.ko;
          if (lang === 'ja' && _i18n.ja) return _i18n.ja;
          if (lang === 'en' && _i18n.en) return _i18n.en;
        }
        var nm = data.name_map;
        var _hasJp = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(id);

        // 0. If id is already Japanese, return it for ja mode;
        //    for other languages try name_map for the English translation.
        if (_hasJp) {
          if (lang === 'ja') return id;
          var direct = nm[id];
          if (direct) {
            if (typeof direct === 'string') return direct;
            if (typeof direct === 'object' && direct[lang]) return direct[lang];
            if (typeof direct === 'object' && direct.en) return direct.en;
          }
          return id;
        }

        // 1. Check station entity name fields (forward-compatible)
        var s = data.stations[id];
        if (s) {
          var n = s['name' + lang.charAt(0).toUpperCase() + lang.slice(1)];
          if (n) return n;
        }

        // 2. Reverse lookup: romanized id -> Japanese key in name_map.
        //    Prefer keys without trailing 駅 (display names omit the suffix).
        var valToKey = _nameMapCache.valToKey;
        if (!valToKey) {
          valToKey = {};
          Object.keys(nm).forEach(function(jpKey) {
            var val = nm[jpKey];
            if (typeof val !== 'string') return;
            var lk = val.toLowerCase();
            // Prefer the key without trailing 駅 when both exist
            if (!valToKey[lk] || (jpKey.slice(-1) !== '\u99c5' && valToKey[lk].slice(-1) === '\u99c5')) {
              valToKey[lk] = jpKey;
            }
          });
          _nameMapCache.valToKey = valToKey;
        }
        var matchedKey = valToKey[id.toLowerCase()];
        if (matchedKey) {
          // Save the original English value before normalizing the key.
          var _enVal = nm[matchedKey];
          // Strip trailing 駅 when a bare station-name key also exists
          // (e.g. "新宿駅" -> "新宿" because display names omit the suffix).
          if (matchedKey.slice(-1) === '\u99c5' && nm[matchedKey.slice(0, -1)]) {
            matchedKey = matchedKey.slice(0, -1);
          }
          if (lang === 'ja') return matchedKey;
          if (lang === 'en') {
            return typeof _enVal === 'string' ? _enVal : matchedKey;
          }
          // zh / ko: no translation data in canonical DB — fall back to
          // Japanese kanji (readable for Chinese users) rather than English.
          return matchedKey;
        }

        // 3. Fallback: return id
        return id;
      },

      // Tourism
      getTourism: function() { return data.tourism; },
      getSpot: function(station, spotName) {
        var ts = data.tourism ? data.tourism[station] : null;
        if (!ts) return null;
        return ts.spots.find(function(s) { return s.name === spotName; }) || null;
      },

      // Line query helpers (compatibility for modules that used window.UNIFIED_LINES)
      getLines: function() { return window.UNIFIED_LINES || {}; },
      getAllLineIds: function() { return window.UNIFIED_LINES ? Object.keys(window.UNIFIED_LINES) : []; },
      hasLine: function(id) { return !!(window.UNIFIED_LINES && window.UNIFIED_LINES[id]); },
      getLineDurations: function(id) {
        var l = window.UNIFIED_LINES ? window.UNIFIED_LINES[id] : null;
        return l ? (l.durations || []) : [];
      },
      getLineTransferStations: function(id) {
        var l = window.UNIFIED_LINES ? window.UNIFIED_LINES[id] : null;
        return l ? (l.transferStations || []) : [];
      },
      getLineOrder: function(id) { return window.LINE_STATION_ORDER ? window.LINE_STATION_ORDER[id] : null; },

      // Schema info
      getSchema: function() {
        return {
          lineCount: Object.keys(data.lines).length,
          stationCount: Object.keys(data.stations).length,
          stationLineCount: Object.keys(window.STATION_LINES).length,
          nameMapCount: Object.keys(data.name_map).length
        };
      }
    };
  }
function load() {
    if (loaded) return Promise.resolve();

    // Strategy A: if file:// protocol, skip fetch (CORS blocks it) and use script-based data directly.
    // Strategy B: if http/https, try fetch first, fall back to script data on failure.
    var isFileProtocol = (window.location.protocol === 'file:');

    if (isFileProtocol) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '../data/core/railway_data.json', false);
      if (window.RAILWAY_DATA && window.RAILWAY_DATA.stations) { applyData(window.RAILWAY_DATA); loaded = true; return Promise.resolve(); }
      error = new Error("No data source available under file:// protocol");
      console.error("[DbLoader] Failed to load data under file:// protocol");
      return Promise.reject(error);
    }

    // HTTP/HTTPS: try fetch first
    return Promise.all([
      fetch(DATA_FILE).then(function(res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      }),
      fetch(STATION_I18N_FILE).then(function(res) {
        if (!res.ok) return {};
        return res.json();
      }),
      fetch(TOURISM_DATA_FILE).then(function(res) {
        if (!res.ok) return {};
        return res.json();
      }).catch(function() { return {}; })
    ])
      .then(function(results) {
        applyData(results[0], results[1]);
        // Merge tourism data override (tourism_data.json takes precedence)
        // New format: { spots: [...], station_coords: { ... } } - global spots pool
        var tourismOverride = results[2] || {};
        if (tourismOverride.spots && Array.isArray(tourismOverride.spots)) {
          window.TOURISM_SPOTS = tourismOverride.spots;
        }
        if (tourismOverride.station_coords && typeof tourismOverride.station_coords === 'object') {
          Object.keys(tourismOverride.station_coords).forEach(function(stationKey) {
            var coord = tourismOverride.station_coords[stationKey];
            if (coord && coord.length === 2) {
              window.STATION_COORDS[stationKey] = coord;
            }
          });
        }
        // Backward compat: old station-grouped format
        Object.keys(tourismOverride).forEach(function(key) {
          if (key === 'spots' || key === 'station_coords') return;
          var st = tourismOverride[key];
          if (st && st.coord && st.coord.length === 2) {
            window.STATION_COORDS[key] = st.coord;
          }
        });
        // Load station exits (only exits that actually exist at each station)
        if (tourismOverride.station_exits && typeof tourismOverride.station_exits === 'object') {
          window.STATION_EXITS = tourismOverride.station_exits;
        } else {
          window.STATION_EXITS = {};
        }
        window.TOURISM_DATA = {};
        window.TOURISM_STATIONS = [];
        loaded = true;
        console.log(
          Object.keys(results[0].stations).length + " stations, " +
          Object.keys(results[0].lines).length + " lines, " +
          Object.keys(results[0].tourism).length + " tourism stations");
      })
      .catch(function(err) {
        // Fallback to railway-data.js removed: the file does not exist in data/core
        // (canonical data lives in railway_data.json, per AGENTS.md Three-Layer rule).
        error = err;
        console.error("[DbLoader] Failed to load:", err.message);
        throw err;
      });
  }

  window.DataLoader = {
    load: load,
    isLoaded: function() { return loaded; },
    getError: function() { return error; }
  };

  // Expose RT cache helpers
  window.RailwayRTC = {
    savePositions: function(positions) { return window.RTCache.savePositions(positions); },
    saveDelayInfo: function(delayInfo) { return window.RTCache.saveDelayInfo(delayInfo); },
    loadPositions: function() { return window.RTCache.loadPositions(); },
    loadDelayInfo: function() { return window.RTCache.loadDelayInfo(); }
  };

  // Auto-load on DOM ready, deferring one tick to let synchronous scripts finish.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function() { setTimeout(load, 0); });
  } else {
    setTimeout(load, 0);
  }

  // ========== Unhandled Promise Rejection Listener ==========
  // Catches any ODPT fetch or async errors that escape internal catch blocks
  window.addEventListener('unhandledrejection', function(event) {
    console.warn('[PixelTetsudo] Unhandled promise rejection:', event.reason ? event.reason.message || event.reason : event.reason);
    event.preventDefault();
  });
})();




