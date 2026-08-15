/**
 * Pixel Tetsudo - Unified ODPT API Client & Realtime Module
 * 整合：加密密钥管理、API客户端、缓存、数据转换、运行状态显示
 * 密钥存储在浏览器本地
 */
(function() {
    'use strict';

    // ========== 密钥管理 ==========
    function parseKeys(encoded) {
        if (!encoded) return { CENTER: '', CHALLENGE: '' };
        try {
            var decoded = encoded;
            try { decoded = atob(encoded); } catch(e) { /* plain text */ }
            var keys = { CENTER: '', CHALLENGE: '' };
            decoded.split('|').forEach(function(pair) {
                var idx = pair.indexOf(':');
                if (idx > 0) {
                    var name = pair.substring(0, idx).trim();
                    var value = pair.substring(idx + 1).trim();
                    if (name === 'ODPT_CENTER') keys.CENTER = value;
                    if (name === 'CHALLENGE_2026') keys.CHALLENGE = value;
                }
            });
            return keys;
        } catch (e) { return { CENTER: '', CHALLENGE: '' }; }
    }

  // ========== Request deduplication ==========
  var _inFlight = {};
  function dedup(key, fn) {
    if (_inFlight[key]) return _inFlight[key];
    var p = fn().finally(function() { delete _inFlight[key]; });
    _inFlight[key] = p;
    return p;
  }

  // ========== Cache-aware fetch wrapper ==========
  function cacheFetch(cacheKey, url, opts) {
    if (window.DataLayer && window.DataLayer.isCacheValid(cacheKey)) {
      return Promise.resolve(window.DataLayer.cache[cacheKey]);
    }
    return fetch(url, opts).then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function(data) {
      if (window.DataLayer) window.DataLayer.setCache(cacheKey, data);
      return data;
    }).catch(function(err) {
      console.warn('[ODPT] Fetch failed:', err.message);
      if (window.DataLayer && window.DataLayer.isCacheValid(cacheKey)) {
        console.warn('[ODPT] Using cached fallback');
        return window.DataLayer.cache[cacheKey];
      }
      throw err;
    });
  }

    function xorEncrypt(text, key) {
        var result = '';
        for (var i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return btoa(result);
    }

    function xorDecrypt(encoded, key) {
        try {
            var binary = atob(encoded);
            var result = '';
            for (var i = 0; i < binary.length; i++) {
                result += String.fromCharCode(binary.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return result;
        } catch (e) { return ''; }
    }

    // "pixel-tetsudo-v3" removed

    // AES-GCM encryption via Web Crypto API (stronger than XOR)
    var _PBKDF_SALT = 'pixel-tetsudo-v3';

    async function _deriveKey(password) {
        var enc = new TextEncoder();
        var pwdBuf = enc.encode(password);
        var saltBuf = enc.encode(_PBKDF_SALT);
        var keyMaterial = await crypto.subtle.importKey('raw', pwdBuf, 'PBKDF2', false, ['deriveKey']);
        return crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: saltBuf, iterations: 100000, hash: 'SHA-256' },
            keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
        );
    }

    async function cryptoEncrypt(text, password) {
        var key = await _deriveKey(password);
        var enc = new TextEncoder();
        var iv = crypto.getRandomValues(new Uint8Array(12));
        var ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(text));
        var ctArr = new Uint8Array(ct);
        var result = new Uint8Array(iv.length + ctArr.length);
        result.set(iv);
        result.set(ctArr, iv.length);
        return btoa(String.fromCharCode.apply(null, result));
    }

    async function cryptoDecrypt(encoded, password) {
        try {
            var binary = atob(encoded);
            var bytes = new Uint8Array(binary.length);
            for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            var iv = bytes.slice(0, 12);
            var ct = bytes.slice(12);
            var key = await _deriveKey(password);
            var pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct);
            return new TextDecoder().decode(pt);
        } catch (e) { return ''; }
    }

    async function loadKeys() {
        var stored = localStorage.getItem('odpt_keys_enc');
        if (!stored) return null;
        // Try AES-GCM first (new format)
        try {
            var decrypted = await cryptoDecrypt(stored, "pixel-tetsudo-enc-key-v3");
            if (decrypted && decrypted.indexOf('ODPT_CENTER:') === 0) {
                return decrypted;
            }
        } catch(e) {}
        // Fallback to XOR (legacy format)
        try {
            var plain = xorDecrypt(stored, "pixel-tetsudo-enc-key-v3");
            if (plain && plain.indexOf('ODPT_CENTER:') === 0) {
                return plain;
            }
        } catch(e) {}
        return null;
    }

    async function saveKeys(centerKey, challengeKey) {
        var plain = 'ODPT_CENTER:' + centerKey + '|CHALLENGE_2026:' + challengeKey;
        try {
            var encrypted = await cryptoEncrypt(plain, "pixel-tetsudo-enc-key-v3");
            localStorage.setItem('odpt_keys_enc', encrypted);
            localStorage.removeItem('odpt_keys_b64');
        } catch(e) { console.error('[ODPT] Save keys error:', e.message); }
    }
    // ========== API Configuration ==========
    window.ODPT_CONFIG = {
        keys: { CENTER: "", CHALLENGE: "" },

        endpoints: { CHALLENGE_BASE_URL: 'https://api-challenge.odpt.org/api/v4', CENTER_BASE_URL: 'https://api.odpt.org/api/v4' },

        operators: {
            CHALLENGE: {
                'JR-East': 'JR-East', 'Tobu': 'Tobu', 'Keio': 'Keio',
                'Keikyu': 'Keikyu', 'Sotetsu': 'Sotetsu', 'Tokyu': 'Tokyu',
                'Seibu': 'Seibu', 'Odakyu': 'Odakyu'
            },
            CENTER: {
                'TokyoMetro': 'TokyoMetro', 'Toei': 'Toei',
                'YokohamaMunicipal': 'YokohamaMunicipal', 'TWR': 'TWR',
                'MIR': 'MIR', 'TamaMonorail': 'TamaMonorail',
                'Yurikamome': 'Yurikamome', 'Keisei': 'Keisei', 'MinatoMirai': 'MinatoMirai'
            }
        },

        lineToOperator: {
            'Yamanote': 'JR-East', 'KeihinTohoku': 'JR-East', 'Yokosuka': 'JR-East',
            'ChuoRapid': 'JR-East', 'Saikyo': 'JR-East', 'Joban': 'JR-East',
            'SobuLocal': 'JR-East', 'Keiyo': 'JR-East', 'Musashino': 'JR-East',
            'ShonanShinjuku': 'JR-East', 'Takasaki': 'JR-East', 'Tsurumi': 'JR-East',
            'Nambu': 'JR-East', 'Tokaido': 'JR-East', 'JobanLocal': 'JR-East',
            'Ginza': 'TokyoMetro', 'Marunouchi': 'TokyoMetro', 'MarunouchiBranch': 'TokyoMetro',
            'Hibiya': 'TokyoMetro', 'Tozai': 'TokyoMetro', 'Chiyoda': 'TokyoMetro',
            'Yurakucho': 'TokyoMetro', 'Hanzomon': 'TokyoMetro', 'Namboku': 'TokyoMetro',
            'Mita': 'TokyoMetro', 'Asakusa': 'Toei', 'Shinjuku': 'Toei', 'Oedo': 'Toei',
            'Blue': 'YokohamaMunicipal', 'Orange': 'YokohamaMunicipal',
            'Rinko': 'TWR', 'TamaMonorail': 'TamaMonorail', 'HitachiNakaKaimin': 'MIR',
            'KeioLine': 'Keio', 'KeikyuMain': 'Keikyu', 'SotetsuMain': 'Sotetsu',
            'TokyuToyoko': 'Tokyu', 'TokyuDenEn': 'Tokyu', 'TokyuTohtoku': 'Tokyu',
            'TokyuOimachi': 'Tokyu', 'TokyuSetagaya': 'Tokyu',
            'SeibuIkebukuro': 'Seibu', 'SeibuChichibu': 'Seibu', 'SeibuTamako': 'Seibu',
            'SeibuTamagawa': 'Seibu', 'OdakyuEnoshima': 'Odakyu', 'OdakyuOdawara': 'Odakyu',
            'TobuSkyTree': 'Tobu', 'TobuNikko': 'Tobu', 'TobuNoda': 'Tobu',
            'Keisei': 'Keisei', 'Yurikamome': 'Yurikamome',
            'Fukutoshin': 'TokyoMetro', 'Ome': 'JR-East', 'Itsukaichi': 'JR-East',
            'Keikyu': 'Keikyu', 'Keio': 'Keio',
            'Odawara': 'Odakyu', 'SeibuShinjuku': 'Seibu', 'SeibuYamaguchi': 'Seibu',
            'SeibuNakagawa': 'Seibu', 'SeibuEn': 'Seibu', 'TobuIsesaki': 'Tobu',
            'YokohamaBlue': 'YokohamaMunicipal', 'MinatoMirai': 'MinatoMirai',
            'TobuSkytree': 'Tobu'
        },

        setKeys: async function(c, ch) {
            this.keys.CENTER = c;
            this.keys.CHALLENGE = ch;
            await await saveKeys(c, ch);
        },

        getKey: function(type) {
            return type === 'center' ? this.keys.CENTER : this.keys.CHALLENGE;
        },

        isConfigured: function() {
            return !!(this.keys.CENTER && this.keys.CHALLENGE);
        }
    };

    // ========== Load saved keys ==========
    (function() {
        var saved = loadKeys();
        if (saved && typeof saved.then === 'function') {
            saved.then(function(decrypted) {
                if (decrypted) {
                    var parsed = parseKeys(decrypted);
                    ODPT_CONFIG.keys.CENTER = parsed.CENTER;
                    ODPT_CONFIG.keys.CHALLENGE = parsed.CHALLENGE;
                    if (parsed.CENTER || parsed.CHALLENGE) {
                        console.log('[ODPT] Keys loaded from storage');
                    }
                        initODPT().catch(function(e) { console.warn("[ODPT] initODPT error:", e.message); });
                }
            }).catch(function(e) { console.warn('[ODPT] Key load error:', e.message); });
        } else if (saved) {
            var parsed = parseKeys(saved);
            ODPT_CONFIG.keys.CENTER = parsed.CENTER;
            ODPT_CONFIG.keys.CHALLENGE = parsed.CHALLENGE;
            if (parsed.CENTER || parsed.CHALLENGE) {
                console.log('[ODPT] Keys loaded from storage');
            }
                        initODPT().catch(function(e) { console.warn("[ODPT] initODPT error:", e.message); });
        }
    })();

    // ========== API 客户端 ==========
    var CHALLENGE_BASE_URL = window.ODPT_CONFIG.endpoints.CHALLENGE_BASE_URL;
    var CENTER_BASE_URL = window.ODPT_CONFIG.endpoints.CENTER_BASE_URL;
    var CHALLENGE_OPERATORS = window.ODPT_CONFIG.operators.CHALLENGE;
    var CENTER_OPERATORS = window.ODPT_CONFIG.operators.CENTER;

    function getChallengeKey() {
        return window.ODPT_CONFIG.keys.CHALLENGE || '';
    }

    function getCenterKey() {
        return window.ODPT_CONFIG.keys.CENTER || '';
    }

    async function fetchFromODPT(baseURL, entity, operator, params) {
        var key = baseURL === CHALLENGE_BASE_URL ? getChallengeKey() : getCenterKey();
        if (!key) {
            console.warn('[ODPTClient] No API key available for ' + entity);
            return null;
        }
        var paramStr = params ? '&' + params : '';
        var cacheKey = 'odpt:' + entity + ':' + (operator || 'all') + ':' + baseURL;
        var url = baseURL + '/odpt:' + entity + '?acl:consumerKey=' + encodeURIComponent(key) + paramStr;
        if (operator) {
            url += '&odpt:operator=odpt.Operator:' + operator;
        }
        return dedup(cacheKey, function() {
            return cacheFetch(cacheKey, url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(30000)
            }).then(function(data) {
                if (!data || !data.value) return { value: [] };
                return data;
            });
        });
    }

    // Challenge API
    async function challengeGetTrains(operator) {
        var data = await fetchFromODPT(CHALLENGE_BASE_URL, 'Train', operator);
        return data && data.value ? data.value : [];
    }
    async function challengeGetStations(operator) {
        var data = await fetchFromODPT(CHALLENGE_BASE_URL, 'Station', operator);
        return data && data.value ? data.value : [];
    }
    async function challengeGetRailways(operator) {
        var data = await fetchFromODPT(CHALLENGE_BASE_URL, 'Railway', operator);
        return data && data.value ? data.value : [];
    }

    // Center API
    async function centerGetTrains(operator) {
        var data = await fetchFromODPT(CENTER_BASE_URL, 'Train', operator);
        return data && data.value ? data.value : [];
    }
    async function centerGetStations(operator) {
        var data = await fetchFromODPT(CENTER_BASE_URL, 'Station', operator);
        return data && data.value ? data.value : [];
    }
    async function centerGetRailways(operator) {
        var data = await fetchFromODPT(CENTER_BASE_URL, 'Railway', operator);
        return data && data.value ? data.value : [];
    }
    async function centerGetTrainInformation(operator) {
        var data = await fetchFromODPT(CENTER_BASE_URL, 'TrainInformation', operator);
        return data && data.value ? data.value : [];
    }

    var GTFS_FEEDS = {
        challenge: {
            'jreast_odpt_train_vehicle': 'jreast_odpt_train_vehicle',
            'tobu_odpt_train_alert': 'tobu_odpt_train_alert',
            'keio_odpt_train_alert': 'keio_odpt_train_alert'
        },
        center: {
            'toei_odpt_train_vehicle': 'toei_odpt_train_vehicle',
            'twr_odpt_train_alert': 'twr_odpt_train_alert',
            'tokyometro_odpt_train_alert': 'tokyometro_odpt_train_alert',
            'tamamonorail_odpt_train_alert': 'tamamonorail_odpt_train_alert',
            'mir_odpt_train_alert': 'mir_odpt_train_alert',
            'YokohamaMunicipalTrain_vehicle': 'YokohamaMunicipalTrain_vehicle'
        }
    };

    window.ODPTClient = {
        challenge: {
            getTrains: challengeGetTrains,
            getStations: challengeGetStations,
            getRailways: challengeGetRailways,
            getTrainInformation: challengeGetTrainInformation,
            OPERATORS: CHALLENGE_OPERATORS
        },
        center: {
            getTrains: centerGetTrains,
            getStations: centerGetStations,
            getRailways: centerGetRailways,
            getTrainInformation: centerGetTrainInformation,
            OPERATORS: CENTER_OPERATORS
        },
        LINE_TO_OPERATOR: window.ODPT_CONFIG.lineToOperator,
        CHALLENGE_BASE_URL: CHALLENGE_BASE_URL,
        CENTER_BASE_URL: CENTER_BASE_URL,
        gtfsRealtime: {
            getChallengeFeed: async function(feedId) {
                try { var r = await fetch(ODPT_CONFIG.endpoints.CHALLENGE_BASE_URL + '/gtfsrt/' + feedId, { headers: { 'Authorization': 'Bearer ' + (ODPT_CONFIG.keys.CHALLENGE || '') } , signal: AbortSignal.timeout(10000)}); if (!r.ok) return null; return await r.arrayBuffer(); } catch(e) { return null; }
            },
            getCenterFeed: async function(feedId) {
                try { var r = await fetch(ODPT_CONFIG.endpoints.CENTER_BASE_URL + '/gtfsrt/' + feedId, { headers: { 'Authorization': 'Bearer ' + (ODPT_CONFIG.keys.CENTER || '') } , signal: AbortSignal.timeout(10000)}); if (!r.ok) return null; return await r.arrayBuffer(); } catch(e) { return null; }
            },
            getAll: async function() {
                var results = [], feeds = [];
                for (var f in GTFS_FEEDS.challenge) feeds.push({s: 'challenge', f: GTFS_FEEDS.challenge[f], n: f});
                for (var f in GTFS_FEEDS.center) feeds.push({s: 'center', f: GTFS_FEEDS.center[f], n: f});
                for (var i = 0; i < feeds.length; i++) {
                    var d = feeds[i].s === 'challenge' ? await this.getChallengeFeed(feeds[i].f) : await this.getCenterFeed(feeds[i].f);
                    if (d) results.push({name: feeds[i].n, data: d});
                }
                return results;
            }
        }
    };

    // ========== 缓存 ==========
    var CACHE_KEY = 'odpt_data_cache';
    var CACHE_TIMESTAMP_KEY = 'odpt_data_cache_timestamp';
    var CACHE_TTL = 3600000;

    async function loadFromCache() {
        try {
            var timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
            if (timestamp && (Date.now() - parseInt(timestamp)) < CACHE_TTL) {
                var cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    console.log('[ODPTCache] Loading from cache');
                    return JSON.parse(cached);
                }
            }
        } catch (e) { console.warn('[ODPTCache] Failed to load cache:', e.message); }
        return null;
    }

    function saveToCache(data) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
            console.log('[ODPTCache] Saved to cache');
        } catch (e) { console.warn('[ODPTCache] Failed to save cache:', e.message); }
    }

    window.ODPT_Cache = {
        loadFromCache: loadFromCache,
        saveToCache: saveToCache,
        getData: function() { return window.ODPT_CACHED_DATA || null; }
    };

    // ========== 数据转换 ==========
    function convertStations(odptStations, lineCode) {
        if (!odptStations || odptStations.length === 0) return [];
        return odptStations.map(function(s) {
            var title = s['odpt:stationTitle'];
            var jaTitle = title && title.ja ? title.ja : s['odpt:stationCode'] || '';
            return {
                name: jaTitle,
                code: s['odpt:stationCode'],
                lat: s['geo:lat'],
                lon: s['geo:long']
            };
        });
    }

    window.ODPT_Transformer = {
        convertStations: convertStations
    };

    // ========== 实时运行状态模块 ==========
    var REFRESH_INTERVAL = 60000;

    function formatTime(minutes) {
        var h = Math.floor(minutes / 60);
        var m = minutes % 60;
        return h + ":" + (m < 10 ? "0" : "") + m;
    }

    function escapeHtml(text) {
        if (!text) return "";
        var div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    function parseODPTDelay(info) {
        if (!info) return null;
        var result = { status: "normal", interval: null, cause: null, maxDelay: 0 };
        var title = info["odpt:informationTitle"] || "";
        var content = info["odpt:informationContent"] || "";
        var text = title + " " + content;
        if (text.indexOf("運休") >= 0) {
            result.status = "suspended";
        } else if (text.indexOf("遅延") >= 0 || text.indexOf("遅れ") >= 0) {
            result.status = "delayed";
        }
        var delayMatch = text.match(/(\d+)\s*(分|min)/i);
        if (delayMatch) result.maxDelay = parseInt(delayMatch[1], 10);
        var intervalMatch = text.match(/([^\s\-]+)\s*[-～至]\s*([^\s\-]+)/);
        if (intervalMatch) result.interval = intervalMatch[1] + "→" + intervalMatch[2];
        if (content) result.cause = content;
        return result;
    }

    function getLineStatus(line, apiDelayInfo) {
        if (apiDelayInfo) return apiDelayInfo.status || "normal";
        if (!line || !window.TRAINS) return "normal";
        var trains = window.TRAINS[line.name] || window.TRAINS[line.id] || [];
        if (!trains || trains.length === 0) return "normal";
        var maxDelay = 0;
        for (var i = 0; i < trains.length; i++) {
            if (trains[i].delay > maxDelay) maxDelay = trains[i].delay;
        }
        if (maxDelay >= 30) return "suspended";
        if (maxDelay > 0) return "delayed";
        return "normal";
    }

    function getMaxDelay(line, apiDelayInfo) {
        if (apiDelayInfo && apiDelayInfo.maxDelay > 0) return apiDelayInfo.maxDelay;
        if (!line || !window.TRAINS) return 0;
        var trains = window.TRAINS[line.name] || window.TRAINS[line.id] || [];
        if (!trains || trains.length === 0) return 0;
        var max = 0;
        for (var i = 0; i < trains.length; i++) {
            if (trains[i].delay > max) max = trains[i].delay;
        }
        return max;
    }

    function getDelayInterval(line, apiDelayInfo) {
        if (apiDelayInfo && apiDelayInfo.interval) return apiDelayInfo.interval;
        if (!line.delayInfo || !line.delayInfo.interval) return null;
        return line.delayInfo.interval;
    }

    function getDelayCause(line, apiDelayInfo) {
        if (apiDelayInfo && apiDelayInfo.cause) return apiDelayInfo.cause;
        if (line.delayInfo && line.delayInfo.cause) return line.delayInfo.cause;
        var maxDelay = getMaxDelay(line, apiDelayInfo);
        if (maxDelay >= 20) return "重大延误";
        if (maxDelay > 0) return "运营调整";
        return null;
    }

    function getApiDelayInfo(line) {
        if (!window.ODPT_DELAY_DATA) return null;
        var op = window.ODPT_CONFIG.lineToOperator[line.id] || window.ODPT_CONFIG.lineToOperator[line.name];
        if (!op) return null;
        var data = window.ODPT_DELAY_DATA[op];
        if (!data) return null;
        return parseODPTDelay(data);
    }

    async function challengeGetTrainInformation(operator) {
        var data = await fetchFromODPT(CHALLENGE_BASE_URL, 'TrainInformation', operator);
        return data && data.value ? data.value : [];
    }

    async function loadODPTDelayData() {
        if (!window.ODPTClient) return;
        if (!ODPT_CONFIG.keys.CENTER && !ODPT_CONFIG.keys.CHALLENGE) return;
        window.ODPT_DELAY_DATA = {};
        // Query both Center and Challenge APIs
        var allOps = {};
        for (var op in window.ODPTClient.center.OPERATORS) allOps[op] = 'center';
        for (var op in window.ODPTClient.challenge.OPERATORS) allOps[op] = 'challenge';
        for (var op in allOps) {
            var client = allOps[op] === 'challenge' ? window.ODPTClient.challenge : window.ODPTClient.center;
            try {
                var infos = await client.getTrainInformation(op);
                if (infos && infos.length > 0) {
                    window.ODPT_DELAY_DATA[op] = infos[0];
                }
            } catch (e) {
                console.warn('[Realtime] Failed to load delay data for ' + op + ':', e.message);
            }
        }
        console.log('[Realtime] Loaded ODPT delay data for:', Object.keys(window.ODPT_DELAY_DATA).length, 'operators');
    }

    function getStatusIcon(status) {
        var cls = status === "suspended" ? "rs-status-icon-suspended" : (status === "delayed" ? "rs-status-icon-delayed" : "rs-status-icon-normal");
        var icon = status === "suspended" ? "⊗" : (status === "delayed" ? "△" : "○");
        return '<span class="rs-status-icon ' + cls + '">' + icon + '</span>';
    }

    function groupByOperator(linesData) {
        var groups = {};
        Object.keys(linesData).forEach(function(id) {
            var line = linesData[id];
            var op = line.operator || "其他";
            if (!groups[op]) groups[op] = [];
            groups[op].push({id: id, line: line});
        });
        return groups;
    }

    function renderCard(line, lineId) {
        var apiInfo = getApiDelayInfo(line);
        var status = getLineStatus(line, apiInfo);
        var maxDelay = getMaxDelay(line, apiInfo);
        var interval = getDelayInterval(line, apiInfo);
        var intervalText = interval || line.interval || "";
        var iconHtml = line.image ? '<img class="rs-line-icon" src="' + escapeHtml(line.image) + '" alt="">' : '<div class="rs-code-badge">' + escapeHtml(line.code) + '</div>';
        return '<div class="rs-line-card" data-line="' + escapeHtml(lineId) + '"><div class="rs-line-header">'
            + iconHtml
            + '<div class="rs-line-info"><div class="rs-line-name">' + escapeHtml(line.name) + '</div>'
            + '<div class="rs-line-interval">' + escapeHtml(intervalText) + '</div></div>'
            + getStatusIcon(status) + '</div></div>';
    }

    function render(container, linesData) {
        if (!container || !linesData) return;
        var groups = groupByOperator(linesData);
        var html = "";
        Object.keys(groups).sort().forEach(function(op) {
            html += '<div class="rs-operator-group"><div class="rs-operator-title">' + escapeHtml(op) + '</div>'
                + '<div class="rs-cards-container">';
            groups[op].forEach(function(item) {
                html += renderCard(item.line, item.id);
            });
            html += '</div></div>';
        });
        container.innerHTML = html;
    }

    function openModal(lineId, linesData) {
        var modal = document.getElementById("lineDetailModal");
        if (!modal || !linesData) return;
        var line = linesData[lineId];
        if (!line) return;

        var apiInfo = getApiDelayInfo(line);
        var status = getLineStatus(line, apiInfo);
        var maxDelay = getMaxDelay(line, apiInfo);
        var interval = getDelayInterval(line, apiInfo);
        var cause = getDelayCause(line, apiInfo);

        var statusText = window.t ? (status === "suspended" ? window.t("status.suspended") : (status === "delayed" ? window.t("status.delayed") : window.t("status.normal"))) : (status === "suspended" ? "运休" : (status === "delayed" ? "延误" : "正常"));
        var statusClass = status === "suspended" ? "rs-status-suspended" : (status === "delayed" ? "rs-status-delayed" : "rs-status-normal");

        var body = modal.querySelector(".rs-modal-body");
        var title = modal.querySelector(".rs-modal-title");
        title.textContent = line.name;

        var html = "";

        // 1. 运行状态
        html += '<div class="rs-status-section ' + statusClass + '"><span class="rs-status-indicator"><span style="background:var(--' + (status === "suspended" ? "red" : (status === "delayed" ? "orange" : "green")) + ')"></span>' + statusText + '</span>';
        if (maxDelay > 0) html += '<span class="rs-delay-badge">最大延误 +' + maxDelay + '分</span>';
        html += '</div>';

        // 2. 区间信息 - 始终显示
        html += '<div class="rs-interval-section"><div class="rs-interval-header">区间信息</div><div class="rs-interval-stations">';
        if (!interval || status === "normal") {
            html += '<span class="rs-station-text">全线正常运行</span>';
        } else {
            var parts = interval.split("→");
            if (parts.length >= 2) {
                html += '<span class="rs-station-start">' + escapeHtml(parts[0]) + '</span>';
                html += '<span class="rs-interval-arrow">→</span>';
                html += '<span class="rs-station-end">' + escapeHtml(parts[1]) + '</span>';
            } else {
                html += '<span class="rs-station-text">' + escapeHtml(interval) + '</span>';
            }
        }
        html += '</div></div>';

        // 3. 原因 - 始终显示
        html += '<div class="rs-cause-section"><div class="rs-section-title">原因</div><div class="rs-cause-text">';
        if (cause && status !== "normal") {
            html += escapeHtml(cause);
        } else {
            html += '<span class="rs-normal-cause">无</span>';
        }
        html += '</div></div>';

        body.innerHTML = html;
        modal.classList.add("active");
        document.body.classList.add("modal-open");
    }

    function closeModal() {
        var modal = document.getElementById("lineDetailModal");
        if (!modal) return;
        modal.classList.remove("active");
        document.body.classList.remove("modal-open");
    }

    async function refreshData() {
        if (ODPT_CONFIG.keys.CENTER || ODPT_CONFIG.keys.CHALLENGE) {
            await loadODPTDelayData();
        } else {
            console.warn("[ODPT] No API keys, skipping remote data");
        }
        var container = document.getElementById("realtimeStatusContainer");
        if (container && window.UNIFIED_LINES) {
            render(container, window.UNIFIED_LINES);
        }
    }

    async function init() {
        var container = document.getElementById("realtimeStatusContainer");
        if (!container) return;

        await loadODPTDelayData();

        if (!window.UNIFIED_LINES || Object.keys(window.UNIFIED_LINES).length === 0) {
            container.innerHTML = '<div class="rs-error">无法加载线路数据</div>';
            return;
        }

        render(container, window.UNIFIED_LINES);
        container.addEventListener("click", function(e) {
            var card = e.target.closest(".rs-line-card");
            if (card) openModal(card.dataset.line, window.UNIFIED_LINES);
        });

        var modal = document.getElementById("lineDetailModal");
        if (modal) {
            modal.querySelector(".rs-modal-close").addEventListener("click", closeModal);
            modal.addEventListener("click", function(e) {
                if (e.target === modal) closeModal();
            });
            document.addEventListener("keydown", function(e) {
                if (e.key === "Escape") closeModal();
            });
        }

        if (typeof window.onLanguageChange === "function") {
            window.onLanguageChange(function() {
                var container = document.getElementById("realtimeStatusContainer");
                if (container && window.UNIFIED_LINES) {
                    render(container, window.UNIFIED_LINES);
                }
            });
        }

    }

    window.RealtimeModule = {
        refresh: refreshData,
        loadODPT: loadODPTDelayData
    };

        // Start ODPT polling + DataFusion push after initial load
    initODPT().catch(function(e) { console.warn("[ODPT] initODPT error:", e.message); });

    if (!window.DataFusion && document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else if (!window.DataFusion) {
        init();
    }

    async function initODPT() {
        if (!ODPT_CONFIG.keys.CENTER && !ODPT_CONFIG.keys.CHALLENGE) {
            console.warn('[ODPT] No API keys configured, skipping ODPT data load');
            return;
        }
        await refreshODPTData();
        setInterval(function() { refreshODPTData().catch(function(){}); }, 30000);
        console.log('[ODPT] Client initialized');
    }

    async function refreshODPTData() {
        await loadODPTDelayData();
        // Sync ODPT delay data to DataFusion internal store
        if (window.DataFusion && window.DataFusion.updateOdptData) {
            window.DataFusion.updateOdptData(window.ODPT_DELAY_DATA);
        }
        if (window.DataFusion && window.DataFusion.refresh) {
            try { await window.DataFusion.refresh(); }
            catch(e) { console.warn('[ODPT] DataFusion refresh error:', e.message); }
        }
    }

    console.log('[ODPT] Unified client initialized');
})();
