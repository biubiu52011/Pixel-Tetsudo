/**
 * Pixel Tetsudo - Unified ODPT API Client & Realtime Module
 * 整合：加密密钥管理、API客户端、缓存、数据转换、运行状态显示
 * 密钥已加密存储，不暴露明文
 */
(function() {
    'use strict';

    // ========== 加密/解密 ==========
    var ENCRYPTION_KEY = 'PixelTetsudo2026';
    var ENCRYPTED_KEYS = 'BFkqNDoSXDAhIFE6YGZ7ADEHLgkNOSANKhgMAn13A1gzWwhUDQwvQBYiE15XdHBOHgc2FQ0+LwQ9HwAGV10DTx89NlMIOQYDETEDWlBKVlw0LRASIWYJQhExDAJrZHBEHQMQFgk6HTAgMCIiZnVkeQJZLgMhPiQNPR8UAVd4XkAJEyEcNhwkQRIhPgd8d2cGCQQQHCMAP0cQIioEfWd4WzITHBUiA11EKTE1F393XkUKLSIVNWZUGT4xB1pXXWQEMwQAFyEcNwUXHyVfaHdeQw==';

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

    // ========== 密钥管理 ==========
    function parseKeys(encoded) {
        if (!encoded) return { CENTER: '', CHALLENGE: '' };
        try {
            var decoded = atob(encoded);
            var keys = { CENTER: '', CHALLENGE: '' };
            var parts = decoded.split('|');
            parts.forEach(function(pair) {
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

    function loadKeys() {
        var stored = localStorage.getItem('odpt_keys_b64');
        if (stored) return stored;
        if (ENCRYPTED_KEYS) {
            var decrypted = xorDecrypt(ENCRYPTED_KEYS, ENCRYPTION_KEY);
            if (decrypted && decrypted.indexOf(':') > 0) return decrypted;
        }
        return null;
    }

    function saveKeys(centerKey, challengeKey) {
        var encoded = btoa('ODPT_CENTER:' + centerKey + '|CHALLENGE_2026:' + challengeKey);
        localStorage.setItem('odpt_keys_b64', encoded);
        return encoded;
    }

    // ========== API 配置 ==========
    window.ODPT_CONFIG = {
        keys: parseKeys(loadKeys()),

        endpoints: {
            CHALLENGE_BASE_URL: 'https://api-challenge.odpt.org/api/v4',
            CENTER_BASE_URL: 'https://api.odpt.org/api/v4'
        },

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
                'Yurikamome': 'Yurikamome', 'Keisei': 'Keisei'
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
            'Keisei': 'Keisei', 'Yurikamome': 'Yurikamome'
        },

        setKeys: function(c, ch) {
            this.keys.CENTER = c;
            this.keys.CHALLENGE = ch;
            saveKeys(c, ch);
        },

        getKey: function(type) {
            return type === 'center' ? this.keys.CENTER : this.keys.CHALLENGE;
        },

        isConfigured: function() {
            return !!(this.keys.CENTER && this.keys.CHALLENGE);
        }
    };

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
        var url = baseURL + '/odpt:' + entity + '?acl:consumerKey=' + encodeURIComponent(key) + paramStr;
        if (operator) {
            url += '&odpt:operator=odpt.Operator:' + operator;
        }
        try {
            var resp = await fetch(url, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(30000)
            });
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            var text = await resp.text();
            if (!text || text.trim() === '') return { value: [] };
            return JSON.parse(text);
        } catch (e) {
            console.warn('[ODPTClient] Fetch failed for ' + entity + '/' + (operator || 'all') + ':', e.message);
            return null;
        }
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

    window.ODPTClient = {
        challenge: {
            getTrains: challengeGetTrains,
            getStations: challengeGetStations,
            getRailways: challengeGetRailways,
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
        CENTER_BASE_URL: CENTER_BASE_URL
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

    async function loadODPTDelayData() {
        if (!window.ODPTClient) return;
        window.ODPT_DELAY_DATA = {};
        for (var op in window.ODPTClient.center.OPERATORS) {
            try {
                var infos = await window.ODPTClient.center.getTrainInformation(op);
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
        var iconHtml = line.image ? '<img class="rs-line-icon" src="' + line.image + '" alt="">' : '<div class="rs-code-badge">' + escapeHtml(line.code) + '</div>';
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
        await loadODPTDelayData();
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

        setInterval(refreshData, REFRESH_INTERVAL);
        console.log("[Realtime] Initialized with ODPT integration");
    }

    window.RealtimeModule = {
        refresh: refreshData,
        loadODPT: loadODPTDelayData
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    console.log('[ODPT] Unified client initialized with encrypted keys');
})();
