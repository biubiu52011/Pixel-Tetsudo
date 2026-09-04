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
        "T\u014dnami": "JR-East",
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
        "Yurikamome": "Yurikamome",
        "Tōnami": "JR-East"
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
    // Full per-operator train/timetable responses (consumed by DataFusion.loadTrainPositions)
    window.ODPT_TRAINS = {};

    // ========== Load all realtime data ==========
    function loadAllDelayData() {
        window.ODPT_DELAY_DATA = {};
        window.ODPT_TRAINS = {};
        var ops = Object.keys(ODPT_ENDPOINTS);
        var loaded = 0;
        var promises = ops.map(function(op) {
            return window.ODPTClient.getTrainInformation(op).then(function(data) {
                if (data && data.length > 0) {
                    window.ODPT_DELAY_DATA[op] = data[0];
                    window.ODPT_TRAINS[op] = data;
                    loaded++;
                }
            });
        });
        return Promise.all(promises).then(function() {
            // Push ODPT data into DataFusion: delay status + train positions
            try {
                if (window.DataFusion) {
                    if (window.DataFusion.updateOdptData) window.DataFusion.updateOdptData(window.ODPT_DELAY_DATA);
                    if (window.DataFusion.loadTrainPositions) window.DataFusion.loadTrainPositions();
                }
            } catch(e) { console.debug("[ODPT] DataFusion push error:", e.message); }
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
