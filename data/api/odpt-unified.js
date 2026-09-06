/**
 * Pixel Tetsudo - Unified ODPT API Client
 * 完整 API URL（含 key）直接存储，无需分离管理。
 * 
 * 三种API类型：
 * - trainInformation: 运行情报/延误信息 (odpt:TrainInformation)
 * - train: 列车位置实时数据 (odpt:Train)
 * - trainTimetable: 列车时刻表 (odpt:TrainTimetable)
 */
(function() {
    'use strict';

    // ========== ODPT API 链接库（完整链接，编码存储） ==========
    // 所有 API 以完整链接存于 data/api/odpt-links.js（window.ODPT_LINKS_ENC）
    // 库文件经 XOR(派生种子)+Base64 编码，避免 key 明文暴露于公开仓库
    var _linksCache = null;
    // 派生混淆种子（不明文存放完整种子）
    function _apiSeed() {
        var a = "PixelTetsudo".split('').reverse().join('');
        var b = "ODPT".split('').reverse().join('');
        return a + "-" + b + "-2026";
    }
    function _b64decode(s) {
        try {
            if (typeof atob === 'function') return atob(s);
            if (typeof Buffer !== 'undefined' && Buffer.from) {
                return Buffer.from(s, 'base64').toString('utf8');
            }
        } catch (e) {}
        return null;
    }
    function _xorDecode(data, seed) {
        var out = '';
        var sl = seed.length;
        for (var i = 0; i < data.length; i++) {
            out += String.fromCharCode(data.charCodeAt(i) ^ seed.charCodeAt(i % sl));
        }
        return out;
    }
    // 解码并缓存链接库
    function getApiLinks() {
        if (_linksCache) return _linksCache;
        try {
            var enc = (typeof window !== 'undefined' && window.ODPT_LINKS_ENC) ? window.ODPT_LINKS_ENC : '';
            if (!enc) { _linksCache = []; return _linksCache; }
            var json = _xorDecode(_b64decode(enc), _apiSeed());
            _linksCache = JSON.parse(json) || [];
        } catch (e) {
            console.warn('[ODPT] API link library decode failed:', e.message);
            _linksCache = [];
        }
        return _linksCache;
    }
    // 从链接库解析指定域名的 key（仅用于动态拼接场景）
    function getApiKey(base) {
        try {
            var links = getApiLinks();
            var baseHost = base.indexOf('api-challenge') >= 0 ? 'api-challenge.odpt.org' : 'api.odpt.org';
            for (var i = 0; i < links.length; i++) {
                var url = links[i] || '';
                if (url.indexOf(baseHost) < 0) continue;
                var m = url.match(/acl:consumerKey=([^&\s]+)/);
                if (m && m[1]) return m[1];
            }
        } catch (e) {}
        return null;
    }
    // 链接库可用即视为已配置（库为内置，恒为 true）
    function keysConfigured() {
        return getApiLinks().length > 0;
    }

    // ========== 完整 API URL（按运营商和类型区分） ==========
    var ODPT_ENDPOINTS = {
        // ===== Challenge API 运营商 =====
        "JR-East": {
            base: "https://api-challenge.odpt.org/api/v4/",
            train: "odpt:Train?odpt:operator=odpt.Operator:JR-East",
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:JR-East",
            trainInformation: null  // JR东日本不提供运行情报API
        },
        "Tobu": {
            base: "https://api-challenge.odpt.org/api/v4/",
            train: "odpt:Train?odpt:operator=odpt.Operator:Tobu",
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:Tobu",
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:Tobu"
        },
        "Keio": {
            base: "https://api-challenge.odpt.org/api/v4/",
            train: null,  // 京王不提供列车位置API
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:Keio",
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:Keio"
        },
        "Keikyu": {
            base: "https://api-challenge.odpt.org/api/v4/",
            train: "odpt:Train?odpt:operator=odpt.Operator:Keikyu",
            trainTimetable: null,  // 京急不提供列车时刻表API
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:Keikyu"
        },
        "Sotetsu": {
            base: "https://api-challenge.odpt.org/api/v4/",
            train: null,  // 相铁不提供列车位置API
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:Sotetsu",
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:Sotetsu"
        },
        "Tokyu": {
            base: "https://api-challenge.odpt.org/api/v4/",
            train: null,  // 东急不提供列车位置API
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:Tokyu",
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:Tokyu"
        },
        "Seibu": {
            base: "https://api-challenge.odpt.org/api/v4/",
            train: null,  // 西武不提供列车位置API
            trainTimetable: null,  // 西武不提供列车时刻表API
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:Seibu"
        },
        "Odakyu": {
            base: "https://api-challenge.odpt.org/api/v4/",
            train: null,
            trainTimetable: null,
            trainInformation: null  // 小田急不提供这三种API
        },

        // ===== Center API 运营商 =====
        "TokyoMetro": {
            base: "https://api.odpt.org/api/v4/",
            train: null,  // 东京地铁不提供列车位置API
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:TokyoMetro",
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:TokyoMetro"
        },
        "Toei": {
            base: "https://api.odpt.org/api/v4/",
            train: null,
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:Toei",
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:Toei"
        },
        "YokohamaMunicipal": {
            base: "https://api.odpt.org/api/v4/",
            train: null,
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:YokohamaMunicipal",
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:YokohamaMunicipal"
        },
        "TWR": {
            base: "https://api.odpt.org/api/v4/",
            train: null,
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:TWR",
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:TWR"
        },
        "MIR": {
            base: "https://api.odpt.org/api/v4/",
            train: null,
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:MIR",
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:MIR"
        },
        "TamaMonorail": {
            base: "https://api.odpt.org/api/v4/",
            train: null,
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:TamaMonorail",
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:TamaMonorail"
        },
        "Yurikamome": {
            base: "https://api.odpt.org/api/v4/",
            train: null,
            trainTimetable: null,  // 百合鸥不提供列车时刻表API
            trainInformation: null  // 百合鸥不提供运行情报API
        },
        "Keisei": {
            base: "https://api-challenge.odpt.org/api/v4/",
            train: "odpt:Train?odpt:operator=odpt.Operator:Keisei",
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:Keisei",
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:Keisei"
        },
        "TokyoMonorail": {
            base: "https://api-challenge.odpt.org/api/v4/",
            train: null,  // 东京单轨不提供列车位置API
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:TokyoMonorail",
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:TokyoMonorail"
        },
        "MinatoMirai": {
            base: "https://api.odpt.org/api/v4/",
            train: null,
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:MinatoMirai",
            trainInformation: null  // 港未来线不提供运行情报API
        }
    };

    // 构建完整URL
    function buildUrl(operator, type) {
        var ep = ODPT_ENDPOINTS[operator];
        if (!ep || !ep[type]) return null;
        // 优先从链接库匹配完整URL（库中含 acl:consumerKey）
        var links = getApiLinks();
        for (var i = 0; i < links.length; i++) {
            var url = links[i] || '';
            if (url.indexOf(ep.base) === 0 && url.indexOf(ep[type]) >= 0) return url;
        }
        // 回退：用库中解析的 key 动态拼接（如按线路时刻表等动态参数场景）
        var key = getApiKey(ep.base);
        if (!key) {
            console.warn("[ODPT] No API link for " + operator + "/" + type);
            return null;
        }
        return ep.base + ep[type] + "&acl:consumerKey=" + key;
    }

    // ========== 线路 -> 运营商映射 ==========
    var LINE_TO_OPERATOR = {
        "Agatsuma": "JR-East",
        "Arakawa": "Toei",
        "Asakusa": "Toei",
        "BanetsuEast": "JR-East",
        "BanetsuWest": "JR-East",
        "Chiyoda": "TokyoMetro",

        "ChuoRapid": "JR-East",
        "ChuoSobuLocal": "JR-East",
        "Daishi_Keikyu": "Keikyu",
        "Daishi_Tobu": "Tobu",
        "Do-Arakawa": "Toei",
        "Echigo": "JR-East",
        "Fukutoshin": "TokyoMetro",
        "Ginza": "TokyoMetro",
        "Gono": "JR-East",
        "Hachinohe": "JR-East",
        "Hakushin": "JR-East",
        "Hamura": "Seibu",
        "Hanzomon": "TokyoMetro",
        "Hibiya": "TokyoMetro",
        "HitachiNakaKaimin": "MIR",
        "Iiyama": "JR-East",
        "Ikebukuro": "Seibu",

        "Ishinomaki": "JR-East",
        "Ito": "JR-East",
        "Itsukaichi": "JR-East",
        "JR_Yamaguchi": "JR West",
        "Joban": "JR-East",
        "JobanLocal": "JR-East",
        "Joetsu": "JR-East",
        "Kamaishi": "JR-East",
        "Kamiishi": "JR-East",

        "Karasuyama": "JR-East",
        "Kashima": "JR-East",
        "Kawagoe": "JR-East",
        "KeihinTohoku": "JR-East",
        "Keikyu": "Keikyu",
        "KeikyuAirport": "Keikyu",
        "KeikyuKurihama": "Keikyu",

        "KeikyuZushi": "Keikyu",

        "KeioInokashira": "Keio",
        "KeioKeibajo": "Keio",
        "KeioMain": "Keio",
        "KeioSagami": "Keio",
        "KeioShin": "Keio",
        "KeioTakao": "Keio",
        "KeioZoo": "Keio",
        "Keisei": "Keisei",
        "Keiyo": "JR-East",
        "Kesennuma": "JR-East",
        "Kiryu": "JR-East",
        "Koizumi": "Tobu",
        "Kokubunji": "Seibu",
        "Komii": "JR-East",
        "Kounan": "JR-East",
        "Kururi": "JR-East",
        "Marunouchi": "TokyoMetro",
        "MarunouchiBranch": "TokyoMetro",
        "MinatoMirai": "MinatoMirai",
        "Mita": "Toei",
        "Mito": "JR-East",
        "Miyo": "JR-East",
        "Musashino": "JR-East",
        "Namboku": "TokyoMetro",
        "Nambu": "JR-East",
        "Narita": "JR-East",

        "Nikkoku": "Tobu",
        "Nippori_Toneri": "Toei",
        "Noda": "Tobu",
        "OdakyuEnoshima": "Odakyu",

        "OdakyuTama": "Odakyu",
        "Odawara": "Odakyu",
        "Oedo": "Toei",
        "Ofunato": "JR-East",
        "Oga": "JR-East",
        "Ogose": "Tobu",
        "Oito": "JR-East",
        "Ome": "JR-East",
        "Ominato": "JR-East",

        "OuMain": "JR-East",
        "Oyama": "JR-East",
        "RikutoEast": "JR-East",
        "RikutsuWest": "JR-East",
        "Rinkai": "TWR",

        "Ryomo": "JR-East",
        "Sagami": "JR-East",
        "Saikyo": "JR-East",

        "Sano": "JR-East",
        "Sanriku": "JR-East",
        "SeibuChichibu": "Seibu",
        "SeibuEn": "Seibu",

        "SeibuShinjuku": "Seibu",
        "SeibuTamagawa": "Seibu",
        "SeibuTamako": "Seibu",
        "SeibuToshima": "Seibu",
        "SeibuYamaguchi": "Seibu",
        "Seibu_Sayama": "Seibu",

        "Senseki": "JR-East",
        "SensekiTohoku": "JR-East",
        "Senzan": "JR-East",
        "Shinetsu": "JR-East",
        "Shinjuku": "Toei",
        "Shinonoi": "JR-East",
        "ShonanMonorailE": "ShonanMonorail",
        "ShonanShinjuku": "JR-East",

        "SobuRapid": "JR-East",
        "SotetsuMain": "Sotetsu",
        "Sotobo": "JR-East",
        "Suigun": "JR-East",
        "SuigunBranch": "JR-East",
        "Takasaki": "JR-East",
        "TamaMonorail": "TamaMonorail",
        "Tazawako": "JR-East",
        "TobuIsesaki": "Tobu",
        "TobuNikko": "Tobu",
        "TobuNoda": "Tobu",
        "TobuSkytree": "Tobu",
        "Tobu_Kameido": "Tobu",
        "TohokuMain": "JR-East",
        "Tojo": "Tobu",
        "Tokaido": "JR-East",
        "TokyuDenEn": "Tokyu",
        "TokyuTamagawa": "Tokyu",
        "TokyuToyoko": "Tokyu",
        "Tozai": "TokyoMetro",
        "Tsugaru": "JR-East",
        "TsukubaExpress": "TsukubaExpress",
        "Tsurumi": "JR-East",
        "Tōnami": "JR-East",
        "Uchibo": "JR-East",
        "Uetsu": "JR-East",
        "Utsunomiya": "Tobu",
        "Yamagata": "JR-East",
        "ChibaUrbanMonorail": "ChibaUrbanMonorail",
        "ChiyodaBranch": "TokyoMetro",
        "ChuoMain": "JR-East",
        "Hachiko": "JR-East",
        "KeiseiChiba": "Keisei",
        "KeiseiChihara": "Keisei",
        "KeiseiKanamachi": "Keisei",
        "KeiseiOshiage": "Keisei",
        "NaritaSkyAccess": "Keisei",
        "NewShuttle": "SaitamaNewUrbanTransit",
        "SobuMain": "JR-East",
        "SotetsuIzumino": "Sotetsu",
        "SotetsuShin-Yokohama": "Sotetsu",
        "TokaidoMain": "JR-East",
        "TokyoMonorail": "TokyoMonorail",
        "TokyuIkegami": "Tokyu",
        "TokyuKodomonokuni": "Tokyu",
        "TokyuMeguro": "Tokyu",
        "TokyuOimachi": "Tokyu",
        "TokyuSetagaya": "Tokyu",
        "Tonami": "JR-East",
        "TsurumiOkawa": "JR-East",
        "TsurumiUmiShibaura": "JR-East",
        "Yokohama": "JR-East",
        "Yamanote": "JR-East",
        "YokohamaBlue": "YokohamaMunicipal",
        "YokohamaGreen": "YokohamaMunicipal",
        "Yokosuka": "JR-East",
        "Yonezawa": "JR-East",
        "Yurakucho": "TokyoMetro",
        "Yurakucho_Seibu": "Seibu",
        "Yurikamome": "Yurikamome"
    };


    // ========== 线路 key → ODPT Railway code 别名表 ==========
    // 内部线路 key 与 ODPT odpt.Railway code 不一致时在此映射，避免 404。
    // 已确认项来自 ODPT 官方线路 ID 列表；推断项遵循 ODPT 命名惯例，运行时以 API 返回为准。
    var LINE_RAILWAY_CODE = {
      "Saikyo": "SaikyoKawagoe",
      "Kawagoe": "SaikyoKawagoe",
      "KeihinTohoku": "KeihinTohokuNegishi",
      "ChuoMain": "Chuo",
      "SobuMain": "Sobu",
      "TokaidoMain": "Tokaido",
      "OuMain": "Ou",
      "Joban": "JobanRapid",
      "KeioMain": "Keio",
      "KeioSagami": "Sagamihara",
      "KeioZoo": "Dobutsuen",
      "KeioShin": "KeioNew",
      "TobuNoda": "TobuUrbanPark",
      "TsurumiUmiShibaura": "Tsurumi",
      "TsurumiOkawa": "Tsurumi",
      "ChiyodaBranch": "Chiyoda",
      "YokohamaBlue": "Blue",
      "YokohamaGreen": "Green",
      "SotetsuMain": "Main",
      "SotetsuIzumino": "Izumino",
      "SotetsuShin-Yokohama": "Shinyokohama",
      "TokyuDenEn": "Denentoshi",
      "TokyuToyoko": "Toyoko",
      "TokyuMeguro": "Meguro",
      "TokyuOimachi": "Oimachi",
      "TokyuIkegami": "Ikegami",
      "TokyuSetagaya": "Setagaya",
      "TokyuTamagawa": "Tamagawa",
      "TokyuKodomonokuni": "Kodomonokuni",
      "MinatoMirai": "Minatomirai",
      "TamaMonorail": "Tama"
    };

    // 解析内部线路 key 为 ODPT Railway code（带别名）
    function resolveRailwayCode(operator, railway) {
      var code = LINE_RAILWAY_CODE[railway] || railway;
      return 'odpt.Railway:' + operator + '.' + code;
    }
    // ========== API Rate Limiting ==========
    // 为每个API服务维护请求队列，确保不超过频率限制
    var API_RATE_LIMIT = 1000;  // 每个API服务最小请求间隔（毫秒），即每秒1次，每分钟60次
    var apiLastRequestTime = {
        'api-challenge.odpt.org': 0,
        'api.odpt.org': 0
    };
    var apiRequestQueue = {
        'api-challenge.odpt.org': [],
        'api.odpt.org': []
    };
    var apiQueueProcessing = {
        'api-challenge.odpt.org': false,
        'api.odpt.org': false
    };

    function getApiDomain(url) {
        try {
            var match = String(url).match(/https?:\/\/([^\/]+)/);
            return match ? match[1] : 'unknown';
        } catch(e) { return 'unknown'; }
    }

    function processApiQueue(domain) {
        if (apiQueueProcessing[domain]) return;
        if (apiRequestQueue[domain].length === 0) return;

        apiQueueProcessing[domain] = true;

        function processNext() {
            if (apiRequestQueue[domain].length === 0) {
                apiQueueProcessing[domain] = false;
                return;
            }

            var now = Date.now();
            var lastTime = apiLastRequestTime[domain] || 0;
            var waitTime = Math.max(0, API_RATE_LIMIT - (now - lastTime));

            setTimeout(function() {
                var request = apiRequestQueue[domain].shift();
                if (!request) {
                    apiQueueProcessing[domain] = false;
                    return;
                }

                apiLastRequestTime[domain] = Date.now();

                // 执行实际的fetch
                fetch(request.url, {
                    headers: { "Accept": "application/json" },
                    signal: AbortSignal.timeout(15000)
                }).then(function(resp) {
                    if (!resp.ok) throw new Error("HTTP " + resp.status);
                    return resp.json();
                }).then(function(data) {
                    request.resolve(data);
                }).catch(function(e) {
                    console.warn("[ODPT] Rate-limited fetch failed:", e.message);
                    request.reject(e);
                }).finally(function() {
                    processNext();
                });
            }, waitTime);
        }

        processNext();
    }

    function rateLimitedFetch(url) {
        return new Promise(function(resolve, reject) {
            var domain = getApiDomain(url);
            if (!apiRequestQueue[domain]) {
                // 未知域名，直接fetch
                fetch(url, {
                    headers: { "Accept": "application/json" },
                    signal: AbortSignal.timeout(15000)
                }).then(resolve).catch(reject);
                return;
            }

            apiRequestQueue[domain].push({ url: url, resolve: resolve, reject: reject });
            processApiQueue(domain);
        });
    }

    // ========== Fetch wrapper ==========
    function fetchODPT(url) {
        if (!url) return Promise.resolve(null);
        return rateLimitedFetch(url).catch(function(e) {
            console.warn("[ODPT] Failed:", e.message);
            return null;
        });
    }

    function extractData(result) {
        if (!result) return [];
        return result.value || (Array.isArray(result) ? result : []);
    }

    // ========== Public API ==========
    window.ODPTClient = {
        ENDPOINTS: ODPT_ENDPOINTS,
        LINE_TO_OPERATOR: LINE_TO_OPERATOR,
        LINE_RAILWAY_CODE: LINE_RAILWAY_CODE,
        getApiKey: getApiKey,
        getApiLinks: getApiLinks,
        keysConfigured: keysConfigured,

        // 获取运行情报/延误信息
        getTrainInformation: function(operator) {
            return fetchODPT(buildUrl(operator, 'trainInformation')).then(extractData);
        },

        // 获取列车实时位置
        getTrainPositions: function(operator) {
            return fetchODPT(buildUrl(operator, 'train')).then(extractData);
        },

        // 获取列车时刻表
        getTimetable: function(operator) {
            return fetchODPT(buildUrl(operator, 'trainTimetable')).then(extractData);
        },

        // 按线路获取时刻表（解决API返回1000条限制的问题）
        getTimetableForRailway: function(operator, railway) {
            var ep = ODPT_ENDPOINTS[operator];
            if (!ep || !ep.trainTimetable) return Promise.resolve([]);
            var key = getApiKey(ep.base);
            if (!key) return Promise.resolve([]);
            // railway格式: "odpt.Railway:TokyoMetro.Ginza" 或 "Ginza"
            var railwayParam = railway.indexOf('odpt.Railway:') === 0 ? railway : resolveRailwayCode(operator, railway);
            var url = ep.base + 'odpt:TrainTimetable?odpt:operator=odpt.Operator:' + operator + '&odpt:railway=' + railwayParam + '&acl:consumerKey=' + key;
            return fetchODPT(url).then(extractData);
        },

        // 时刻表缓存（避免重复请求）
        _timetableCache: {},

        // 获取缓存的时刻表（按线路）
        getCachedTimetable: function(operator, railway) {
            var key = operator + ':' + railway;
            return this._timetableCache[key] || null;
        },

        // 缓存时刻表
        cacheTimetable: function(operator, railway, data) {
            var key = operator + ':' + railway;
            this._timetableCache[key] = data;
        },

        // 解析时间字符串为分钟数
        _parseTimeToMinutes: function(timeStr) {
            try {
                if (!timeStr) return null;
                var parts = timeStr.split(':');
                if (parts.length < 2) return null;
                var h = parseInt(parts[0], 10);
                var m = parseInt(parts[1], 10);
                if (h >= 24) h = h - 24;  // 处理跨午夜时间
                return h * 60 + m;
            } catch(e) { return null; }
        },

        // 获取当前时间（分钟数）
        _getCurrentMinutes: function() {
            try {
                var now = new Date();
                return now.getHours() * 60 + now.getMinutes();
            } catch(e) { return 0; }
        },

        // 按当前时段过滤时刻表（只保留当前时间前后windowMinutes分钟内运行的列车）
        filterTimetableByCurrentTime: function(data, windowMinutes) {
            try {
                if (!data || !Array.isArray(data) || data.length === 0) return [];
                var window = windowMinutes || 90;  // 默认前后90分钟
                var currentMin = this._getCurrentMinutes();
                var self = this;

                return data.filter(function(tt) {
                    if (!tt) return false;
                    var tto = tt['odpt:trainTimetableObject'];
                    if (!tto || !Array.isArray(tto) || tto.length === 0) return false;

                    // 获取第一站发车时间和最后一站到达时间
                    var firstDep = self._parseTimeToMinutes(tto[0]['odpt:departureTime']);
                    var lastArr = self._parseTimeToMinutes(tto[tto.length - 1]['odpt:arrivalTime'] || tto[tto.length - 1]['odpt:departureTime']);

                    if (firstDep === null || lastArr === null) return true;  // 无法判断时保留

                    // 检查列车是否在当前时段运行
                    // 列车运行区间：[firstDep, lastArr]
                    // 当前时段：[currentMin - window, currentMin + window]
                    var inService = lastArr >= (currentMin - window) && firstDep <= (currentMin + window);
                    return inService;
                });
            } catch(e) {
                console.debug("[ODPT] filterTimetableByCurrentTime error:", e.message);
                return data || [];
            }
        },

        // 按线路获取时刻表（并按当前时段过滤）
        getTimetableForRailwayFiltered: function(operator, railway, windowMinutes) {
            var self = this;
            return this.getTimetableForRailway(operator, railway).then(function(data) {
                return self.filterTimetableByCurrentTime(data, windowMinutes);
            });
        },

        // 检查运营商是否支持某种API
        supports: function(operator, type) {
            var ep = ODPT_ENDPOINTS[operator];
            return !!(ep && ep[type]);
        }
    };

    // ========== Timetable Local Cache ==========
    var TIMETABLE_CACHE_KEY = 'odpt_timetable_cache_v1';
    var TIMETABLE_CACHE_TTL = 3600000;  // 1小时过期

    function loadTimetableCache() {
        try {
            var cached = localStorage.getItem(TIMETABLE_CACHE_KEY);
            if (!cached) return null;
            var data = JSON.parse(cached);
            if (!data || !data.timestamp) return null;
            var age = Date.now() - data.timestamp;
            if (age > TIMETABLE_CACHE_TTL) return null;
            // 如果是压缩数据，需要解压
            if (data.compressed && data.timetables) {
                return decompressTimetable(data.timetables);
            }
            return data.timetables || {};
        } catch(e) {
            console.debug("[ODPT] Failed to load timetable cache:", e.message);
            return null;
        }
    }

    function compressTimetable(timetables) {
        try {
            var compressed = {};
            Object.keys(timetables).forEach(function(op) {
                var data = timetables[op] || [];
                compressed[op] = data.map(function(tt) {
                    // 只保留必要字段
                    var stations = (tt['odpt:trainTimetableObject'] || []).map(function(sto) {
                        return {
                            s: sto['odpt:station'] || '',
                            a: sto['odpt:arrivalTime'] || '',
                            d: sto['odpt:departureTime'] || ''
                        };
                    });
                    return {
                        n: tt['odpt:trainNumber'] || '',
                        r: tt['odpt:railway'] || '',
                        t: tt['odpt:trainType'] || '',
                        dir: tt['odpt:railDirection'] || '',
                        st: stations
                    };
                });
            });
            return compressed;
        } catch(e) {
            console.debug("[ODPT] Compress error:", e.message);
            return timetables;
        }
    }

    function decompressTimetable(compressed) {
        try {
            var timetables = {};
            Object.keys(compressed).forEach(function(op) {
                var data = compressed[op] || [];
                timetables[op] = data.map(function(tt) {
                    var stations = (tt.st || []).map(function(sto) {
                        return {
                            'odpt:station': sto.s || '',
                            'odpt:arrivalTime': sto.a || '',
                            'odpt:departureTime': sto.d || ''
                        };
                    });
                    return {
                        'odpt:trainNumber': tt.n || '',
                        'odpt:railway': tt.r || '',
                        'odpt:trainType': tt.t || '',
                        'odpt:railDirection': tt.dir || '',
                        'odpt:trainTimetableObject': stations
                    };
                });
            });
            return timetables;
        } catch(e) {
            console.debug("[ODPT] Decompress error:", e.message);
            return compressed;
        }
    }

    function saveTimetableCache(timetables) {
        try {
            // 压缩数据
            var compressed = compressTimetable(timetables);
            var data = {
                timestamp: Date.now(),
                timetables: compressed,
                compressed: true
            };
            var jsonStr = JSON.stringify(data);
            console.log("[ODPT] Timetable cache size:", (jsonStr.length / 1024 / 1024).toFixed(2), "MB");
            localStorage.setItem(TIMETABLE_CACHE_KEY, jsonStr);
            console.log("[ODPT] Timetable cache saved successfully");
        } catch(e) {
            console.debug("[ODPT] Failed to save timetable cache:", e.message);
            // 如果还是太大，尝试只保存主要运营商
            try {
                var mainOps = ['JR-East', 'TokyoMetro', 'Toei', 'Tobu', 'Keio'];
                var partial = {};
                mainOps.forEach(function(op) {
                    if (timetables[op]) partial[op] = timetables[op];
                });
                var compressed = compressTimetable(partial);
                var data = {
                    timestamp: Date.now(),
                    timetables: compressed,
                    compressed: true,
                    partial: true
                };
                localStorage.setItem(TIMETABLE_CACHE_KEY, JSON.stringify(data));
                console.log("[ODPT] Partial timetable cache saved");
            } catch(e2) {
                console.debug("[ODPT] Partial cache also failed:", e2.message);
            }
        }
    }

    function shouldRefreshTimetables() {
        try {
            var cached = localStorage.getItem(TIMETABLE_CACHE_KEY);
            if (!cached) return true;
            var data = JSON.parse(cached);
            if (!data || !data.timestamp) return true;
            var age = Date.now() - data.timestamp;
            return age > TIMETABLE_CACHE_TTL;
        } catch(e) {
            return true;
        }
    }

    // ========== 全局数据存储 ==========
    window.ODPT_DELAY_DATA = {};       // 延误/运行情报
    window.ODPT_TRAIN_POSITIONS = {};  // 列车实时位置
    window.ODPT_TIMETABLES = {};       // 列车时刻表
    // 向后兼容：合并时刻表和实时位置
    window.ODPT_TRAINS = {};

    // ========== 加载实时数据（延误信息 + 实时位置）==========
    // 每30秒刷新一次
    function loadRealtimeData() {
        window.ODPT_DELAY_DATA = {};
        window.ODPT_TRAIN_POSITIONS = {};
        // 注意：不清空ODPT_TIMETABLES和ODPT_TRAINS，时刻表使用缓存

        var ops = Object.keys(ODPT_ENDPOINTS);
        var loaded = { delay: 0, positions: 0 };

        var promises = ops.map(function(op) {
            var ep = ODPT_ENDPOINTS[op];
            var subPromises = [];

            // 1. 加载运行情报/延误信息
            if (ep.trainInformation) {
                subPromises.push(
                    fetchODPT(buildUrl(op, 'trainInformation')).then(extractData).then(function(data) {
                        if (data && data.length > 0) {
                            window.ODPT_DELAY_DATA[op] = data[0];
                            loaded.delay++;
                        }
                    })
                );
            }

            // 2. 加载列车实时位置
            if (ep.train) {
                subPromises.push(
                    fetchODPT(buildUrl(op, 'train')).then(extractData).then(function(data) {
                        if (data && data.length > 0) {
                            window.ODPT_TRAIN_POSITIONS[op] = data;
                            window.ODPT_TRAINS[op] = data;  // 向后兼容
                            loaded.positions++;
                        }
                    })
                );
            }

            return Promise.all(subPromises);
        });

        return Promise.all(promises).then(function() {
            // 推送数据到DataFusion
            try {
                if (window.DataFusion) {
                    if (window.DataFusion.updateOdptData) {
                        window.DataFusion.updateOdptData(window.ODPT_DELAY_DATA);
                    }
                    if (window.DataFusion.loadTrainPositions) {
                        window.DataFusion.loadTrainPositions();
                    }
                }
            } catch(e) { console.debug("[ODPT] DataFusion push error:", e.message); }

            console.debug("[ODPT] Realtime loaded - delay:", loaded.delay,
                        "operators, positions:", loaded.positions, "operators");
        });
    }

    // ========== 加载时刻表数据（使用本地缓存）==========
    // 每小时刷新一次，优先使用本地缓存
    function loadTimetableData(forceRefresh) {
        // 先尝试从本地缓存加载
        var cachedTimetables = loadTimetableCache();
        if (cachedTimetables && !forceRefresh) {
            console.log("[ODPT] Using cached timetables from localStorage");
            window.ODPT_TIMETABLES = cachedTimetables;
            // 填充ODPT_TRAINS（向后兼容）
            Object.keys(cachedTimetables).forEach(function(op) {
                if (!window.ODPT_TRAINS[op]) {
                    window.ODPT_TRAINS[op] = cachedTimetables[op];
                }
            });
            return Promise.resolve();
        }

        // 缓存过期或强制刷新，从API加载
        console.log("[ODPT] Loading fresh timetables from API");
        var ops = Object.keys(ODPT_ENDPOINTS);
        var loaded = 0;
        var newTimetables = {};

        var promises = ops.map(function(op) {
            var ep = ODPT_ENDPOINTS[op];
            if (!ep.trainTimetable) return Promise.resolve();

            return fetchODPT(buildUrl(op, 'trainTimetable')).then(extractData).then(function(data) {
                if (data && data.length > 0) {
                    newTimetables[op] = data;
                    window.ODPT_TIMETABLES[op] = data;
                    // 如果没有实时位置，用时刻表填充ODPT_TRAINS（向后兼容）
                    if (!window.ODPT_TRAINS[op]) {
                        window.ODPT_TRAINS[op] = data;
                    }
                    loaded++;
                }
            });
        });

        return Promise.all(promises).then(function() {
            // 保存到本地缓存
            if (Object.keys(newTimetables).length > 0) {
                saveTimetableCache(newTimetables);
                console.log("[ODPT] Timetables cached to localStorage:", loaded, "operators");
            }
        });
    }

    // ========== 加载所有数据（实时数据 + 时刻表）==========
    function loadAllData() {
        // 先加载时刻表（可能使用缓存，快速返回）
        return loadTimetableData(false).then(function() {
            // 再加载实时数据（每30秒刷新）
            return loadRealtimeData();
        });
    }

    // ========== Init ==========
    function init() {
        // 初始加载所有数据
        loadAllData().catch(function(e) { console.warn("[ODPT] Init error:", e.message); });

        // 实时数据每30秒刷新
        setInterval(function() {
            loadRealtimeData().catch(function(e) { console.warn("[ODPT] Realtime refresh error:", e.message); });
        }, 30000);

        // 时刻表每小时刷新（检查缓存是否过期）
        setInterval(function() {
            if (shouldRefreshTimetables()) {
                console.log("[ODPT] Timetable cache expired, refreshing...");
                loadTimetableData(true).catch(function(e) { console.warn("[ODPT] Timetable refresh error:", e.message); });
            }
        }, 300000);  // 每5分钟检查一次是否需要刷新

        console.log("[ODPT] Client initialized with", Object.keys(ODPT_ENDPOINTS).length, "operators");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
