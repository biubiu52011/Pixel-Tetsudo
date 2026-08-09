"""获取线路数据"""

﻿#!/usr/bin/env python3
# ============================================================================
# 文件：fetch_lines.py
# 功能：从 ODPT API 获取东京公共交通线路数据
# 描述：查询 https://odpt.org/api/v3/lines 端点并输出 JSON 结果
# 作者：Pixel Tetsudo 开发团队
# 日期：2026
# 依赖：urllib.request, json 标准库
# ============================================================================

import urllib.request
import json

try:
    # 调用 ODPT API 获取线路数据（最多100条）
    # timeout=5 设置请求超时时间为5秒，防止无限等待
    resp = urllib.request.urlopen(
        "https://odpt.org/api/v3/lines?_limit=100", 
        timeout=5
    )
    
    # 读取响应内容并解码为 UTF-8 字符串
    data = json.loads(resp.read().decode("utf-8"))
    
    # 将数据格式化为美观的 JSON 字符串（缩进2位，中文字符不转义）
    # [:3000] 截断前3000字符，避免输出过长
    print(json.dumps(data, indent=2, ensure_ascii=False)[:3000])
    
except Exception as e:
    # 捕获任何异常（网络错误、JSON 解析错误等）并打印错误信息
    print("Error:", e)
