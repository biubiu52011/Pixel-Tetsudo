/**
 * Pixel Tetsudo - Unified ODPT API Client
 * 完整 API URL（含 key）直接存储，无需分离管理。
 */
(function() {
    'use strict';

    // ========== 完整 API URL（URL + key 一体化） ==========
    var ODPT_ENDPOINTS = {
        // Challenge API
        "JR-East":     "https://api-challenge.odpt.org/api/v4/odpt:Train?odpt:operator=odpt.Operator:JR-East&acl:consumerKey=gxyoc62dp9i6a4e4bhr96wqcd9bfo7i5o4d410ild6icmf079zevrlk0tjv04din",
        "Tobu":        "https://api-challenge.odpt.org/api/v4/odpt:Train?odpt:operator=odpt.Operator:Tobu&acl:consumerKey=gxyoc62dp9i6a4e4bhr96wqcd9bfo7i5o4d410ild6icmf079zevrlk0tjv04din",
        "Keio":        "https://api-challenge.odpt.org/api/v4/odpt:TrainTimetable?odpt:operator=odpt.Operator:Keio&acl:consumerKey=gxyoc62dp9i6a4e4bhr96wqcd9bfo7i5o4d410ild6icmf079zevrlk0tjv04din",
        "Keikyu":      "https://api-challenge.odpt.org/api/v4/odpt:Train?odpt:operator=odpt.Operator:Keikyu&acl:consumerKey=gxyoc62dp9i6a4e4bhr96wqcd9bfo7i5o4d410ild6icmf079zevrlk0tjv04din",
        "Sotetsu":     "https://api-challenge.odpt.org/api/v4/odpt:Train?odpt:operator=odpt.Operator:Sotetsu&acl:consumerKey=gxyoc62dp9i6a4e4bhr96wqcd9bfo7i5o4d410ild6icmf079zevrlk0tjv04din",
        "Tokyu":       "https://api-challenge.odpt.org/api/v4/odpt:Train?odpt:operator=odpt.Operator:Tokyu&acl:consumerKey=gxyoc62dp9i6a4e4bhr96wqcd9bfo7i5o4d410ild6icmf079zevrlk0tjv04din",
        "Seibu":       "https://api-challenge.odpt.org/api/v4/odpt:TrainTimetable?odpt:operator=odpt.Operator:Seibu&acl:consumerKey=gxyoc62dp9i6a4e4bhr96wqcd9bfo7i5o4d410ild6icmf079zevrlk0tjv04din",
        "Odakyu":      "https://api-challenge.odpt.org/api/v4/odpt:TrainTimetable?odpt:operator=odpt.Operator:Odakyu&acl:consumerKey=gxyoc62dp9i6a4e4bhr96wqcd9bfo7i5o4d410ild6icmf079zevrlk0tjv04din",
        // Center API
        "TokyoMetro":  "https://api.odpt.org/api/v4/odpt:TrainTimetable?odpt:operator=odpt.Operator:TokyoMetro&acl:consumerKey=jueja2bhf8mgsjuirxyl5x0q6sij2i67bzmr93zvg0l89o7ct8p3izl8fa0k28lz",
        "Toei":        "https://api.odpt.org/api/v4/odpt:TrainTimetable?odpt:operator=odpt.Operator:Toei&acl:consumerKey=jueja2bhf8mgsjuirxyl5x0q6sij2i67bzmr93zvg0l89o7ct8p3izl8fa0k28lz",
        "YokohamaMunicipal": "https://api.odpt.org/api/v4/odpt:TrainTimetable?odpt:operator=odpt.Operator:YokohamaMunicipal&acl:consumerKey=jueja2bhf8mgsjuirxyl5x0q6sij2i67bzmr93zvg0l89o7ct8p3izl8fa0k28lz",
        "TWR":         "https://api.odpt.org/api/v4/odpt:TrainTimetable?odpt:operator=odpt.Operator:TWR&acl:consumerKey=jueja2bhf8mgsjuirxyl5x0q6sij2i67bzmr93zvg0l89o7ct8p3izl8fa0k28lz",
        "MIR":         "https://api.odpt.org/api/v4/odpt:TrainTimetable?odpt:operator=odpt.Operator:MIR&acl:consumerKey=jueja2bhf8mgsjuirxyl5x0q6sij2i67bzmr93zvg0l89o7ct8p3izl8fa0k28lz",
        "TamaMonorail":"https://api.odpt.org/api/v4/odpt:TrainTimetable?odpt:operator=odpt.Operator:TamaMonorail&acl:consumerKey=jueja2bhf8mgsjuirxyl5x0q6sij2i67bzmr93zvg0l89o7ct8p3izl8fa0k28lz",
        "Yurikamome":  "https://api.odpt.org/api/v4/odpt:TrainTimetable?odpt:operator=odpt.Operator:Yurikamome&acl:consumerKey=jueja2bhf8mgsjuirxyl5x0q6sij2i67bzmr93zvg0l89o7ct8p3izl8fa0k28lz",
        "Keisei":      "https://api.odpt.org/api/v4/odpt:TrainTimetable?odpt:operator=odpt.Operator:Keisei&acl:consumerKey=jueja2bhf8mgsjuirxyl5x0q6sij2i67bzmr93zvg0l89o7ct8p3izl8fa0k28lz",
        "MinatoMirai": "https://api.odpt.org/api/v4/odpt:TrainTimetable?odpt:operator=odpt.Operator:MinatoMirai&acl:consumerKey=jueja2bhf8mgsjuirxyl5x0q6sij2i67bzmr93zvg0l89o7ct8p3izl8fa0k28lz"
    };

    // ========== 线路 -> 运营商映射 ==========
    var LINE_TO_OPERATOR = {
        "Yamanote": "JR-East", "KeihinTohoku": "JR-East", "Yokosuka": "JR-East",
        "ChuoRapid": "JR-East", "Saikyo": "JR-East", "Joban": "JR-East",
        "SobuLocal": "JR-East", "Keiyo": "JR-East", "Musashino": "JR-East",
        "ShonanShinjuku": "JR-East", "Takasaki": "JR-East", "Nambu": "JR-East",
        "Tokaido": "JR-East", "Ome": "JR-East",
        "Ginza": "TokyoMetro", "Marunouchi": "TokyoMetro", "Hibiya": "TokyoMetro",
        "Tozai": "TokyoMetro", "Chiyoda": "TokyoMetro", "Yurakucho": "TokyoMetro",
        "Hanzomon": "TokyoMetro", "Namboku": "TokyoMetro", "Fukutoshin": "TokyoMetro",
        "Asakusa": "Toei", "Shinjuku": "Toei", "Oedo": "Toei", "Arakawa": "Toei",
        "YokohamaBlue": "YokohamaMunicipal",
        "Rinkai": "TWR", "TamaMonorail": "TamaMonorail",
        "HitachiNakaKaimin": "MIR", "TsukubaExpress": "TsukubaExpress",
        "KeikyuMain": "Keikyu", "KeikyuAirport": "Keikyu",
        "KeioMain": "Keio", "KeioInokashira": "Keio",
        "TokyuToyoko": "Tokyu", "TokyuDenEn": "Tokyu",
        "Ikebukuro": "Seibu", "SeibuShinjuku": "Seibu",
        "OdakyuOdawara": "Odakyu", "OdakyuEnoshima": "Odakyu",
        "Skytree": "Tobu", "Nikko": "Tobu", "TobuIsesaki": "Tobu",
        "Yurikamome": "Yurikamome", "MinatoMirai": "MinatoMirai"
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

        getTrainInformation: function(operator) {
            return fetchODPT(ODPT_ENDPOINTS[operator]).then(extractData);
        },

        getTimetable: function(operator) {
            return fetchODPT(ODPT_ENDPOINTS[operator]).then(extractData);
        }
    };

    // ========== Global delay data store ==========
    window.ODPT_DELAY_DATA = {};

    // ========== Load all realtime data ==========
    function loadAllDelayData() {
        window.ODPT_DELAY_DATA = {};
        var ops = Object.keys(ODPT_ENDPOINTS);
        var loaded = 0;
        var promises = ops.map(function(op) {
            return window.ODPTClient.getTrainInformation(op).then(function(data) {
                if (data && data.length > 0) {
                    window.ODPT_DELAY_DATA[op] = data[0];
                    loaded++;
                }
            });
        });
        return Promise.all(promises).then(function() {
            console.log("[ODPT] Loaded delay data for:", loaded, "operators");
        });
    }

    // ========== Init ==========
    function init() {
        loadAllDelayData().catch(function(){});
        setInterval(function() { loadAllDelayData().catch(function(){}); }, 30000);
        console.log("[ODPT] Client initialized with", Object.keys(ODPT_ENDPOINTS).length, "endpoints");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
