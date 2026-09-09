#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pixel Tetsudo 本地服务器（替代 `python -m http.server 8017`）
- 静态文件服务：与 http.server 行为一致（http://127.0.0.1:8017/pages/home.html）
- /api-proxy/ 代理：服务端转发官方 API（小田急 / ゆりかもめ）
  官方 API 无 CORS 头，浏览器不能直连，必须经本地代理（白名单，防 SSRF）

启动：python serve.py
"""
import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import os
import hashlib
import time

PORT = 8017
ROOT = os.path.dirname(os.path.abspath(__file__))

ODAKYU_KEY = "8r7ngDW81q3qCNFVk59KB4bnazimt6TfpDOF4mB5"

# 白名单代理端点（只允许这些固定目标，防 SSRF）
PROXY_TARGETS = {
    "/api-proxy/odakyu-status": {
        "url": "https://d6oynijiy33tb.cloudfront.net/service/status/1",
        "headers": {"x-api-key": ODAKYU_KEY},
        "content_type": "application/json; charset=utf-8",
    },
    "/api-proxy/odakyu-status-detail": {
        "url": "https://d6oynijiy33tb.cloudfront.net/service/status_detail",
        "headers": {"x-api-key": ODAKYU_KEY},
        "content_type": "application/json; charset=utf-8",
    },
    "/api-proxy/yurikamome-operation": {
        "url": "https://cms-2.yurikamome.co.jp/api/operation/",
        "headers": {},
        "content_type": "text/html; charset=utf-8",
    },
}

# ---- 无需注册的翻译端点（4.3.443）----
# 目标：realtime 运行情报等日文动态文本多语言化。
# 后端：MyMemory（官方公开免费 API，无需注册）主力 + Google gtx 端点兜底（同样无需 key）。
# 两者均无 CORS 头，浏览器必须经本端点转发；白名单固定目标，防 SSRF。
# 内存缓存：同文本+语言 7 天不重复请求（30s 自动刷新 + 多卡片复用时会烧免费额度）。
_TRANSLATE_CACHE = {}
_TRANSLATE_TTL = 7 * 86400
_LANG_TARGET = {"zh": "zh-CN", "ko": "ko", "en": "en"}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/api-proxy/translate":
            self._translate()
            return
        if path in PROXY_TARGETS:
            self._proxy(path)
            return
        return super().do_GET()

    def _json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _translate(self):
        qs = urllib.parse.parse_qs(self.path.split("?", 1)[1]) if "?" in self.path else {}
        text = (qs.get("text") or [""])[0]
        lang = (qs.get("lang") or ["zh"])[0]
        if not text or not text.strip():
            self._json({"ok": False, "error": "empty text"})
            return
        if lang not in _LANG_TARGET:
            lang = "zh"
        tgt = _LANG_TARGET[lang]
        cache_key = hashlib.md5((lang + "|" + text).encode("utf-8")).hexdigest()
        now = time.time()
        if cache_key in _TRANSLATE_CACHE:
            ts, val = _TRANSLATE_CACHE[cache_key]
            if now - ts < _TRANSLATE_TTL:
                self._json({"ok": True, "translated": val, "engine": "cache"})
                return
        # 1) MyMemory（官方公开，无需注册；限 500 字符/次、匿名额度）
        try:
            url = "https://api.mymemory.translated.net/get?q=" + urllib.parse.quote(text) + "&langpair=ja|" + tgt
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8", "ignore"))
            tr = (data.get("responseData") or {}).get("translatedText") or ""
            if tr and data.get("responseStatus") == 200 and "MYMEMORY WARNING" not in tr.upper():
                _TRANSLATE_CACHE[cache_key] = (now, tr)
                self._json({"ok": True, "translated": tr, "engine": "mymemory"})
                return
        except Exception:
            pass
        # 2) Google gtx 端点兜底（无需 key；非官方，仅作 fallback）
        try:
            url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=" + tgt + "&dt=t&q=" + urllib.parse.quote(text)
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8", "ignore"))
            segs = []
            top = data[0] if isinstance(data, list) and data else None
            if isinstance(top, list):
                for seg in top:
                    if isinstance(seg, list) and seg and isinstance(seg[0], str):
                        segs.append(seg[0])
            tr = "".join(segs)
            if tr:
                _TRANSLATE_CACHE[cache_key] = (now, tr)
                self._json({"ok": True, "translated": tr, "engine": "google"})
                return
        except Exception:
            pass
        self._json({"ok": False, "error": "translate failed"}, 502)

    def _proxy(self, path):
        cfg = PROXY_TARGETS[path]
        try:
            headers = {"User-Agent": "Mozilla/5.0"}
            headers.update(cfg["headers"])
            req = urllib.request.Request(cfg["url"], headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                body = resp.read()
            self.send_response(200)
            self.send_header("Content-Type", cfg["content_type"])
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
        except Exception as e:
            self.send_response(502)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}, ensure_ascii=False).encode("utf-8"))

    def log_message(self, fmt, *args):
        # 静默访问日志（避免刷屏），保留错误
        if args and args[0] and str(args[0]).startswith("5"):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    os.chdir(ROOT)
    with socketserver.ThreadingTCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print("Pixel Tetsudo server: http://127.0.0.1:%d/pages/home.html" % PORT)
        httpd.serve_forever()
