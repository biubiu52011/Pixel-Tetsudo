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

# v4.3.534: API key 不再硬编码入库。读取顺序：环境变量 ODAKYU_API_KEY →
# .work/serve.env（本地文件，已被 .gitignore 排除）→ 未配置（代理返回 503 提示）。
def _load_odakyu_key():
    env = os.environ.get("ODAKYU_API_KEY")
    if env:
        return env.strip()
    env_path = os.path.join(ROOT, ".work", "serve.env")
    try:
        # utf-8-sig 兼容 PowerShell Set-Content 写入的 UTF-8 BOM 头
        with open(env_path, "r", encoding="utf-8-sig") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, _, v = line.partition("=")
                    if k.strip() == "ODAKYU_API_KEY":
                        return v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return ""

ODAKYU_KEY = _load_odakyu_key()

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

# v4.3.537: 静态服务敏感路径拦截（本地服务器曾把项目根整树暴露：
# .work/serve.env 含 ODAKYU key 可直接下载；目录列表开启泄露项目结构）
FORBIDDEN_PREFIXES = (
    "/.work/", "/.git/", "/.user_skills/", "/.skills/",
    "/work/", "/recovery/", "/scripts/",
)
FORBIDDEN_NAMES = {
    "serve.py", "serve.err", "serve.log",
}
FORBIDDEN_SUFFIXES = (".env", ".py", ".log", ".err")
ALLOWED_HOSTS = ("127.0.0.1", "localhost", "[::1]")

def _is_forbidden(path):
    """路径归一化（去 query）后判断是否命中敏感名单"""
    p = path.split("?")[0].lstrip("/")
    if not p:
        return False
    low = p.lower()
    if any(low.startswith(prefix.lower()) for prefix in FORBIDDEN_PREFIXES):
        return True
    if low.split("/")[-1] in FORBIDDEN_NAMES:
        return True
    if low.endswith(FORBIDDEN_SUFFIXES):
        return True
    return False

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        # v4.3.537: Host 头校验（防 DNS rebinding 绕过 127.0.0.1 绑定）
        host = (self.headers.get("Host") or "").split(":")[0].strip().lower()
        if host and host not in ALLOWED_HOSTS:
            self._json({"error": "forbidden host"}, 403)
            return
        path = self.path.split("?")[0]
        if path in PROXY_TARGETS:
            self._proxy(path)
            return
        if _is_forbidden(self.path):
            self.send_response(403)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.end_headers()
            self.wfile.write(b"Forbidden")
            return
        return super().do_GET()

    def list_directory(self, path):
        # v4.3.537: 关闭目录列表（泄露项目结构）
        self.send_response(403)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(b"Forbidden")
        return None

    def _json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def _proxy(self, path):
        cfg = PROXY_TARGETS[path]
        # 需要 key 的端点未配置时给出明确提示（不发送空 key 请求）
        if cfg["headers"].get("x-api-key") is not None and not cfg["headers"].get("x-api-key"):
            self.send_response(503)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(
                {"error": "ODAKYU_API_KEY not configured: set env var or create .work/serve.env"},
                ensure_ascii=False).encode("utf-8"))
            return
        try:
            headers = {"User-Agent": "Mozilla/5.0"}
            headers.update(cfg["headers"])
            req = urllib.request.Request(cfg["url"], headers=headers)
            with urllib.request.urlopen(req, timeout=15) as resp:
                body = resp.read()
            self.send_response(200)
            self.send_header("Content-Type", cfg["content_type"])
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.end_headers()
            self.wfile.write(body)
        except Exception:
            # v4.3.537: 不回显内部异常详情（避免泄露上游响应/实现细节）
            self.send_response(502)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "upstream request failed"}, ensure_ascii=False).encode("utf-8"))

    def log_message(self, fmt, *args):
        # 静默访问日志（避免刷屏），保留错误
        if args and args[0] and str(args[0]).startswith("5"):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    os.chdir(ROOT)
    with socketserver.ThreadingTCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print("Pixel Tetsudo server: http://127.0.0.1:%d/pages/home.html" % PORT)
        httpd.serve_forever()
