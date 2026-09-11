/**
 * Pixel Tetsudo - Official Railway Provider (非 ODPT 官方源)
 * 覆盖 ODPT 未提供運行状況的线路：小田急（小田原/江ノ島/多摩）+ ゆりかもめ
 *
 * 数据通道：本地代理 /api-proxy/（官方 API 无 CORS 头，浏览器不能直连）
 * 输出结构对齐 ODPT delayInfo：{ status, text, cause, range, maxDelay, interval, updatedAt, source }
 *
 * v4.3.538: 小田急源封锁中（ODAKYU key 泄露待轮换）——parseOdakyu 在代理不可用时
 * 返回 {}，小田急 3 线走融合 fallback 显示"暂无延误情报"；ゆりかもめ不受影响。
 */
(function() {
    'use strict';

    var LINE_MAP = {
        "Odawara":       { source: "odakyu", field: "odawara",   nameJa: "小田原線" },
        "OdakyuEnoshima":{ source: "odakyu", field: "enoshima",  nameJa: "江ノ島線" },
        "OdakyuTama":    { source: "odakyu", field: "tama",      nameJa: "多摩線" },
        "Yurikamome":    { source: "yurikamome", nameJa: "ゆりかもめ" }
    };

    var CACHE_TTL = 30000; // 官方源 30 秒缓存
    var _cache = null;
    var _cacheTime = 0;

    function _fetchJson(url) {
        return fetch(url).then(function(r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.json();
        });
    }
    function _normText(s) { return String(s || "").trim(); }

    // ===== 小田急 =====
    // 输出键 = 项目线路真实 id（Odawara / OdakyuEnoshima / OdakyuTama）
    // v4.3.538: 小田急源已封锁（ODAKYU key 泄露待轮换）——代理端点删除后 res 为 null，
    // 此时返回 {}（不输出小田急键），融合链走 fallback → no_odpt → 前端"暂无延误情报"。
    // 绝不把"源不可用"伪装成 平常運転（normal）。
    function parseOdakyu(summary, detail) {
        if (!summary || !detail) return {};
        var d = (detail && detail["train_service_status_detail"]) || {};
        var title = _normText(d.hp_title);
        var fields = [["odawara", "Odawara"], ["enoshima", "OdakyuEnoshima"], ["tama", "OdakyuTama"]];
        var out = {};
        fields.forEach(function(f) {
            var txt = _normText(d["hp_influence_status_" + f[0]]);
            out[f[1]] = {
                status: txt ? "delayed" : "normal",
                text: txt ? txt : "平常運転",
                cause: title || "",
                range: txt ? txt : "全線",
                maxDelay: 0,
                interval: null,
                updatedAt: d.update_time || "",
                source: "odakyu-official"
            };
        });
        return out;
    }

    // ===== ゆりかもめ（HTML 片段 → 文本）=====
    function parseYurikamome(html) {
        var text = String(html || "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        var status = "normal";
        // v4.3.425: 收紧——仅明确"見合わせ/停止/全線運休"判中断，单独"運休"（部分运休通知）不误判
        if (/見合わせ|停止|全線運休/.test(text)) status = "suspended";
        else if (/遅延|遅れ|乱れ/.test(text)) status = "delayed";
        var m = text.match(/(\d{4}年\d{1,2}月\d{1,2}日\d{1,2}時\d{1,2}分)/);
        var titleMatch = text.match(/(平常運転|遅延|運転見合わせ|運転再開)/);
        return {
            status: status,
            text: text || "平常運転",
            cause: titleMatch ? titleMatch[1] : "",
            range: "全線",
            maxDelay: 0,
            interval: null,
            updatedAt: m ? m[1] : "",
            source: "yurikamome-official"
        };
    }

    // ===== 聚合抓取（代理）=====
    function fetchDelayInfo() {
        var now = Date.now();
        if (_cache && now - _cacheTime < CACHE_TTL) return Promise.resolve(_cache);
        return Promise.all([
            _fetchJson("/api-proxy/odakyu-status").catch(function() { return null; }),
            _fetchJson("/api-proxy/odakyu-status-detail").catch(function() { return null; }),
            fetch("/api-proxy/yurikamome-operation")
                .then(function(r) { return r.ok ? r.text() : ""; })
                .catch(function() { return ""; })
        ]).then(function(res) {
            var out = {};
            var odakyu = parseOdakyu(res[0], res[1]);  // 封锁期返回 {} → 小田急键不输出
            Object.keys(odakyu).forEach(function(k) { out[k] = odakyu[k]; });
            out["Yurikamome"] = parseYurikamome(res[2]);
            _cache = out;
            _cacheTime = now;
            return out;
        });
    }

    window.OfficialRailway = {
        LINE_MAP: LINE_MAP,
        fetchDelayInfo: fetchDelayInfo,
        parseOdakyu: parseOdakyu,
        parseYurikamome: parseYurikamome,
        CACHE_TTL: CACHE_TTL
    };
})();
