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

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        path = self.path.split("?")[0]
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
