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

    // ========== API Keys ==========
    var CHALLENGE_KEY = "gxyoc62dp9i6a4e4bhr96wqcd9bfo7i5o4d410ild6icmf079zevrlk0tjv04din";
    var CENTER_KEY = "jueja2bhf8mgsjuirxyl5x0q6sij2i67bzmr93zvg0l89o7ct8p3izl8fa0k28lz";

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
            base: "https://api.odpt.org/api/v4/",
            train: "odpt:Train?odpt:operator=odpt.Operator:Keisei",
            trainTimetable: "odpt:TrainTimetable?odpt:operator=odpt.Operator:Keisei",
            trainInformation: "odpt:TrainInformation?odpt:operator=odpt.Operator:Keisei"
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
        var key = ep.base.indexOf('api-challenge') >= 0 ? CHALLENGE_KEY : CENTER_KEY;
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
        "ChuoKonosu": "JR-East",
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
        "Isesaki": "Tobu",
        "Ishinomaki": "JR-East",
        "Ito": "JR-East",
        "Itsukaichi": "JR-East",
        "JR_Yamaguchi": "JR West",
        "Joban": "JR-East",
        "JobanLocal": "JR-East",
        "Joetsu": "JR-East",
        "Kamaishi": "JR-East",
        "Kamiishi": "JR-East",
        "Kanagawa": "JR-East",
        "Karasuyama": "JR-East",
        "Kashima": "JR-East",
        "Kawagoe": "JR-East",
        "KeihinTohoku": "JR-East",
        "Keikyu": "Keikyu",
        "KeikyuAirport": "Keikyu",
        "KeikyuKurihama": "Keikyu",
        "KeikyuMain": "Keikyu",
        "KeikyuZushi": "Keikyu",
        "Keio": "Keio",
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
        "Nikko": "Tobu",
        "Nikkoku": "Tobu",
        "Nippori_Toneri": "Toei",
        "Noda": "Tobu",
        "OdakyuEnoshima": "Odakyu",
        "OdakyuOdawara": "Odakyu",
        "OdakyuTama": "Odakyu",
        "Odawara": "Odakyu",
        "Oedo": "Toei",
        "Ofunato": "JR-East",
        "Oga": "JR-East",
        "Ogose": "Tobu",
        "Oito": "JR-East",
        "Ome": "JR-East",
        "Ominato": "JR-East",
        "Orange": "YokohamaMunicipal",
        "OuMain": "JR-East",
        "Oyama": "JR-East",
        "RikutoEast": "JR-East",
        "RikutsuWest": "JR-East",
        "Rinkai": "TWR",
        "Rinko": "TWR",
        "Ryomo": "JR-East",
        "Sagami": "JR-East",
        "Saikyo": "JR-East",
        "Sakuragi": "Keikyu",
        "Sano": "JR-East",
        "Sanriku": "JR-East",
        "SeibuChichibu": "Seibu",
        "SeibuEn": "Seibu",
        "SeibuIkebukuro": "Seibu",
        "SeibuNakagawa": "Seibu",
        "SeibuShinjuku": "Seibu",
        "SeibuTamagawa": "Seibu",
        "SeibuTamako": "Seibu",
        "SeibuToshima": "Seibu",
        "SeibuYamaguchi": "Seibu",
        "Seibu_Sayama": "Seibu",
        "Seibu_Shinjuku": "Seibu",
        "Senseki": "JR-East",
        "SensekiTohoku": "JR-East",
        "Senzan": "JR-East",
        "Shinetsu": "JR-East",
        "Shinjuku": "Toei",
        "Shinonoi": "JR-East",
        "ShonanMonorailE": "ShonanMonorail",
        "ShonanShinjuku": "JR-East",
        "Skytree": "Tobu",
        "SobuLocal": "JR-East",
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
        "Yamanote": "JR-East",
        "YokohamaBlue": "YokohamaMunicipal",
        "YokohamaGreen": "YokohamaMunicipal",
        "Yokosuka": "JR-East",
        "Yonezawa": "JR-East",
        "Yurakucho": "TokyoMetro",
        "Yurakucho_Seibu": "Seibu",
        "Yurikamome": "Yurikamome"
    };

    // ========== Fetch wrapper ==========
    function fetchODPT(url) {
        if (!url) return Promise.resolve(null);
        return fetch(url, {
            headers: { "Accept": "application/json" },
            signal: AbortSignal.timeout(15000)
        }).then(function(resp) {
            if (!resp.ok) throw new Error("HTTP " + resp.status);
            return resp.json();
        }).catch(function(e) {
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

        // 检查运营商是否支持某种API
        supports: function(operator, type) {
            var ep = ODPT_ENDPOINTS[operator];
            return !!(ep && ep[type]);
        }
    };

    // ========== 全局数据存储 ==========
    window.ODPT_DELAY_DATA = {};       // 延误/运行情报
    window.ODPT_TRAIN_POSITIONS = {};  // 列车实时位置
    window.ODPT_TIMETABLES = {};       // 列车时刻表
    // 向后兼容：合并时刻表和实时位置
    window.ODPT_TRAINS = {};

    // ========== 加载所有ODPT数据 ==========
    function loadAllData() {
        window.ODPT_DELAY_DATA = {};
        window.ODPT_TRAIN_POSITIONS = {};
        window.ODPT_TIMETABLES = {};
        window.ODPT_TRAINS = {};

        var ops = Object.keys(ODPT_ENDPOINTS);
        var loaded = { delay: 0, positions: 0, timetables: 0 };

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

            // 3. 加载列车时刻表
            if (ep.trainTimetable) {
                subPromises.push(
                    fetchODPT(buildUrl(op, 'trainTimetable')).then(extractData).then(function(data) {
                        if (data && data.length > 0) {
                            window.ODPT_TIMETABLES[op] = data;
                            // 如果没有实时位置，用时刻表填充ODPT_TRAINS（向后兼容）
                            if (!window.ODPT_TRAINS[op]) {
                                window.ODPT_TRAINS[op] = data;
                            }
                            loaded.timetables++;
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

            console.log("[ODPT] Loaded - delay:", loaded.delay,
                        "operators, positions:", loaded.positions,
                        "operators, timetables:", loaded.timetables, "operators");
        });
    }

    // ========== Init ==========
    function init() {
        loadAllData().catch(function(e) { console.warn("[ODPT] Init error:", e.message); });
        setInterval(function() {
            loadAllData().catch(function(e) { console.warn("[ODPT] Refresh error:", e.message); });
        }, 30000);
        console.log("[ODPT] Client initialized with", Object.keys(ODPT_ENDPOINTS).length, "operators");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
