/**
 * Pixel Tetsudo - Unified ODPT API Client
 * 完整 API URL（含 key）直接存储，无需分离管理。
 *
 * SECURITY: 浏览器端混淆不是秘密存储；任何发送到客户端的 consumer key 都可被恢复。
 * 真正隐藏 key 需要把 ODPT 请求迁移到受控的服务端/Edge proxy。
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
    // XOR + Base64 仅避免 key 以明文字符串出现，不构成秘密存储或访问控制。
    // 不要把此机制当作 credential protection；迁移到服务端/Edge proxy 后应删除客户端 key。
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
            train: "odpt:Train?odpt:operator=odpt.Operator:Keio",  // v4.3.6xx: 实测有67列实时列车，原配置错误为null
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:Keio",
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:Keio"
        },
        "Keikyu": {
            base: "https://api-challenge.odpt.org/api/v4/",
            // Official JSON Train Location exists, but this runtime currently has this endpoint
            // disabled. Keep capability off until the endpoint is revalidated/wired end-to-end;
            // authoritative-line policy must never claim a feed the runtime does not consume.
            train: null,
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
            // Current official realtime publication is not a documented JSON Train Location
            // resource consumed by this runtime. Keep timetable/information, but do not issue
            // speculative odpt:Train requests until a supported realtime consumer is wired.
            train: null,
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
            // No currently documented JSON Train Location dataset in the official catalog.
            // Do not infer realtime capability merely from operator availability.
            train: null,
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:Keisei",
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:Keisei"
        },
        "TokyoMonorail": {
            base: "https://api-challenge.odpt.org/api/v4/",
            train: null,  // 东京单轨不提供列车位置API
            trainTimetable: null,  // ODPT无数据
            trainInformation: null  // ODPT无数据
        }
        // MinatoMirai（港未来线）：ODPT完全无数据，移除
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
        "KeikyuDaishi": "Keikyu",
        "TobuDaishi": "Tobu",
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
        "KeioSagamihara": "Keio",
        "KeioNew": "Keio",
        "KeioTakao": "Keio",
        "KeioDobutsuen": "Keio",
        "Keisei": "Keisei",
        "Keiyo": "JR-East",
        "Kesennuma": "JR-East",
        "Kiryu": "Tobu",
        "Koizumi": "Tobu",
        "Kokubunji": "Seibu",
        "Koumi": "JR-East",
        "Hanawa": "JR-East",
        "Kururi": "JR-East",
        "Marunouchi": "TokyoMetro",
        "MarunouchiBranch": "TokyoMetro",
        // MinatoMirai：ODPT无数据，移除映射
        "Mita": "Toei",
        "Mito": "JR-East",
        "Musashino": "JR-East",
        "Namboku": "TokyoMetro",
        "Nambu": "JR-East",
        "Narita": "JR-East",
        // v4.3.479: 成田線支線（我孫子/空港）・東金線・南武線浜川崎支線（ODPT 独立 railway，同名透传）
        "NaritaAbikoBranch": "JR-East",
        "NaritaAirportBranch": "JR-East",
        "Togane": "JR-East",
        "NambuBranch": "JR-East",

        "Kinugawa": "Tobu",
        "NipporiToneri": "Toei",
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

        "Ou": "JR-East",
        "Oyama": "JR-East",
        "RikuEast": "JR-East",
        "RikuWest": "JR-East",
        "Rinkai": "TWR",

        "Ryomo": "JR-East",
        "Sagami": "JR-East",
        "Saikyo": "JR-East",

        "Sano": "Tobu",
        "Yamada": "JR-East",
        "SeibuChichibu": "Seibu",
        "Seibuen": "Seibu",

        "SeibuShinjuku": "Seibu",
        "SeibuTamagawa": "Seibu",
        "SeibuTamako": "Seibu",
        "SeibuToshima": "Seibu",
        "SeibuYamaguchi": "Seibu",
        "SeibuSayama": "Seibu",

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
        "TobuKameido": "Tobu",
        "Tohoku": "JR-East",
        "Tojo": "Tobu",
        "Tokaido": "JR-East",
        "TokyuDenEnToshi": "Tokyu",
        "TokyuTamagawa": "Tokyu",
        "TokyuToyoko": "Tokyu",
        "Tozai": "TokyoMetro",
        "Tsugaru": "JR-East",
        "TsukubaExpress": "MIR",
        "Tsurumi": "JR-East",
        "Uchibo": "JR-East",
        "UtsunomiyaJR": "JR-East",
        "Uetsu": "JR-East",
        "Utsunomiya": "Tobu",
        "Yamagata": "JR-East",
        "ChiyodaBranch": "TokyoMetro",
        "Chuo": "JR-East",
        "Hachiko": "JR-East",
        "KeiseiChiba": "Keisei",
        "KeiseiChihara": "Keisei",
        "KeiseiKanamachi": "Keisei",
        "KeiseiOshiage": "Keisei",
        "NaritaSkyAccess": "Keisei",
        "NewShuttle": "SaitamaRailway", // v4.3.470: ODPT 官方 operator 名实为 SaitamaRailway（埼玉新都市交通），本地原错写 SaitamaTransit
        "Sobu": "JR-East",
        "SotetsuIzumino": "Sotetsu",
        "SotetsuShinYokohama": "Sotetsu",
        "TokaidoMain": "JR-East",
        // TokyoMonorail：ODPT无数据，移除映射
        "TokyuIkegami": "Tokyu",
        "TokyuKodomonokuni": "Tokyu",
        "TokyuMeguro": "Tokyu",
        "TokyuOimachi": "Tokyu",
        "TokyuSetagaya": "Tokyu",
        "TsurumiOkawa": "JR-East",
        "Tadami": "JR-East",
        "TsurumiUmiShibaura": "JR-East",
        "Yokohama": "JR-East",
        "Yamanote": "JR-East",
        "YokohamaBlue": "YokohamaMunicipal",
        "YokohamaGreen": "YokohamaMunicipal",
        "Yokosuka": "JR-East",
        "Yonesaka": "JR-East",
        "Yurakucho": "TokyoMetro",
        "SeibuYurakucho": "Seibu",
        "Yurikamome": "Yurikamome"
    };


    // ========== 线路 key → ODPT Railway code 别名表 ==========
    // 内部线路 key 与 ODPT odpt.Railway code 不一致时在此映射，避免 404。
    // 仅在内部 lineId 与数据源实际 owl:sameAs railway code 不同时登记已验证 alias；禁止根据英文名/命名惯例猜测 API identity。
    var LINE_RAILWAY_CODE = {
      "Saikyo": "SaikyoKawagoe",
      "Kawagoe": "SaikyoKawagoe", // 大宮〜川越段は埼京線・川越線運行系統（ODPT SaikyoKawagoe API）
      "KawagoeWest": "Kawagoe", // 川越〜高麗川段 = ODPT 川越線（川越-高麗川間）
      "ShonanShinjuku": "ShonanShinjuku", // 湘南新宿ライン独立 ODPT railway
      "Takasaki": "Takasaki", // 高崎線
      "KeihinTohoku": "KeihinTohokuNegishi",
      "Marunouchi": "Marunouchi",
      "MarunouchiBranch": "MarunouchiBranch", // 丸ノ内線支線（方南町支線）独立 ODPT railway
      "Chuo": "Chuo",
      "Sobu": "Sobu",
      "TokaidoMain": "Tokaido",
      "Ou": "Ou",
      "Joban": "JobanRapid",
      "KeioMain": "Keio",
      "KeioSagamihara": "Sagamihara",
      "KeioDobutsuen": "Dobutsuen",
      "KeioNew": "KeioNew",
      "TobuNoda": "TobuUrbanPark",
      "TsurumiUmiShibaura": "TsurumiUmiShibauraBranch",
      "TsurumiOkawa": "TsurumiOkawaBranch",
      "ChiyodaBranch": "Chiyoda",
      "Noda": "TobuUrbanPark",
      "NipporiToneri": "NipporiToneri",
      "TobuIsesaki": "Isesaki",
      "TobuDaishi": "Daishi",
      "KeioInokashira": "Inokashira",
      "KeioKeibajo": "Keibajo",
      "KeioTakao": "Takao",
      "TobuKameido": "Kameido",
      "TobuNikko": "Nikko",
      "Sano": "Sano",
      "Kiryu": "Kiryu",
      "Kinugawa": "Kinugawa",
      "YokohamaBlue": "Blue",
      "YokohamaGreen": "Green",
      "SotetsuMain": "Main",
      "SotetsuIzumino": "Izumino",
      "TokyuDenEnToshi": "DenEnToshi",
      "TokyuToyoko": "Toyoko",
      "TokyuMeguro": "Meguro",
      "TokyuOimachi": "Oimachi",
      "TokyuIkegami": "Ikegami",
      "TokyuSetagaya": "Setagaya",
      "TokyuTamagawa": "TokyuTamagawa",
      "TokyuKodomonokuni": "Kodomonokuni",
      "TamaMonorail": "TamaMonorail",
    
    "ChuoTatsuno": "ChuoTatsunoBranch",
    "RikuEast": "RikuEast",
    "RikuWest": "RikuWest",
    "UtsunomiyaJR": "Utsunomiya",
    // v4.3.475: 東武宇都宮線（ODPT Tobu.Utsunomiya 独立 railway，与 JR 宇都宮線 UtsunomiyaJR→Utsunomiya 并存，operator 不同不冲突）
    "Utsunomiya": "Utsunomiya", // 東武宇都宮線。JR は UtsunomiyaJR + JR-East namespace で分離
    // v4.3.475: 都営新宿線显式映射（透传已命中 ODPT Toei.Shinjuku，此处文档化防歧义）
    "Shinjuku": "Shinjuku",
    "JobanMain": "Joban",
    "Tohoku": "Tohoku",
    // v4.3.479: 新建支線/東金線同名透传文档化（ODPT 官方 railway code 与本地 ID 一致）
    "Togane": "Togane",
    "NaritaAbikoBranch": "NaritaAbikoBranch",
    "NaritaAirportBranch": "NaritaAirportBranch",
    "NambuBranch": "NambuBranch",
    "Yamagata": "OuYamagata",
    "Hanawa": "Hanawa",
    "Yahiko": "Yahiko",
    "Yonesaka": "Yonesaka",
    "Koumi": "Koumi",
    // ===== v4.3.470: ODPT API 实测修正（2026-09-10，22 operator 全量 railway 对比）=====
    // 本地 line ID 与 ODPT odpt.Railway code 命名不同，原默认透传全部 404/空，实时数据接不上。
    // 京急（ODPT 官方用 Main/Airport/Kurihama/Zushi/Daishi）
    "Keikyu": "Main",
    "KeikyuAirport": "Airport",
    "KeikyuKurihama": "Kurihama",
    "KeikyuZushi": "Zushi",
    "KeikyuDaishi": "Daishi",
    // 京成（本線/千葉/金町/押上；千原線 KeiseiChihara ODPT 无独立 railway，维持透传不生效）
    "Keisei": "Main",
    "KeiseiChiba": "Chiba",
    "KeiseiKanamachi": "Kanamachi",
    "KeiseiOshiage": "Oshiage",
    "NaritaSkyAccess": "NaritaSkyAccess",
    // 西武（Haijima=拝島線——4.3.471 起本地 line ID 已正名 Haijima，同名透传即命中 ODPT）
    "SeibuSayama": "Sayama",
    "Seibuen": "Seibuen",
    "SeibuShinjuku": "Shinjuku",
    "SeibuTamagawa": "Tamagawa",
    "SeibuTamako": "Tamako",
    "SeibuToshima": "Toshima",
    "SeibuYamaguchi": "Yamaguchi",
    "SeibuYurakucho": "SeibuYurakucho",
    // 小田急
    "OdakyuEnoshima": "Enoshima",
    "OdakyuTama": "Tama",
    // 相鉄（新横浜線の source-specific railway code）
    "SotetsuShinYokohama": "SotetsuShinYokohama",
    // 埼玉新都市交通（operator 已改 SaitamaRailway，railway 同名）
    "NewShuttle": "SaitamaRailway",
    // （4.3.471: 北上線 Kitakami・山田線 Yamada 已正名，同名透传即命中 ODPT，垫片移除）
};

    // Canonical railway identity: operator namespace + railway code.
    // A railway short code is never a globally unique identity.
    function makeRailwayIdentity(operator, railwayCode) {
      if (!operator || !railwayCode) return null;
      return {
        operator: String(operator),
        railwayCode: String(railwayCode),
        key: String(operator) + "::" + String(railwayCode),
        odptRailway: "odpt.Railway:" + String(operator) + "." + String(railwayCode)
      };
    }

    function parseRailwayIdentity(value) {
      try {
        var raw = typeof value === "string" ? value : ((value && value["odpt:railway"]) || "");
        var m = String(raw).match(/^odpt\.Railway:([^.]+)\.(.+)$/);
        return m ? makeRailwayIdentity(m[1], m[2]) : null;
      } catch(e) { return null; }
    }

    function getLineRailwayIdentity(lineId) {
      if (!lineId) return null;
      var operator = LINE_TO_OPERATOR[lineId] || null;
      var code = LINE_RAILWAY_CODE[lineId] || lineId;
      return makeRailwayIdentity(operator, code);
    }

    // 解析内部线路 key 为 ODPT Railway code（带别名）
    function resolveRailwayCode(operator, railway) {
      var code = LINE_RAILWAY_CODE[railway] || railway;
      var identity = makeRailwayIdentity(operator, code);
      return identity ? identity.odptRailway : null;
    }
    // ========== API Rate Limiting ==========
    // 为每个API服务维护请求队列，确保不超过频率限制
    var API_RATE_LIMIT = (window.RuntimeConfig && window.RuntimeConfig.API_RATE_LIMIT) || 150;   // v4.3.395: 最小请求间隔（毫秒）。实测 ODPT 12 并发无间隔全 200（总耗时 248ms），原 1000ms 串行把等待放大 40 倍
    var API_MAX_CONCURRENCY = (window.RuntimeConfig && window.RuntimeConfig.API_MAX_CONCURRENCY) || 3;  // 每域最大并发（滑动窗口）
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
                    signal: AbortSignal.timeout(8000)
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
                    signal: AbortSignal.timeout(8000)
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

    // Existing ODPT client also owns the optional server-side TrainRun cache.
    // It is a read-through optimization, not a second timetable authority.
    var TRAIN_RUN_CACHE_ENDPOINT = "https://pnupwfmgbtxqhpzsrhfn.supabase.co/functions/v1/train-runs";
    var _trainRunCache = {};
    var _trainRunInflight = {};
    function _serviceDateJst() {
        var now = new Date();
        var parts = new Intl.DateTimeFormat("en-CA", {
            timeZone:"Asia/Tokyo", year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", hourCycle:"h23"
        }).formatToParts(now), p={};
        parts.forEach(function(x){ if(x.type!=="literal") p[x.type]=x.value; });
        var y=Number(p.year), m=Number(p.month), d=Number(p.day);
        if(Number(p.hour)<4) {
            var prev=new Date(Date.UTC(y,m-1,d)-86400000);
            return prev.toISOString().slice(0,10);
        }
        return p.year+"-"+p.month+"-"+p.day;
    }
    function _trainRunToTimetable(run) {
        return {
            "@id":"supabase:TrainRun:"+run.id,
            "odpt:trainNumber":run.train_number||"",
            "odpt:railway":run.network_key && String(run.network_key).indexOf("odpt.Railway:")===0 ? run.network_key : "odpt.Railway:" + String(run.operator||LINE_TO_OPERATOR[run.line_id]||"") + "." + String(run.network_key||LINE_RAILWAY_CODE[run.line_id]||run.line_id||""),
            "odpt:calendar":({
                weekday:"odpt.Calendar:Weekday",
                saturday:"odpt.Calendar:Saturday",
                sunday:"odpt.Calendar:Sunday",
                holiday:"odpt.Calendar:Holiday",
                saturday_holiday:"odpt.Calendar:SaturdayHoliday"
            })[run.calendar_type] || "",
            "_operationCode":run.operation_code||"",
            "odpt:railDirection":run.rail_direction||"",
            "odpt:trainType":run.train_type||"",
            "odpt:destinationStation":run.destination_station?[run.destination_station]:[],
            "odpt:trainTimetableObject":(run.stops||[]).map(function(s){
                var o={};
                if(s.arrival_time) o["odpt:arrivalTime"]=String(s.arrival_time).slice(0,5);
                if(s.departure_time) o["odpt:departureTime"]=String(s.departure_time).slice(0,5);
                if(s.station_urn) {
                    if(s.arrival_time) o["odpt:arrivalStation"]=s.station_urn;
                    if(s.departure_time || !s.arrival_time) o["odpt:departureStation"]=s.station_urn;
                }
                return o;
            }),
            _positionSource:"supabase-train-run"
        };
    }
    function getCachedTrainRuns(lineId) {
        // An ODPT timetable-capable operator already has a direct API path.
        // The database fallback is only for operators without this capability.
        var apiOperator = LINE_TO_OPERATOR[lineId];
        if (apiOperator && ODPT_ENDPOINTS[apiOperator] && ODPT_ENDPOINTS[apiOperator].trainTimetable) {
            return Promise.resolve([]);
        }
        var serviceDate=_serviceDateJst(), key=lineId+"|"+serviceDate, hit=_trainRunCache[key];
        if(hit && Date.now()-hit.at<30000) return Promise.resolve(hit.rows);
        if(_trainRunInflight[key]) return _trainRunInflight[key];
        var url=TRAIN_RUN_CACHE_ENDPOINT+"?line_id="+encodeURIComponent(lineId)+"&service_date="+encodeURIComponent(serviceDate);
        _trainRunInflight[key]=fetch(url,{credentials:"omit"}).then(function(r){
            if(!r.ok) throw new Error("TrainRun cache HTTP "+r.status);
            return r.json();
        }).then(function(body){
            var rows=(body&&body.complete&&Array.isArray(body.runs))?body.runs.map(_trainRunToTimetable):[];
            _trainRunCache[key]={at:Date.now(),rows:rows};
            return rows;
        }).catch(function(){ return []; }).finally(function(){ delete _trainRunInflight[key]; });
        return _trainRunInflight[key];
    }

    // Operators are activated by the train detail view. Keeping this set here
    // lets lazy pages poll only data the user has actually requested.
    var _activeRealtimeOperators = {};
    var _activatedRealtimeLines = {};
    var _realtimeActivationInflight = {};

    // ========== Public API ==========
    window.ODPTClient = {
        ENDPOINTS: ODPT_ENDPOINTS,
        LINE_TO_OPERATOR: LINE_TO_OPERATOR,
        LINE_RAILWAY_CODE: LINE_RAILWAY_CODE,
        makeRailwayIdentity: makeRailwayIdentity,
        parseRailwayIdentity: parseRailwayIdentity,
        getLineRailwayIdentity: getLineRailwayIdentity,
        getApiKey: getApiKey,
        getApiLinks: getApiLinks,
        keysConfigured: keysConfigured,
        validateAuthoritativeRealtimeConfig: validateAuthoritativeRealtimeConfig,
        getCachedTrainRuns: getCachedTrainRuns,

        clearRealtimeLines: function() {
            Object.keys(_activeRealtimeOperators).forEach(function(op) { delete _activeRealtimeOperators[op]; });
        },

        activateRealtimeLines: function(lineIds) {
            lineIds = Array.isArray(lineIds) ? lineIds : [lineIds];
            var self = this;
            var timetablePromises = [];
            var newlyActivatedOps = {};
            var requestedOps = {};
            lineIds.forEach(function(lineId) {
                var requestedOp = LINE_TO_OPERATOR[lineId];
                if (requestedOp && ODPT_ENDPOINTS[requestedOp] && ODPT_ENDPOINTS[requestedOp].train) requestedOps[requestedOp] = true;
            });
            // This API represents the current detail scope, not an append-only history.
            // Keep polling only operators required by the currently open line/system.
            Object.keys(_activeRealtimeOperators).forEach(function(op) {
                if (!requestedOps[op]) delete _activeRealtimeOperators[op];
            });

            lineIds.forEach(function(lineId) {
                var op = LINE_TO_OPERATOR[lineId];
                var identity = getLineRailwayIdentity(lineId);
                if (!op || !identity) return;

                if (ODPT_ENDPOINTS[op] && ODPT_ENDPOINTS[op].train && !_activeRealtimeOperators[op]) {
                    _activeRealtimeOperators[op] = true;
                    newlyActivatedOps[op] = true;
                }

                // A line already activated in this page lifecycle has its timetable
                // in ODPT_TIMETABLES/_timetableCache. Do not repeat merge work.
                if (_activatedRealtimeLines[lineId]) return;
                if (_realtimeActivationInflight[lineId]) {
                    timetablePromises.push(_realtimeActivationInflight[lineId]);
                    return;
                }
                if (ODPT_ENDPOINTS[op] && ODPT_ENDPOINTS[op].trainTimetable) {
                    _realtimeActivationInflight[lineId] = self.getCompleteTimetable(op, identity.odptRailway).then(function(rows) {
                        if (!window.ODPT_TIMETABLES) window.ODPT_TIMETABLES = {};
                        var existing = window.ODPT_TIMETABLES[op] || [];
                        var keep = existing.filter(function(tt) {
                            var actual = parseRailwayIdentity(tt);
                            return !(actual && actual.key === identity.key);
                        });
                        window.ODPT_TIMETABLES[op] = keep.concat(rows || []);
                        _activatedRealtimeLines[lineId] = true;
                    }).catch(function(e) {
                        console.debug("[ODPT] on-demand timetable skip:", lineId, e && e.message);
                    }).finally(function() {
                        delete _realtimeActivationInflight[lineId];
                    });
                    timetablePromises.push(_realtimeActivationInflight[lineId]);
                }
            });

            // Opening another line of an already-active operator must not trigger
            // another operator-wide Train fetch. The 30s poll already owns refresh.
            var newOps = Object.keys(newlyActivatedOps);
            return Promise.all(timetablePromises).then(function() {
                return newOps.length ? loadRealtimeData(false, newOps, true) : Promise.resolve();
            });
        },

        // 获取运行情报/延误信息
        getTrainInformation: function(operator) {
            return fetchODPT(buildUrl(operator, 'trainInformation')).then(extractData);
        },

        // 获取列车实时位置。这里故意只按 operator 拉取，不按预设 railway code 过滤：
        // API 实际返回 identity 是事实源；LINE_RAILWAY_CODE 只能用于查询优化/本地映射。
        getTrainPositions: function(operator) {
            return fetchODPT(buildUrl(operator, 'train')).then(extractData);
        },

        assessRealtimeFullCandidate: function(lineId, history) {
            var samples = Array.isArray(history) ? history : [];
            var usable = samples.filter(function(s) { return s && s.lineId === lineId && s.ok && s.matchedCount > 0; });
            var minSamples = 3;
            var reasons = [];
            if (usable.length < minSamples) reasons.push("insufficient-samples");
            usable.forEach(function(s) {
                if (s.locationCoverage !== 1) reasons.push("incomplete-location-fields");
                if (s.trainNumberCoverage !== 1) reasons.push("incomplete-train-number-fields");
                if (Object.keys(s.directionCounts || {}).length < 2) reasons.push("direction-coverage-unproven");
            });
            reasons = reasons.filter(function(v, i, a) { return a.indexOf(v) === i; });
            return {
                lineId: lineId,
                sampleCount: usable.length,
                candidate: usable.length >= minSamples && reasons.length === 0,
                reasons: reasons,
                minSamples: minSamples
            };
        },

        // 盲查/诊断：枚举 operator 实际返回的 railway identity，并与本地预设反向比较。
        // 不改变生产映射，不猜别名；用于发现“API 有数据但预设 code 错/缺”的情况。
        // Inspect one requested line against the operator-wide realtime snapshot.
        // This never guesses by station overlap: only the exact ODPT railway identity
        // admitted for the line is counted. It is intentionally diagnostic while the
        // line remains HYBRID; promote to FULL only after observed coverage is proven.
        auditRealtimeLine: function(lineId, rows) {
            var expected = getLineRailwayIdentity(lineId);
            var operator = LINE_TO_OPERATOR[lineId] || "";
            var data = Array.isArray(rows) ? rows :
                ((window.ODPT_TRAIN_POSITIONS && window.ODPT_TRAIN_POSITIONS[operator]) || []);
            if (!expected) return { lineId: lineId, ok: false, reason: "missing-line-identity", rowCount: 0, matchedRows: [] };
            var matched = data.filter(function(t) {
                var actual = parseRailwayIdentity(t);
                return !!(actual && actual.key === expected.key);
            });
            var directionCounts = {};
            var locatedCount = 0;
            var numberedCount = 0;
            matched.forEach(function(t) {
                var dir = t["odpt:railDirection"] || "";
                if (dir) directionCounts[dir] = (directionCounts[dir] || 0) + 1;
                if (t["odpt:fromStation"] || t["odpt:toStation"]) locatedCount++;
                if (t["odpt:trainNumber"]) numberedCount++;
            });
            return {
                lineId: lineId,
                operator: operator,
                expectedIdentity: expected.odptRailway,
                observedAt: new Date().toISOString(),
                ok: matched.length > 0,
                rowCount: data.length,
                matchedCount: matched.length,
                numberedCount: numberedCount,
                locatedCount: locatedCount,
                locationCoverage: matched.length ? locatedCount / matched.length : 0,
                trainNumberCoverage: matched.length ? numberedCount / matched.length : 0,
                directionCounts: directionCounts,
                matchedRows: matched.map(function(t) {
                    return {
                        trainNumber: t["odpt:trainNumber"] || "",
                        trainType: t["odpt:trainType"] || "",
                        railDirection: t["odpt:railDirection"] || "",
                        fromStation: t["odpt:fromStation"] || "",
                        toStation: t["odpt:toStation"] || "",
                        delay: t["odpt:delay"] || 0
                    };
                })
            };
        },

        auditRealtimeRailwayIdentities: function(operator, rows) {
            try {
                var data = Array.isArray(rows) ? rows : [];
                var actual = {};
                data.forEach(function(t) {
                    if (!t) return;
                    var id = parseRailwayIdentity(t);
                    var raw = t["odpt:railway"] || "";
                    var key = id ? id.key : ("UNPARSED::" + raw);
                    if (!actual[key]) {
                        actual[key] = {
                            identity: id ? id.odptRailway : raw,
                            operator: id ? id.operator : "",
                            railwayCode: id ? id.railwayCode : "",
                            count: 0,
                            stations: {},
                            sampleTrainNumbers: []
                        };
                    }
                    var a = actual[key];
                    a.count++;
                    [t["odpt:fromStation"], t["odpt:toStation"]].forEach(function(st) {
                        if (st) a.stations[String(st)] = true;
                    });
                    var no = t["odpt:trainNumber"] || "";
                    if (no && a.sampleTrainNumbers.length < 5 && a.sampleTrainNumbers.indexOf(no) < 0) {
                        a.sampleTrainNumbers.push(no);
                    }
                });

                var expected = {};
                Object.keys(LINE_TO_OPERATOR).forEach(function(lineId) {
                    if (LINE_TO_OPERATOR[lineId] !== operator) return;
                    var id = getLineRailwayIdentity(lineId);
                    if (!id) return;
                    if (!expected[id.key]) expected[id.key] = { identity: id.odptRailway, lineIds: [] };
                    expected[id.key].lineIds.push(lineId);
                });

                var actualKeys = Object.keys(actual);
                var expectedKeys = Object.keys(expected);
                return {
                    operator: operator,
                    rowCount: data.length,
                    actual: actualKeys.map(function(k) {
                        var a = actual[k];
                        return {
                            identity: a.identity,
                            operator: a.operator,
                            railwayCode: a.railwayCode,
                            count: a.count,
                            stationCount: Object.keys(a.stations).length,
                            sampleTrainNumbers: a.sampleTrainNumbers
                        };
                    }),
                    unexpectedActual: actualKeys.filter(function(k) { return !expected[k]; }).map(function(k) { return actual[k].identity; }),
                    expectedWithoutCurrentRows: expectedKeys.filter(function(k) { return !actual[k]; }).map(function(k) {
                        return { identity: expected[k].identity, lineIds: expected[k].lineIds };
                    })
                };
            } catch(e) {
                return { operator: operator, rowCount: 0, actual: [], unexpectedActual: [], expectedWithoutCurrentRows: [], error: e.message };
            }
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
            // “能力不可用”不是“source 成功返回空数组”。使用 reject 保留 UNKNOWN/ERROR
            // 语义；现有调用链均已有 rejection fallback，不会把不可用状态写成 TT_EMPTY。
            if (!ep || !ep.trainTimetable) {
                return Promise.reject(new Error("TrainTimetable endpoint unavailable: " + operator));
            }
            var key = getApiKey(ep.base);
            if (!key) {
                return Promise.reject(new Error("ODPT API key unavailable for: " + operator));
            }
            // railway格式: "odpt.Railway:TokyoMetro.Ginza" 或 "Ginza"
            var railwayParam = railway.indexOf('odpt.Railway:') === 0 ? railway : resolveRailwayCode(operator, railway);
            var url = ep.base + 'odpt:TrainTimetable?odpt:operator=odpt.Operator:' + operator + '&odpt:railway=' + railwayParam + '&acl:consumerKey=' + key;
            if (opts && opts.calendar) url += '&odpt:calendar=' + opts.calendar;
            return fetchODPT(url).then(extractData);
        },

        // v4.3.589: 完整时刻表（搜索按需查询用）——单请求 ≥1000 条（ODPT 截断信号）时
        // 按日历拆分合并，避免缺班次；内存缓存复用，同线并发只发一次请求。
        // v4.3.9xx (E3+E5): 缓存优先——ODPT_TIMETABLES 已含 IDB 缓存/全量加载数据时零请求
        // （home 搜索经 lazy 模式轻量读 IDB 后命中；trains 全量加载后命中）
        getCompleteTimetable: function(operator, railway) {
            var requestedIdentity = railway.indexOf('odpt.Railway:') === 0 ? parseRailwayIdentity(railway) : makeRailwayIdentity(operator, LINE_RAILWAY_CODE[railway] || railway);
            if (!requestedIdentity) return Promise.resolve([]);
            var ck = requestedIdentity.key;
            if (this._timetableCache[ck]) return Promise.resolve(this._timetableCache[ck]);
            var cachedRows = this._getLocalTimetableRows(operator, railway);
            if (cachedRows && cachedRows.length > 0) {
                this._timetableCache[ck] = cachedRows;
                return Promise.resolve(cachedRows);
            }
            if (this._timetableInflight[ck]) return this._timetableInflight[ck];
            var self = this;
            this._timetableInflight[ck] = this.getTimetableForRailway(operator, railway).then(function(data) {
                var rows = (data && data.length > 0) ? data : [];
                if (rows.length >= ((window.RuntimeConfig && window.RuntimeConfig.TT_TRUNCATE_LIMIT) || 1000)) {
                    return splitTruncatedByCalendar(operator, railway).then(function(merged) {
                        var final = merged.length > rows.length ? merged : rows;
                        self._timetableCache[ck] = final;
                        return final;
                    }, function() { self._timetableCache[ck] = rows; return rows; });
                }
                self._timetableCache[ck] = rows;
                return rows;
            }).finally(function() { delete self._timetableInflight[ck]; });
            return this._timetableInflight[ck];
        },

        // 时刻表缓存（避免重复请求）
        _timetableCache: {},
        _timetableInflight: {},

        // 获取缓存的时刻表（按线路）
        getCachedTimetable: function(operator, railway) {
            var identity = railway.indexOf('odpt.Railway:') === 0 ? parseRailwayIdentity(railway) : makeRailwayIdentity(operator, LINE_RAILWAY_CODE[railway] || railway);
            return identity ? (this._timetableCache[identity.key] || null) : null;
        },

        // E3+E5: 从已加载的 ODPT_TIMETABLES（IDB 缓存/全量加载产物）按线过滤——命中则搜索零请求
        _getLocalTimetableRows: function(operator, railway) {
            try {
                var local = window.ODPT_TIMETABLES && window.ODPT_TIMETABLES[operator];
                if (!local || !Array.isArray(local) || local.length === 0) return null;
                var expected = railway.indexOf('odpt.Railway:') === 0 ? parseRailwayIdentity(railway) : makeRailwayIdentity(operator, LINE_RAILWAY_CODE[railway] || railway);
                if (!expected) return null;
                var rows = local.filter(function(tt) {
                    if (!tt) return false;
                    var actual = parseRailwayIdentity(tt);
                    return !!(actual && actual.key === expected.key);
                });
                return rows.length > 0 ? rows : null;
            } catch(e) { return null; }
        },

        // 缓存时刻表
        cacheTimetable: function(operator, railway, data) {
            var identity = railway.indexOf('odpt.Railway:') === 0 ? parseRailwayIdentity(railway) : makeRailwayIdentity(operator, LINE_RAILWAY_CODE[railway] || railway);
            if (identity) this._timetableCache[identity.key] = data;
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

    // ========== Timetable Cache (IndexedDB primary, localStorage fallback) ==========
    // v4.3.534: 存储从 localStorage 迁移到 IndexedDB——全量时刻表压缩后 5-10MB，localStorage
    // 5-10MB 配额会触顶（曾触发 partial 降级丢数据），且 JSON.stringify 大对象同步执行会阻塞主线程。
    // IndexedDB 异步写入、容量 GB 级；localStorage 保留为隐私模式/禁用 IDB 时的兜底。
    var TIMETABLE_CACHE_KEY = 'odpt_timetable_cache_v6';
    // 缓存 key / TTL / 轮询间隔统一由 RuntimeConfig 提供（见 data/core/runtime-config.js）
    var LEGACY_LS_CACHE_KEY = (window.RuntimeConfig && window.RuntimeConfig.ODPT_LEGACY_LS_CACHE_KEY) || 'odpt_timetable_cache_v3';
    var TIMETABLE_CACHE_TTL = (window.RuntimeConfig && window.RuntimeConfig.ODPT_TIMETABLE_CACHE_TTL) || 86400000;
    var IDB_DB_NAME = 'pixel-tetsudo';
    var IDB_STORE = 'odpt_cache';
    var _idbDbPromise = null;

    function _idbOpen() {
        if (_idbDbPromise) return _idbDbPromise;
        _idbDbPromise = new Promise(function(resolve, reject) {
            try {
                if (!window.indexedDB) { reject(new Error('IndexedDB unavailable')); return; }
                var req = window.indexedDB.open(IDB_DB_NAME, 1);
                req.onupgradeneeded = function(e) {
                    var db = e.target.result;
                    if (!db.objectStoreNames.contains(IDB_STORE)) {
                        db.createObjectStore(IDB_STORE);
                    }
                };
                req.onsuccess = function(e) { resolve(e.target.result); };
                req.onerror = function(e) { reject(e.target.error || new Error('IDB open failed')); };
                req.onblocked = function() { reject(new Error('IDB blocked')); };
            } catch(e) { reject(e); }
        });
        // 失败后重置，允许下次重试（如用户稍后解除隐私模式）
        _idbDbPromise = _idbDbPromise.catch(function(err) { _idbDbPromise = null; throw err; });
        return _idbDbPromise;
    }
    function _idbGet(key) {
        return _idbOpen().then(function(db) {
            return new Promise(function(resolve, reject) {
                try {
                    var tx = db.transaction(IDB_STORE, 'readonly');
                    var req = tx.objectStore(IDB_STORE).get(key);
                    req.onsuccess = function() { resolve(req.result); };
                    req.onerror = function() { reject(req.error); };
                } catch(e) { reject(e); }
            });
        });
    }
    function _idbSet(key, value) {
        return _idbOpen().then(function(db) {
            return new Promise(function(resolve, reject) {
                try {
                    var tx = db.transaction(IDB_STORE, 'readwrite');
                    tx.objectStore(IDB_STORE).put(value, key);
                    tx.oncomplete = function() { resolve(); };
                    tx.onerror = function() { reject(tx.error); };
                    tx.onabort = function() { reject(tx.error); };
                } catch(e) { reject(e); }
            });
        });
    }

    // 旧 localStorage 缓存同步读取（TTL 检查 + 解压）
    function _readLocalStorageCache(key) {
        try {
            var cached = localStorage.getItem(key);
            if (!cached) return null;
            var data = JSON.parse(cached);
            if (!data || !data.timestamp) return null;
            var age = Date.now() - data.timestamp;
            if (age > TIMETABLE_CACHE_TTL) return null;
            if (data.compressed && data.timetables) {
                return decompressTimetable(data.timetables);
            }
            return data.timetables || {};
        } catch(e) {
            console.debug("[ODPT] Failed to read localStorage cache:", e.message);
            return null;
        }
    }

    // 迁移：IndexedDB 无记录时，把未过期的旧 localStorage v3 缓存搬入 IndexedDB（避免首次重下大体积时刻表）
    function _migrateLegacyLocalStorage() {
        var legacy = _readLocalStorageCache(LEGACY_LS_CACHE_KEY);
        if (!legacy) return null;
        var compressed = compressTimetable(legacy);
        var data = { timestamp: Date.now(), timetables: compressed, compressed: true, migrated: true };
        _idbSet(TIMETABLE_CACHE_KEY, data).then(function() {
            try { localStorage.removeItem(LEGACY_LS_CACHE_KEY); } catch(e) {}
            console.debug("[ODPT] Migrated legacy localStorage cache to IndexedDB");
        }).catch(function(e) {
            console.debug("[ODPT] Legacy migration to IndexedDB failed:", e && e.message);
        });
        return legacy;
    }

    // 异步读取缓存：IndexedDB 主路径 → 旧 localStorage 迁移 → localStorage 兜底
    function loadTimetableCache() {
        return _idbGet(TIMETABLE_CACHE_KEY).then(function(record) {
            if (record && record.timestamp) {
                var age = Date.now() - record.timestamp;
                if (age > TIMETABLE_CACHE_TTL) return null;
                if (record.compressed && record.timetables) {
                    return decompressTimetable(record.timetables);
                }
                return record.timetables || {};
            }
            // 本键无记录（首次 v4）：尝试迁移旧 v3 localStorage 缓存
            return _migrateLegacyLocalStorage();
        }).catch(function(e) {
            console.debug("[ODPT] IndexedDB read failed, using localStorage:", e && e.message);
            return _readLocalStorageCache(TIMETABLE_CACHE_KEY);
        });
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
                        st: stations,
                        d: tt['odpt:destinationStation'] || []  // v4.3.932: 压缩保留 destinationStation——列车终点站（取手/我孫子/本厚木等）
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
                        'odpt:trainTimetableObject': stations,
                        'odpt:destinationStation': tt.d || []  // v4.3.932: 还原 destinationStation——列车终点站
                    };
                });
            });
            return timetables;
        } catch(e) {
            console.debug("[ODPT] Decompress error:", e.message);
            return compressed;
        }
    }

    // localStorage 兜底保存（同步，含 partial 降级）——仅当 IndexedDB 不可用时触发
    function _saveLocalStorage(compressed, data, timetables) {
        try {
            var jsonStr = JSON.stringify(data);
            console.debug("[ODPT] Timetable cache size:", (jsonStr.length / 1024 / 1024).toFixed(2), "MB");
            localStorage.setItem(TIMETABLE_CACHE_KEY, jsonStr);
            console.debug("[ODPT] Timetable cache saved to localStorage (fallback)");
            return Promise.resolve();
        } catch(e) {
            console.debug("[ODPT] Failed to save timetable cache:", e.message);
            // 如果还是太大，尝试只保存主要运营商
            try {
                var mainOps = ['JR-East', 'TokyoMetro', 'Toei', 'Tobu', 'Keio'];
                var partial = {};
                mainOps.forEach(function(op) {
                    if (timetables[op]) partial[op] = timetables[op];
                });
                var partialCompressed = compressTimetable(partial);
                var partialData = {
                    timestamp: Date.now(),
                    timetables: partialCompressed,
                    compressed: true,
                    partial: true
                };
                localStorage.setItem(TIMETABLE_CACHE_KEY, JSON.stringify(partialData));
                console.debug("[ODPT] Partial timetable cache saved to localStorage");
            } catch(e2) {
                console.debug("[ODPT] Partial cache also failed:", e2.message);
            }
            return Promise.resolve();
        }
    }

    function saveTimetableCache(timetables) {
        var compressed = compressTimetable(timetables);
        var data = { timestamp: Date.now(), timetables: compressed, compressed: true };
        // 主路径：IndexedDB 异步写入，不阻塞主线程、容量充足
        return _idbSet(TIMETABLE_CACHE_KEY, data).then(function() {
            console.debug("[ODPT] Timetable cache saved to IndexedDB:", Object.keys(timetables).length, "operators");
            // 成功后清除旧 localStorage 残留（释放配额）
            try { localStorage.removeItem(LEGACY_LS_CACHE_KEY); } catch(e) {}
        }).catch(function(e) {
            console.debug("[ODPT] IndexedDB save failed, falling back to localStorage:", e && e.message);
            return _saveLocalStorage(compressed, data, timetables);
        });
    }

    function shouldRefreshTimetables() {
        return _idbGet(TIMETABLE_CACHE_KEY).then(function(record) {
            if (record && record.timestamp) {
                return (Date.now() - record.timestamp) > TIMETABLE_CACHE_TTL;
            }
            // 本键无记录：检查旧 localStorage 缓存是否仍有效（迁移完成前）
            var legacy = null;
            try {
                var cached = localStorage.getItem(LEGACY_LS_CACHE_KEY);
                if (cached) {
                    var d = JSON.parse(cached);
                    if (d && d.timestamp) legacy = d;
                }
            } catch(e) {}
            if (legacy) return (Date.now() - legacy.timestamp) > TIMETABLE_CACHE_TTL;
            return true;
        }).catch(function() {
            // IndexedDB 不可用：localStorage 兜底
            try {
                var cached = localStorage.getItem(TIMETABLE_CACHE_KEY);
                if (!cached) return true;
                var data = JSON.parse(cached);
                if (!data || !data.timestamp) return true;
                return (Date.now() - data.timestamp) > TIMETABLE_CACHE_TTL;
            } catch(e) {
                return true;
            }
        });
    }

    // ========== 全局数据存储 ==========
    window.ODPT_DELAY_DATA = {};       // 延误/运行情报
    window.ODPT_TRAIN_POSITIONS = {};  // 列车实时位置
    window.ODPT_TIMETABLES = {};       // 列车时刻表

    // ========== ODPT_TT_PROBED 持久化（E2: localStorage，24h 滑动 TTL） ==========
    // v4.3.9xx: probed 标记原为内存态——trains 页整页跳转后丢失，41 条 JR 地方线
    // （ODPT 无时刻表）每次切页都重新探测。落 localStorage 后切页零重复请求。
    var TT_PROBED_KEY = 'odpt_tt_probed_v1';
    var TT_PROBED_KEY = (window.RuntimeConfig && window.RuntimeConfig.ODPT_TT_PROBED_KEY) || 'odpt_tt_probed_v1';
    var TT_PROBED_TTL = (window.RuntimeConfig && window.RuntimeConfig.ODPT_TT_PROBED_TTL) || 86400000;

    function _loadProbed() {
        try {
            if (window.ODPT_TT_PROBED) return;
            var raw = localStorage.getItem(TT_PROBED_KEY);
            if (!raw) return;
            var data = JSON.parse(raw);
            if (!data || data.v !== 1 || !data.lines) return;
            if ((Date.now() - (data.ts || 0)) > TT_PROBED_TTL) return;
            window.ODPT_TT_PROBED = data.lines;
        } catch(e) {}
    }
    function _persistProbed() {
        try {
            var lines = window.ODPT_TT_PROBED || {};
            if (Object.keys(lines).length === 0) return;
            localStorage.setItem(TT_PROBED_KEY, JSON.stringify({ v: 1, ts: Date.now(), lines: lines }));
        } catch(e) {}
    }
    _loadProbed();

    // ========== ODPT_TT_EMPTY 空线标记（v4.3.995: 与 probed 分离） ==========
    // probed 语义="探测过"（有数据线也会标记，缓存过期时需重拉数据不能跳过）；
    // EMPTY 专门记录"ODPT 无数据/失败"的空线（JR 地方线 83 条大部分无 TrainTimetable），
    // 全量拉取 collectTimetableByRailway 跳过空线——91 请求 → 只拉有数据的 ~51 线，
    // 弱网下首屏等待显著缩短（配合 24h TTL，用户每天最多一次全量）。
    var TT_EMPTY_KEY = 'odpt_tt_empty_v1';
    var TT_EMPTY_TTL = 86400000 * 7;  // 7天（空线判定长期稳定，改点才可能新增时刻表）
    function _loadEmpty() {
        try {
            if (window.ODPT_TT_EMPTY) return;
            var raw = localStorage.getItem(TT_EMPTY_KEY);
            if (!raw) return;
            var data = JSON.parse(raw);
            if (!data || data.v !== 1 || !data.lines) return;
            if ((Date.now() - (data.ts || 0)) > TT_EMPTY_TTL) return;
            window.ODPT_TT_EMPTY = data.lines;
        } catch(e) {}
    }
    function _persistEmpty() {
        try {
            var lines = window.ODPT_TT_EMPTY || {};
            if (Object.keys(lines).length === 0) return;
            localStorage.setItem(TT_EMPTY_KEY, JSON.stringify({ v: 1, ts: Date.now(), lines: lines }));
        } catch(e) {}
    }
    _loadEmpty();

    // ========== 原始实时数据落盘 + stale-while-revalidate（E4: 切页零空窗） ==========
    // v4.3.9xx: 页面整页跳转后，新页 loadRealtimeData 需 ~2-4s 拉完所有 operator 才推送，
    // 期间 UI 显示「情報取得中」。方案：每次拉取成功后立即把原始 delay/positions 写入
    // RTCache（IDB，key=rawDelay/rawPositions，带 ts）；新页启动先读缓存（30s 内新鲜）
    // 立即渲染，再后台拉新数据覆盖——stale-while-revalidate。
    // 注意：RTCache 的 positions/delayInfo 两键被 data-fusion 融合后数据占用（lineId 级），
    // 这里用独立 raw 键（operator 级原始数据），互不覆盖。
    var RAW_REALTIME_FRESH_MS = 30000;  // 缓存新鲜窗口（与 30s 轮询同周期）
    var FUSION_READY_WAIT_MS = 15000;
    var _fusionWaiters = {};

    function waitForFusion(key, ready, run) {
        if (ready()) {
            delete _fusionWaiters[key];
            run();
            return;
        }
        var existing = _fusionWaiters[key];
        if (existing) return;
        var startedAt = Date.now();
        function tick() {
            if (ready()) {
                delete _fusionWaiters[key];
                run();
                return;
            }
            if ((Date.now() - startedAt) >= FUSION_READY_WAIT_MS) {
                delete _fusionWaiters[key];
                console.debug("[ODPT] readiness wait expired:", key);
                return;
            }
            _fusionWaiters[key] = setTimeout(tick, document.hidden ? 1000 : 300);
        }
        _fusionWaiters[key] = setTimeout(tick, document.hidden ? 1000 : 300);
    }

    function persistRawRealtime(delayOnly) {
        try {
            if (!window.RTCache || !window.RTCache.put) return;
            window.RTCache.put('rawDelay', { ts: Date.now(), data: window.ODPT_DELAY_DATA });
            // 位置仅在非惰性模式写——lazy（home）不拉 positions，写空会覆盖 trains 页刚落的真实位置
            if (!delayOnly) {
                window.RTCache.put('rawPositions', { ts: Date.now(), data: window.ODPT_TRAIN_POSITIONS });
            }
        } catch(e) { console.debug("[ODPT] persistRawRealtime error:", e.message); }
    }

    // 新页启动：读缓存（新鲜才用）→ 填充全局 → DataFusion 就绪后立即推送（重试等待）
    function loadRawRealtimeCache() {
        try {
            if (!window.RTCache || !window.RTCache.get) return Promise.resolve();
            return Promise.all([
                window.RTCache.get('rawDelay'),
                window.RTCache.get('rawPositions')
            ]).then(function(results) {
                var now = Date.now();
                var delayRec = results[0], posRec = results[1];
                var delayFresh = !!(delayRec && delayRec.ts && (now - delayRec.ts) <= RAW_REALTIME_FRESH_MS && delayRec.data && typeof delayRec.data === 'object');
                var posFresh = !!(posRec && posRec.ts && (now - posRec.ts) <= RAW_REALTIME_FRESH_MS && posRec.data && typeof posRec.data === 'object');
                if (delayFresh) window.ODPT_DELAY_DATA = delayRec.data;
                if (posFresh) {
                    window.ODPT_TRAIN_POSITIONS = posRec.data;
                }
                if (delayFresh || posFresh) pushCachedRealtime(delayFresh, posFresh);
            }).catch(function(e) {
                console.debug("[ODPT] loadRawRealtimeCache error:", e.message);
            });
        } catch(e) { return Promise.resolve(); }
    }

    function pushCachedRealtime(hasDelay, hasPositions) {
        waitForFusion("cached-realtime", function() {
            return !!(window.DataFusion && window.DataFusion.updateOdptData);
        }, function() {
            try {
                if (hasDelay) window.DataFusion.updateOdptData(window.ODPT_DELAY_DATA);
                if (hasPositions && window.DataFusion.loadTrainPositions && Object.keys(window.ODPT_TRAIN_POSITIONS).length > 0) {
                    window.DataFusion.loadTrainPositions();
                }
            } catch(e) { console.debug("[ODPT] cached realtime push error:", e.message); }
        });
    }

    window.addEventListener("pt:railway-ready", function() {
        if (!window.DataFusion || !window.DataFusion.updateOdptData) return;
        try {
            if (window.ODPT_DELAY_DATA) window.DataFusion.updateOdptData(window.ODPT_DELAY_DATA);
            if (window.DataFusion.loadTrainPositions &&
                window.ODPT_TRAIN_POSITIONS &&
                Object.keys(window.ODPT_TRAIN_POSITIONS).length > 0) {
                window.DataFusion.loadTrainPositions._calibrated = false;
                window.DataFusion.loadTrainPositions();
            }
        } catch(e) {
            console.debug("[ODPT] railway-ready realtime push error:", e.message);
        }
    });

    // ========== 加载实时数据（延误信息 + 实时位置）==========
    // 每30秒刷新一次
    // v4.3.590: delayOnly=true 时只拉运行情报/延误（惰性模式首页搜索徽章用），跳过列车位置与时刻表
    /**
     * Guard authoritative realtime policy against endpoint/config drift.
     * Forward direction is strict: every authoritative line must resolve to an
     * operator whose active runtime endpoint actually exposes odpt:Train.
     * Reverse direction is intentionally not enforced because endpoint support
     * does not imply complete line coverage.
     *
     * Invalid entries are disabled in-place (fail-open to timetable fallback)
     * instead of leaving the line with no position source.
     */
    function validateAuthoritativeRealtimeConfig() {
        var cfg = window.RuntimeConfig && window.RuntimeConfig.AUTHORITATIVE_REALTIME_LINES;
        if (!cfg) return { ok: true, checked: 0, invalid: [] };

        var invalid = [];
        var checked = 0;
        Object.keys(cfg).forEach(function(lineId) {
            if (!cfg[lineId]) return;
            checked++;
            var operator = LINE_TO_OPERATOR[lineId] || null;
            var ep = operator && ODPT_ENDPOINTS[operator];
            if (!operator || !ep || !ep.train) {
                invalid.push({
                    lineId: lineId,
                    operator: operator,
                    reason: !operator ? "missing-operator" : (!ep ? "missing-endpoint" : "train-endpoint-disabled")
                });
                cfg[lineId] = false;
            }
        });

        if (invalid.length) {
            console.warn("[ODPT] authoritative realtime config downgraded:", invalid);
        }
        return { ok: invalid.length === 0, checked: checked, invalid: invalid };
    }

    function loadRealtimeData(delayOnly, positionOperators, skipDelayRefresh) {
        validateAuthoritativeRealtimeConfig();
        if (!skipDelayRefresh || !window.ODPT_DELAY_DATA) window.ODPT_DELAY_DATA = {};
        // Position snapshots are retained per operator. On-demand refresh must
        // not erase another already-active operator before its own poll runs.
        if (!window.ODPT_TRAIN_POSITIONS || !positionOperators) window.ODPT_TRAIN_POSITIONS = {};
        // 注意：不清空 ODPT_TIMETABLES，时刻表使用缓存

        var ops = Object.keys(ODPT_ENDPOINTS);
        var positionOps = positionOperators && positionOperators.length ? positionOperators : ops;
        var loaded = { delay: 0, positions: 0 };
        var delayPromises = [], posPromises = [];

        ops.forEach(function(op) {
            var ep = ODPT_ENDPOINTS[op];

            // 1. 加载运行情报/延误信息（优先推送，首屏不等列车位置）
            if (!skipDelayRefresh && ep.trainInformation) {
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

            // 2. 加载列车实时位置（第二推送，不阻塞延误首屏；delayOnly 模式跳过）
            if (!delayOnly && ep.train && positionOps.indexOf(op) >= 0) {
                posPromises.push(
                    fetchODPT(buildUrl(op, 'train')).then(extractData).then(function(data) {
                        // v4.3.392: 成功即写入（空数组也写入），失败不拖垮全局推送
                        window.ODPT_TRAIN_POSITIONS[op] = (data && data.length > 0) ? data : [];
                        loaded.positions++;
                        // Explicit Yamanote baseline probe: record only exact
                        // JR-East.Yamanote rows; never classify other JR-East rows
                        // by station overlap or line length.
                        if (op === "JR-East" && LINE_TO_OPERATOR.Yamanote === op && _activeRealtimeOperators[op] && window.ODPTClient && window.ODPTClient.auditRealtimeLine) {
                            window.ODPT_REALTIME_AUDIT = window.ODPT_REALTIME_AUDIT || {};
                            var audit = window.ODPTClient.auditRealtimeLine("Yamanote", window.ODPT_TRAIN_POSITIONS[op]);
                            var history = window.ODPT_REALTIME_AUDIT.YamanoteHistory || [];
                            history.push(audit);
                            if (history.length > 10) history.shift();
                            window.ODPT_REALTIME_AUDIT.Yamanote = audit;
                            window.ODPT_REALTIME_AUDIT.YamanoteHistory = history;
                            window.ODPT_REALTIME_AUDIT.YamanoteFullCandidate =
                                window.ODPTClient.assessRealtimeFullCandidate("Yamanote", history);
                        }
                    }).catch(function(e) {
                        window.ODPT_TRAIN_POSITIONS[op] = null;
                        console.debug("[ODPT] " + op + " train positions fetch failed:", e && e.message);
                    })
                );
            }
        });

        // v4.3.394: 延误信息全部就绪后立即推送（首屏 5-15s → 2-4s）；
        // 列车位置随后补齐。加载期间 UI 显示「情報取得中」，不再把等待期伪装成「正常」。
        function pushDelay() {
            waitForFusion("delay", function() {
                return !!(window.DataFusion && window.DataFusion.updateOdptData);
            }, function() {
                try {
                    window.DataFusion.updateOdptData(window.ODPT_DELAY_DATA);
                } catch(e) { console.debug("[ODPT] delay push error:", e.message); }
                console.debug("[ODPT] Realtime delay loaded:", loaded.delay, "operators");
            });
        }
        function pushAll() {
            waitForFusion("all", function() {
                return !!(window.DataFusion && window.DataFusion.updateOdptData);
            }, function() {
                try {
                    window.DataFusion.updateOdptData(window.ODPT_DELAY_DATA);
                    if (window.DataFusion.loadTrainPositions) {
                        window.DataFusion.loadTrainPositions();
                    }
                } catch(e) { console.debug("[ODPT] DataFusion push error:", e.message); }
                console.debug("[ODPT] Realtime loaded - delay:", loaded.delay,
                            "operators, positions:", loaded.positions, "operators");
            });
        }
        // v4.3.415: 列车位置推送与延误情报解耦——位置数据不等待 delayPromises 完成
        // （TrainInformation 任一 operator 慢/超时会卡住整条 Promise 链，导致 loadTrainPositions 永不执行）
        // 同时等待 DataLayer 就绪后再分配（本地线路数据晚于 ODPT 到达时重试，不设死上限）
        function pushTrainPositions() {
            waitForFusion("positions", function() {
                if (!window.DataFusion || !window.DataFusion.loadTrainPositions) return false;
                var dl = (window.DataLayer && window.DataLayer.getAllLines) ? window.DataLayer.getAllLines() : (window.UNIFIED_LINES || {});
                return !!(dl && Object.keys(dl).length > 0);
            }, function() {
                try {
                    window.DataFusion.loadTrainPositions._calibrated = false;
                    window.DataFusion.loadTrainPositions();
                } catch(e) { console.debug("[ODPT] train positions push error:", e.message); }
                console.debug("[ODPT] Realtime positions pushed:", loaded.positions, "operators");
            });
        }

        // 延误情报独立推送；列车位置在 posPromises 就绪后推送（不阻塞、不依赖延误链）
        // v4.3.9xx (E4): 拉取完成即落盘原始数据（带 ts），供其他标签页/切页 stale-while-revalidate
        if (!skipDelayRefresh) {
            Promise.all(delayPromises).then(function() { pushDelay(); persistRawRealtime(!!delayOnly); });
        }
        if (delayOnly) return Promise.resolve();  // 惰性模式不拉位置
        return Promise.all(posPromises).then(function() { pushTrainPositions(); persistRawRealtime(false); });
    }
    // ========== 加载时刻表数据（使用本地缓存）==========
    // 每小时刷新一次，优先使用本地缓存
    function loadTimetableData(forceRefresh) {
        // 先尝试从本地缓存加载（IndexedDB 主路径，异步；失败自动回退 localStorage）
        return loadTimetableCache().then(function(cachedTimetables) {
            if (cachedTimetables && !forceRefresh) {
                console.debug("[ODPT] Using cached timetables from IndexedDB/localStorage");
                window.ODPT_TIMETABLES = cachedTimetables;
                return;
            }
            // 缓存过期或强制刷新，从API加载
            return _loadTimetableDataFromApi();
        });
    }

    // v4.3.589: 分线截断合并（模块级）——ODPT 单请求 1000 条硬上限（acl:page 实测 400 不支持分页），
    // 恰 1000 条 = 截断信号，按日历拆成多次请求合并出完整数据。
    // 实测 5 条首都圈大线截断：Yamanote 1037 / Keiyo 1127 / ChuoRapid 1087 /
    // ChuoSobuLocal 1196 / KeihinTohoku 1263（合并后全量，各日历分片均 <1000）。
    // 供全量加载（collectTimetableByRailway）与按需查询（getCompleteTimetable）共用。
    function splitTruncatedByCalendar(op, lid) {
        var CAL_SPLIT = ['odpt.Calendar:Weekday', 'odpt.Calendar:Saturday', 'odpt.Calendar:Sunday', 'odpt.Calendar:Holiday', 'odpt.Calendar:SaturdayHoliday'];
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

    // v4.3.534: 从 API 全量拉取并落缓存（原 loadTimetableData 主体，缓存读取异步化后独立成函数）
    function _loadTimetableDataFromApi() {
        console.debug("[ODPT] Loading fresh timetables from API");
        var ops = Object.keys(ODPT_ENDPOINTS);
        var loaded = 0;
        var newTimetables = {};
        var timetableLoadErrors = 0;

        // v4.3.489: JR-East 时刻表按 railway 分批拉取（ODPT 单请求 1000 条上限会把
        // 首都圈外线路截断——实测全量请求仅返回 ChuoRapid/Hachiko/Joban/Agatsuma/JobanRapid 5 线，
        // 其余 83 条 JR 线路时刻表全部丢失，导致时刻表推定无法覆盖地方线）
        function collectTimetableByRailway(op, localLineIds) {
            var batch = localLineIds.filter(function(lid) {
                // v4.3.995: 跳过已探测的空线（ODPT 无时刻表的地方线）——全量拉取 91→~51
                if (window.ODPT_TT_EMPTY && window.ODPT_TT_EMPTY[lid]) return false;
                return ODPT_ENDPOINTS[op] && ODPT_ENDPOINTS[op].trainTimetable;
            });
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
                        if (rows.length >= ((window.RuntimeConfig && window.RuntimeConfig.TT_TRUNCATE_LIMIT) || 1000)) {
                            return splitTruncatedByCalendar(op, lid).then(function(merged) {
                                return merged.length > rows.length ? merged : rows;  // 拆分失败/无增益时回退
                            });
                        }
                        return rows;
                    }).then(function(rows) {
                        // 只有成功响应才能证明 source 对该 railway 返回空数据。
                        // 网络/CORS/限流等异常不得写入 7 天 EMPTY 负缓存，否则一次瞬时失败会
                        // 被错误升级为“ODPT 无此线路时刻表”并持续屏蔽后续正常请求。
                        return { rows: rows, sourceOk: true };
                    }).catch(function() {
                        // 请求失败保持 UNKNOWN：不得持久化为“已探测”，下次刷新仍可重试。
                        timetableLoadErrors++;
                        return { rows: [], sourceOk: false };
                    }).then(function(result) {
                        var rows = result.rows || [];
                        // PROBED 只表示 source 已成功响应；失败保持 UNKNOWN。
                        if (result.sourceOk) {
                            if (!window.ODPT_TT_PROBED) window.ODPT_TT_PROBED = {};
                            window.ODPT_TT_PROBED[lid] = true;
                            _persistProbed();
                        }
                        // EMPTY 只表示“成功请求且 source 明确返回空数组”。
                        if (result.sourceOk && rows.length === 0) {
                            if (!window.ODPT_TT_EMPTY) window.ODPT_TT_EMPTY = {};
                            window.ODPT_TT_EMPTY[lid] = true;
                            _persistEmpty();
                        }
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
                    loaded++;
                }
            });
        }

        var promises = ops.map(function(op) {
            var ep = ODPT_ENDPOINTS[op];
            if (!ep.trainTimetable) return Promise.resolve();

            // v4.3.6xx: 所有运营商都按 railway 分批拉取——
            // 原来只有 JR-East 走分批，其他运营商（私铁、地铁等）全量请求被 1000 条截断，
            // 导致大部分私铁线路时刻表数据丢失，线路图上无列车位置。
            var opLineIds = [];
            Object.keys(LINE_TO_OPERATOR).forEach(function(lid) {
                if (LINE_TO_OPERATOR[lid] === op) opLineIds.push(lid);
            });
            if (opLineIds.length === 0) {
                // 没有本地线路映射的operator，回退到全量请求
                return fetchODPT(buildUrl(op, 'trainTimetable')).then(extractData).then(function(data) {
                    if (data && data.length > 0) {
                        newTimetables[op] = data;
                        window.ODPT_TIMETABLES[op] = data;
                        loaded++;
                    }
                });
            }
            return collectTimetableByRailway(op, opLineIds);
        });

        return Promise.all(promises).then(function() {
            // 只有本轮没有 source 请求失败时，才能用统一 timestamp 把聚合结果标记为完整缓存。
            // 部分成功仍保留在内存供当前页面使用，但不覆盖上一份完整持久缓存。
            if (Object.keys(newTimetables).length > 0 && timetableLoadErrors === 0) {
                return saveTimetableCache(newTimetables).then(function() {
                    console.debug("[ODPT] Timetables cached:", loaded, "operators");
                });
            }
            if (timetableLoadErrors > 0) {
                console.warn("[ODPT] Timetable refresh partial; persistent cache preserved. Failed railway requests:", timetableLoadErrors);
            }
        });
    }

    // ========== 加载所有数据（实时数据 + 时刻表）==========
    function loadAllData() {
        // v4.3.6xx: 实时数据和时刻表数据并行加载（原来串行：实时→时刻表，慢一倍）
        // 实时数据优先返回，时刻表在后台并行拉取
        // v4.3.9xx (E4): 先读原始实时缓存（stale-while-revalidate）再启动拉取——
        // 缓存命中时新页立即渲染（DataFusion 就绪后推送），拉取完成覆盖，消除切页空窗
        var realtimePromise = loadRawRealtimeCache().then(function() {
            return loadRealtimeData();
        });
        var timetablePromise = loadTimetableData(false);
        // 实时数据先resolve，时刻表不阻塞首屏
        return realtimePromise.then(function() {
            // 时刻表后台继续加载，不阻塞
            timetablePromise.catch(function(e) { console.warn("[ODPT] Timetable load error:", e.message); });
        });
    }

    // ========== 轮询生命周期（v4.3.9xx E1: visibilitychange 暂停/恢复） ==========
    // 后台标签页（document.hidden）暂停 30s 实时轮询与 5min 时刻表过期检查；
    // 回前台立即拉一次再恢复周期——多标签页下后台页不再产生无效 ODPT 请求。
    var REALTIME_INTERVAL = 30000;
    REALTIME_INTERVAL = (window.RuntimeConfig && window.RuntimeConfig.ODPT_REALTIME_INTERVAL) || REALTIME_INTERVAL;
    var TT_CHECK_INTERVAL = 300000;
    var _rtPollTimer = null;
    var _ttCheckTimer = null;
    var _lazyMode = false;

    function _realtimeRefresh() {
        var activeOps = Object.keys(_activeRealtimeOperators);
        var delayOnly = _lazyMode && activeOps.length === 0;
        loadRealtimeData(delayOnly, activeOps.length ? activeOps : null, activeOps.length > 0).catch(function(e) { console.warn("[ODPT] Realtime refresh error:", e.message); });
    }
    function startRealtimePolling() {
        if (_rtPollTimer) return;
        _rtPollTimer = setInterval(_realtimeRefresh, REALTIME_INTERVAL);
    }
    function stopRealtimePolling() {
        if (_rtPollTimer) { clearInterval(_rtPollTimer); _rtPollTimer = null; }
    }
    function startTtCheckPolling() {
        if (_ttCheckTimer) return;
        _ttCheckTimer = setInterval(function() {
            shouldRefreshTimetables().then(function(need) {
                if (need) {
                    console.debug("[ODPT] Timetable cache expired, refreshing...");
                    loadTimetableData(true).catch(function(e) { console.warn("[ODPT] Timetable refresh error:", e.message); });
                }
            }).catch(function(e) { console.debug("[ODPT] shouldRefreshTimetables check error:", e.message); });
        }, TT_CHECK_INTERVAL);
    }
    function stopTtCheckPolling() {
        if (_ttCheckTimer) { clearInterval(_ttCheckTimer); _ttCheckTimer = null; }
    }
    function handleVisibilityChange() {
        try {
            if (document.hidden) {
                stopRealtimePolling();
                stopTtCheckPolling();
            } else {
                // 回前台：立即拉一次（不等下一周期），再恢复定时器
                _realtimeRefresh();
                startRealtimePolling();
                // lazy 模式（delay-only）不建立时刻表过期检查轮询——保持首页零全量拉取
                if (!_lazyMode) startTtCheckPolling();
            }
        } catch(e) { console.debug("[ODPT] visibilitychange handler error:", e.message); }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', function(event) {
        // Mobile Chrome may restore a page from BFCache without a fresh script
        // initialization. Treat that restore as a foreground transition: fetch a
        // fresh LIVE snapshot now, while the timer guards prevent duplicate polls.
        if (!event.persisted || document.hidden) return;
        try {
            _realtimeRefresh();
            startRealtimePolling();
            if (!_lazyMode) startTtCheckPolling();
        } catch(e) { console.debug("[ODPT] pageshow refresh error:", e.message); }
    });

    // ========== Init ==========
    function init() {
        // 初始加载所有数据
        loadAllData().catch(function(e) { console.warn("[ODPT] Init error:", e.message); });

        // 实时数据每30秒刷新
        startRealtimePolling();

        // 时刻表每小时刷新（检查缓存是否过期）
        startTtCheckPolling();

        console.debug("[ODPT] Client initialized with", Object.keys(ODPT_ENDPOINTS).length, "operators");
    }

    // v4.3.395: 请求尽早发起——fetch 不依赖 DOM，脚本执行即请求，不再等 DOMContentLoaded
    // （原实现在 DOMContentLoaded 后才 init，延误请求被页面全部资源加载完才发出，白白多等数秒）
    // v4.3.589: 惰性模式——首页搜索按需查询时刻表时加载本库但跳过全量 init（loadAllData
    // 会拉全部 operator 实时/时刻表，首页首屏不可承受）；搜索模块经 getCompleteTimetable 按需拉取。
    // v4.3.590: 惰性模式仍拉延误（TrainInformation，搜索延误徽章需要）并保持 30s 刷新，
    // 仅跳过列车位置（Train）与时刻表全量（TrainTimetable）——首页请求量 500+ → ~30。
    // v4.3.9xx (E3+E5): 惰性模式追加轻量读时刻表缓存（IDB，不拉 API）——getCompleteTimetable
    // 缓存优先命中 ODPT_TIMETABLES，搜索不再重复打 API；回前台同样立即刷新延误。
    // v4.3.9xx (E4): lazy 同样先读 rawDelay 缓存再拉取——切回搜索页时延误徽章即刻显示。
    if (window.ODPT_LAZY === true) {
        console.debug("[ODPT] Lazy mode enabled - delay-only init");
        _lazyMode = true;
        loadTimetableCache().then(function(cached) {
            if (cached && Object.keys(cached).length > 0) {
                window.ODPT_TIMETABLES = cached;
            }
        }).catch(function(e) { console.debug("[ODPT] Lazy timetable cache read skip:", e.message); });
        loadRawRealtimeCache().then(function() {
            return loadRealtimeData(true);
        }).catch(function(e) { console.warn("[ODPT] Lazy delay init error:", e.message); });
        startRealtimePolling();
    } else {
        init();
    }

})();
