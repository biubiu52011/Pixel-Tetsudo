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
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:jre-is" // v4.3.401: JR東日本の運行情報（odpt.Operator:jre-is，ODPT challenge 提供 88 条）
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
            // v4.3.460: Toei の odpt:Train（リアルタイム位置）を実測確認（浅草/新宿/三田/大江戸で返却、
            // 深夜 0:26 でも 26 件）。従来 train: null で取得していなかったのを有効化。
            // v4.3.472 訂正: 都電荒川線（Arakawa）も odpt:Train に含まれる（実測 17 件/昼、30 駅全駅あり）——
            // 従来「提供外」は誤認。data-fusion.js STATION_ALIAS に 26 駅の ID 別名（ODPT 驼峰 vs 本地下划线）を
            // 追加して全列車が荒川線に正しく帰属するよう修正済み。
            train: "odpt:Train?odpt:operator=odpt.Operator:Toei",
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
        "Haijima": "Seibu",
        "Hanzomon": "TokyoMetro",
        "Hibiya": "TokyoMetro",
        "ChuoTatsuno": "JR-East",
        // v4.3.400: ひたちなか海浜鉄道湊線 不是 MIR（首都圏新都市鉄道/つくばエクスプレス）——移除映射，
        // 否则会拉取/聚合つくばエクスプレスの運行情報（串线）。ODPT 无该运营者 TI → 落 no_odpt。
        "Iiyama": "JR-East",
        "Yahiko": "JR-East",
        "Ikebukuro": "Seibu",

        "Ishinomaki": "JR-East",
        "Ito": "JR-East",
        "Itsukaichi": "JR-East",
        "Joban": "JR-East",
        "JobanLocal": "JR-East",
        "JobanMain": "JR-East",
        "Joetsu": "JR-East",
        "Kamaishi": "JR-East",
        "Kitakami": "JR-East",

        "Karasuyama": "JR-East",
        "Kashima": "JR-East",
        "Kawagoe": "JR-East",
        "KawagoeWest": "JR-East",
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
        "Kiryu": "Tobu",
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
        // v4.3.479: 成田線支線（我孫子/空港）・東金線・南武線浜川崎支線（ODPT 独立 railway，同名透传）
        "NaritaAbikoBranch": "JR-East",
        "NaritaAirportBranch": "JR-East",
        "Togane": "JR-East",
        "NambuBranch": "JR-East",

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

        "Sano": "Tobu",
        "Yamada": "JR-East",
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
        "TsukubaExpress": "MIR",
        "Tsurumi": "JR-East",
        "Tōnami": "JR-East",
        "Uchibo": "JR-East",
        "UtsunomiyaJR": "JR-East",
        "Uetsu": "JR-East",
        "Utsunomiya": "Tobu",
        "Yamagata": "JR-East",
        "ChiyodaBranch": "TokyoMetro",
        "ChuoMain": "JR-East",
        "Hachiko": "JR-East",
        "KeiseiChiba": "Keisei",
        "KeiseiChihara": "Keisei",
        "KeiseiKanamachi": "Keisei",
        "KeiseiOshiage": "Keisei",
        "NaritaSkyAccess": "Keisei",
        "NewShuttle": "SaitamaRailway", // v4.3.470: ODPT 官方 operator 名实为 SaitamaRailway（埼玉新都市交通），本地原错写 SaitamaTransit
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
        "Tadami": "JR-East",
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
      "Kawagoe": "SaikyoKawagoe", // 大宮〜川越段は埼京線・川越線運行系統（ODPT SaikyoKawagoe API）
      "KawagoeWest": "Kawagoe", // 川越〜高麗川段 = ODPT 川越線（川越-高麗川間）
      "KeihinTohoku": "KeihinTohokuNegishi",
      "Marunouchi": "Marunouchi",
      "MarunouchiBranch": "MarunouchiBranch", // 丸ノ内線支線（方南町支線）独立 ODPT railway
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
      "TsurumiUmiShibaura": "TsurumiUmiShibauraBranch",
      "TsurumiOkawa": "TsurumiOkawaBranch",
      "ChiyodaBranch": "Chiyoda",
      "Noda": "TobuUrbanPark",
      "Nippori_Toneri": "NipporiToneri",
      "TobuIsesaki": "Isesaki",
      "Daishi_Tobu": "Daishi",
      "KeioInokashira": "Inokashira",
      "KeioKeibajo": "Keibajo",
      "KeioTakao": "Takao",
      "Tobu_Kameido": "Kameido",
      "TobuNikko": "Nikko",
      "Sano": "Sano",
      "Kiryu": "Kiryu",
      "Nikkoku": "Kinugawa",
      "YokohamaBlue": "Blue",
      "YokohamaGreen": "Green",
      "SotetsuMain": "Main",
      "SotetsuIzumino": "Izumino",
      "SotetsuShin-Yokohama": "Shinyokohama",
      "TokyuDenEn": "DenEnToshi",
      "TokyuToyoko": "Toyoko",
      "TokyuMeguro": "Meguro",
      "TokyuOimachi": "Oimachi",
      "TokyuIkegami": "Ikegami",
      "TokyuSetagaya": "Setagaya",
      "TokyuTamagawa": "TokyuTamagawa",
      "TokyuKodomonokuni": "Kodomonokuni",
      "MinatoMirai": "Minatomirai",
      "TamaMonorail": "TamaMonorail",
    
    "ChuoTatsuno": "ChuoTatsunoBranch",
    "RikutoEast": "RikuEast",
    "RikutsuWest": "RikuWest",
    "UtsunomiyaJR": "Utsunomiya",
    // v4.3.475: 東武宇都宮線（ODPT Tobu.Utsunomiya 独立 railway，与 JR 宇都宮線 UtsunomiyaJR→Utsunomiya 并存，operator 不同不冲突）
    "TobuUtsunomiya": "Utsunomiya",
    // v4.3.475: 都営新宿線显式映射（透传已命中 ODPT Toei.Shinjuku，此处文档化防歧义）
    "Shinjuku": "Shinjuku",
    "JobanMain": "Joban",
    "TohokuMain": "Tohoku",
    // v4.3.479: 新建支線/東金線同名透传文档化（ODPT 官方 railway code 与本地 ID 一致）
    "Togane": "Togane",
    "NaritaAbikoBranch": "NaritaAbikoBranch",
    "NaritaAirportBranch": "NaritaAirportBranch",
    "NambuBranch": "NambuBranch",
    "Yamagata": "OuYamagata",
    "Kounan": "Hanawa",
    "Miyo": "Yahiko",
    "Yonezawa": "Yonesaka",
    "Komii": "Koumi",
    // ===== v4.3.470: ODPT API 实测修正（2026-09-10，22 operator 全量 railway 对比）=====
    // 本地 line ID 与 ODPT odpt.Railway code 命名不同，原默认透传全部 404/空，实时数据接不上。
    // 京急（ODPT 官方用 Main/Airport/Kurihama/Zushi/Daishi）
    "Keikyu": "Main",
    "KeikyuAirport": "Airport",
    "KeikyuKurihama": "Kurihama",
    "KeikyuZushi": "Zushi",
    "Daishi_Keikyu": "Daishi",
    // 京成（本線/千葉/金町/押上；千原線 KeiseiChihara ODPT 无独立 railway，维持透传不生效）
    "Keisei": "Main",
    "KeiseiChiba": "Chiba",
    "KeiseiKanamachi": "Kanamachi",
    "KeiseiOshiage": "Oshiage",
    // 西武（Haijima=拝島線——4.3.471 起本地 line ID 已正名 Haijima，同名透传即命中 ODPT）
    "Seibu_Sayama": "Sayama",
    "SeibuEn": "Seibuen",
    "SeibuShinjuku": "Shinjuku",
    "SeibuTamagawa": "Tamagawa",
    "SeibuTamako": "Tamako",
    "SeibuToshima": "Toshima",
    "SeibuYamaguchi": "Yamaguchi",
    "Yurakucho_Seibu": "SeibuYurakucho",
    // 小田急
    "OdakyuEnoshima": "Enoshima",
    "OdakyuTama": "Tama",
    // 相鉄・東京モノレール
    "SotetsuShin-Yokohama": "SotetsuShinYokohama",
    "TokyoMonorail": "HanedaAirport",
    // 埼玉新都市交通（operator 已改 SaitamaRailway，railway 同名）
    "NewShuttle": "SaitamaRailway",
    // （4.3.471: 北上線 Kitakami・山田線 Yamada 已正名，同名透传即命中 ODPT，垫片移除）
};

    // 解析内部线路 key 为 ODPT Railway code（带别名）
    function resolveRailwayCode(operator, railway) {
      var code = LINE_RAILWAY_CODE[railway] || railway;
      return 'odpt.Railway:' + operator + '.' + code;
    }
    // ========== API Rate Limiting ==========
    // 为每个API服务维护请求队列，确保不超过频率限制
    var API_RATE_LIMIT = 150;   // v4.3.395: 最小请求间隔（毫秒）。实测 ODPT 12 并发无间隔全 200（总耗时 248ms），原 1000ms 串行把等待放大 40 倍
    var API_MAX_CONCURRENCY = 3;  // 每域最大并发（滑动窗口）
    var apiLastRequestTime = {
        'api-challenge.odpt.org': 0,
        'api.odpt.org': 0
    };
    var apiRequestQueue = {
        'api-challenge.odpt.org': [],
        'api.odpt.org': []
    };
    var _active = {};
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

        // v4.3.395: 每域并发滑动窗口（原串行 1 请求/秒）。实测 ODPT 12 并发全 200，
        // 14 个运营者延误请求从 ~14s 降至 ~1.5s；30s 刷新频率仍远低于限速阈值。
        function pump() {
            while (apiRequestQueue[domain].length > 0 && (_active[domain] || 0) < API_MAX_CONCURRENCY) {
                var now = Date.now();
                var lastTime = apiLastRequestTime[domain] || 0;
                var waitTime = Math.max(0, API_RATE_LIMIT - (now - lastTime));
                if (waitTime > 0) {
                    setTimeout(function() { pump(); }, waitTime);
                    return;
                }
                var request = apiRequestQueue[domain].shift();
                if (!request) break;
                apiLastRequestTime[domain] = Date.now();
                _active[domain] = (_active[domain] || 0) + 1;

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
                    _active[domain] = (_active[domain] || 1) - 1;
                    pump();
                });
            }
            if ((_active[domain] || 0) === 0 && apiRequestQueue[domain].length === 0) {
                apiQueueProcessing[domain] = false;
            }
        }

        pump();
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
        // v4.3.512: 新增 opts.calendar——按日历过滤请求（如 odpt.Calendar:Weekday），
        // 单请求 1000 条硬上限下把截断线按日历拆成多次请求即可合并出完整数据
        getTimetableForRailway: function(operator, railway, opts) {
            var ep = ODPT_ENDPOINTS[operator];
            if (!ep || !ep.trainTimetable) return Promise.resolve([]);
            var key = getApiKey(ep.base);
            if (!key) return Promise.resolve([]);
            // railway格式: "odpt.Railway:TokyoMetro.Ginza" 或 "Ginza"
            var railwayParam = railway.indexOf('odpt.Railway:') === 0 ? railway : resolveRailwayCode(operator, railway);
            var url = ep.base + 'odpt:TrainTimetable?odpt:operator=odpt.Operator:' + operator + '&odpt:railway=' + railwayParam + '&acl:consumerKey=' + key;
            if (opts && opts.calendar) url += '&odpt:calendar=' + opts.calendar;
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
    var TIMETABLE_CACHE_KEY = 'odpt_timetable_cache_v3'; // v4.3.512: 压缩格式新增 c(calendar) 字段 + 1000 截断线按日历拆分合并，v2 缓存结构不兼容，升级键强制失效
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
                    // v4.3.459: ODPT 时刻表 stop 的站字段是 departureStation/arrivalStation（odpt:station 已不再返回）——
                    // 旧压缩只取 odpt:station 导致缓存解压后站全空、推定位置全失（都电荒川线 879 条时刻表 0 位置）。
                    // 压缩时兼容三种字段，解压时全部还原。
                    var stations = (tt['odpt:trainTimetableObject'] || []).map(function(sto) {
                        return {
                            s: sto['odpt:station'] || sto['odpt:departureStation'] || sto['odpt:arrivalStation'] || '',
                            a: sto['odpt:arrivalTime'] || '',
                            d: sto['odpt:departureTime'] || ''
                        };
                    });
                    return {
                        n: tt['odpt:trainNumber'] || '',
                        r: tt['odpt:railway'] || '',
                        t: tt['odpt:trainType'] || '',
                        dir: tt['odpt:railDirection'] || '',
                        c: tt['odpt:calendar'] || '',  // v4.3.512: 压缩保留 calendar——v2 丢 calendar 导致缓存数据不做日历过滤（周六会推定平日班次）
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
                            'odpt:departureStation': sto.s || '',
                            'odpt:arrivalStation': sto.s || '',
                            'odpt:arrivalTime': sto.a || '',
                            'odpt:departureTime': sto.d || ''
                        };
                    });
                    return {
                        'odpt:trainNumber': tt.n || '',
                        'odpt:railway': tt.r || '',
                        'odpt:trainType': tt.t || '',
                        'odpt:railDirection': tt.dir || '',
                        'odpt:calendar': tt.c || '',  // v4.3.512: 还原 calendar，estimator 日历过滤恢复生效
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
        var delayPromises = [], posPromises = [];

        ops.forEach(function(op) {
            var ep = ODPT_ENDPOINTS[op];

            // 1. 加载运行情报/延误信息（优先推送，首屏不等列车位置）
            if (ep.trainInformation) {
                delayPromises.push(
                    fetchODPT(buildUrl(op, 'trainInformation')).then(extractData).then(function(data) {
                        // v4.3.386: 保留全部记录（ODPT 按运行系统返回多条，data[0] 只留首条会丢其他线路的延误）
                        // v4.3.392: 成功即写入（空数组=确认无记录→UI normal）；失败标记 null（→UI 情報なし，不伪装成正常）
                        window.ODPT_DELAY_DATA[op] = (data && data.length > 0) ? data : [];
                        loaded.delay++;
                    }).catch(function(e) {
                        window.ODPT_DELAY_DATA[op] = null;
                        console.debug("[ODPT] " + op + " trainInformation fetch failed:", e && e.message);
                    })
                );
            }

            // 2. 加载列车实时位置（第二推送，不阻塞延误首屏）
            if (ep.train) {
                posPromises.push(
                    fetchODPT(buildUrl(op, 'train')).then(extractData).then(function(data) {
                        // v4.3.392: 成功即写入（空数组也写入），失败不拖垮全局推送
                        window.ODPT_TRAIN_POSITIONS[op] = (data && data.length > 0) ? data : [];
                        window.ODPT_TRAINS[op] = window.ODPT_TRAIN_POSITIONS[op];  // 向后兼容
                        loaded.positions++;
                    }).catch(function(e) {
                        window.ODPT_TRAIN_POSITIONS[op] = null;
                        window.ODPT_TRAINS[op] = null;
                        console.debug("[ODPT] " + op + " train positions fetch failed:", e && e.message);
                    })
                );
            }
        });

        // v4.3.394: 延误信息全部就绪后立即推送（首屏 5-15s → 2-4s）；
        // 列车位置随后补齐。加载期间 UI 显示「情報取得中」，不再把等待期伪装成「正常」。
        function pushDelay() {
            // v4.3.396: head 提前执行场景——DataFusion 可能尚未加载，重试等待不丢数据
            if (!window.DataFusion || !window.DataFusion.updateOdptData) {
                setTimeout(pushDelay, 300);
                return;
            }
            try {
                window.DataFusion.updateOdptData(window.ODPT_DELAY_DATA);
            } catch(e) { console.debug("[ODPT] delay push error:", e.message); }
            console.debug("[ODPT] Realtime delay loaded:", loaded.delay, "operators");
        }
        function pushAll() {
            // v4.3.396: 同 pushDelay——DataFusion 未就绪时重试，不丢数据
            if (!window.DataFusion || !window.DataFusion.updateOdptData) {
                setTimeout(pushAll, 300);
                return;
            }
            try {
                window.DataFusion.updateOdptData(window.ODPT_DELAY_DATA);
                if (window.DataFusion.loadTrainPositions) {
                    window.DataFusion.loadTrainPositions();
                }
            } catch(e) { console.debug("[ODPT] DataFusion push error:", e.message); }
            console.debug("[ODPT] Realtime loaded - delay:", loaded.delay,
                        "operators, positions:", loaded.positions, "operators");
        }
        // v4.3.415: 列车位置推送与延误情报解耦——位置数据不等待 delayPromises 完成
        // （TrainInformation 任一 operator 慢/超时会卡住整条 Promise 链，导致 loadTrainPositions 永不执行）
        // 同时等待 DataLayer 就绪后再分配（本地线路数据晚于 ODPT 到达时重试，不设死上限）
        function pushTrainPositions() {
            if (!window.DataFusion || !window.DataFusion.loadTrainPositions) {
                setTimeout(pushTrainPositions, 300);
                return;
            }
            var dl = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
            if (!dl || Object.keys(dl).length === 0) {
                setTimeout(pushTrainPositions, 300);
                return;
            }
            try {
                // v4.3.416: 每次位置推送重置二次校准 flag，刷新周期内只补一次
                if (window.DataFusion.loadTrainPositions) {
                    window.DataFusion.loadTrainPositions._calibrated = false;
                    window.DataFusion.loadTrainPositions();
                }
            } catch(e) { console.debug("[ODPT] train positions push error:", e.message); }
            console.debug("[ODPT] Realtime positions pushed:", loaded.positions, "operators");
        }

        // 延误情报独立推送；列车位置在 posPromises 就绪后推送（不阻塞、不依赖延误链）
        Promise.all(delayPromises).then(pushDelay);
        return Promise.all(posPromises).then(pushTrainPositions);
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

        // v4.3.489: JR-East 时刻表按 railway 分批拉取（ODPT 单请求 1000 条上限会把
        // 首都圈外线路截断——实测全量请求仅返回 ChuoRapid/Hachiko/Joban/Agatsuma/JobanRapid 5 线，
        // 其余 83 条 JR 线路时刻表全部丢失，导致时刻表推定无法覆盖地方线）
        function collectTimetableByRailway(op, localLineIds) {
            var batch = localLineIds.filter(function(lid) {
                return ODPT_ENDPOINTS[op] && ODPT_ENDPOINTS[op].trainTimetable;
            });
            // v4.3.512: ODPT 单请求 1000 条硬上限（acl:page 实测 400 不支持分页）——
            // 恰 1000 条 = 截断信号，按日历拆成多次请求合并出完整数据。
            // 实测 5 条首都圈大线截断：Yamanote 1037 / Keiyo 1127 / ChuoRapid 1087 /
            // ChuoSobuLocal 1196 / KeihinTohoku 1263（合并后全量，各日历分片均 <1000）。
            var CAL_SPLIT = ['odpt.Calendar:Weekday', 'odpt.Calendar:SaturdayHoliday', 'odpt.Calendar:Holiday'];
            function splitTruncatedByCalendar(lid) {
                var seen = {};
                function dedup(list) {
                    var out = [];
                    list.forEach(function(tt) {
                        if (!tt) return;
                        // 同车次×同日历×同方向 = 同一条记录（日历拆分后天然区分平日/休日班次）
                        var k = (tt['odpt:trainNumber'] || '') + '|' + (tt['odpt:railway'] || '') + '|' + (tt['odpt:calendar'] || '') + '|' + (tt['odpt:railDirection'] || '');
                        if (seen[k]) return;
                        seen[k] = true;
                        out.push(tt);
                    });
                    return out;
                }
                var chain = Promise.resolve([]);
                CAL_SPLIT.forEach(function(cal) {
                    chain = chain.then(function(acc) {
                        return window.ODPTClient.getTimetableForRailway(op, lid, { calendar: cal }).then(function(part) {
                            return acc.concat(part || []);
                        }, function() { return acc; });  // 单日历失败不阻断，取其余部分
                    });
                });
                return chain.then(dedup);
            }
            // v4.3.489: 分批并行拉取——fetchODPT 自带 3 并发 + 150ms 滑动窗口限速；
            // 85 条一次 Promise.all 在弱网/沙箱下可能被连接池限流卡住，每批 20 条链式
            // 推进，既完整覆盖又避免瞬时请求过多（约 4-6s 完成全量）
            var BATCH = 20;
            var idx = 0;
            function nextBatch() {
                if (idx >= batch.length) return Promise.resolve();
                var slice = batch.slice(idx, idx + BATCH);
                idx += BATCH;
                return Promise.all(slice.map(function(lid) {
                    return window.ODPTClient.getTimetableForRailway(op, lid).then(function(data) {
                        var rows = (data && data.length > 0) ? data : [];
                        // 截断线：按日历拆分重拉合并（替换截断数据）
                        if (rows.length >= 1000) {
                            return splitTruncatedByCalendar(lid).then(function(merged) {
                                return merged.length > rows.length ? merged : rows;  // 拆分失败/无增益时回退
                            });
                        }
                        return rows;
                    }).catch(function() {
                        // 请求失败：仍标记探测，避免后续对空线反复请求
                        if (!window.ODPT_TT_PROBED) window.ODPT_TT_PROBED = {};
                        window.ODPT_TT_PROBED[lid] = true;
                        return [];
                    }).then(function(rows) {
                        // 探测标记：无论有无数据都记录，避免 loadMissingTimetables 对空线反复请求
                        if (!window.ODPT_TT_PROBED) window.ODPT_TT_PROBED = {};
                        window.ODPT_TT_PROBED[lid] = true;
                        if (rows.length > 0) {
                            if (!newTimetables[op]) newTimetables[op] = [];
                            newTimetables[op] = newTimetables[op].concat(rows);
                            if (!window.ODPT_TIMETABLES[op]) window.ODPT_TIMETABLES[op] = [];
                            window.ODPT_TIMETABLES[op] = window.ODPT_TIMETABLES[op].concat(rows);
                        }
                    });
                })).then(nextBatch);
            }
            return nextBatch().then(function() {
                if (newTimetables[op] && newTimetables[op].length > 0) {
                    // v4.3.512: 池级去重——跨 lid 共用同一 ODPT railway（Kawagoe/KawagoeWest 等）
                    // 会重复 concat 同一批记录；单线拆分的 dedup 只覆盖拆分内，这里是全池去重。
                    var seenAll = {}, deduped = [];
                    newTimetables[op].forEach(function(tt) {
                        if (!tt) return;
                        var k = (tt['odpt:trainNumber'] || '') + '|' + (tt['odpt:railway'] || '') + '|' + (tt['odpt:calendar'] || '') + '|' + (tt['odpt:railDirection'] || '');
                        if (seenAll[k]) return;
                        seenAll[k] = true;
                        deduped.push(tt);
                    });
                    newTimetables[op] = deduped;
                    window.ODPT_TIMETABLES[op] = deduped;
                    if (!window.ODPT_TRAINS[op]) window.ODPT_TRAINS[op] = deduped;
                    loaded++;
                }
            });
        }

        var promises = ops.map(function(op) {
            var ep = ODPT_ENDPOINTS[op];
            if (!ep.trainTimetable) return Promise.resolve();

            // JR-East 走按 railway 分批（本地线路映射），其余运营商保持单请求
            if (op === 'JR-East') {
                // v4.3.489: 从 LINE_TO_OPERATOR 收集全部 JR-East 本地线（85 条）——
                // LINE_RAILWAY_CODE 只含显式改名线（62 条同名透传线不在其中），
                // 漏掉会让 Yamanote/ChuoRapid/Agatsuma 等大批线路时刻表缺失
                var jrLineIds = [];
                Object.keys(LINE_TO_OPERATOR).forEach(function(lid) {
                    if (LINE_TO_OPERATOR[lid] === 'JR-East') jrLineIds.push(lid);
                });
                if (jrLineIds.length === 0) return Promise.resolve();
                return collectTimetableByRailway(op, jrLineIds);
            }

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
        // v4.3.395: 延误/位置先行（首屏关键）——首次无缓存时时刻表 14 个大数据请求
        // 不再阻塞延误首屏；有缓存时 loadTimetableData 快速返回，顺序影响可忽略
        return loadRealtimeData().then(function() {
            return loadTimetableData(false);
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

    // v4.3.395: 请求尽早发起——fetch 不依赖 DOM，脚本执行即请求，不再等 DOMContentLoaded
    // （原实现在 DOMContentLoaded 后才 init，延误请求被页面全部资源加载完才发出，白白多等数秒）
    init();

})();
