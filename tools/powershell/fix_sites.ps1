# ============================================================================
# 文件：fix_sites.ps1（实际为 Python 脚本，应为 fix_sites.py）
# 功能：站点修复工具 - 多步骤自动化修复
# 描述：此脚本执行三个修复步骤：
#       Step 1: 创建缺失的 odpt-api.js 文件
#       Step 2: 修复 home.html 中的 script 标签顺序和重复项
#       Step 3: 检查并修复 realtime.html 中的 running-status-auto-refresh.js 引用
# 
# 注意：虽然扩展名为 .ps1，但实际内容是 Python 代码，应使用 Python 解释器执行。
# 建议重命名为 fix_sites.py 以反映真实类型。
# 
# 使用方法：python scripts/powershell/fix_sites.ps1
#            （或直接运行：python fix_sites.py）
# 
# 作者：Pixel Tetsudo 开发团队
# 日期：2026
# ============================================================================

import re, os

# === Step 1: Create missing odpt-api.js ===
odpt_api_code = r'''// == Pixel Tetsudo - ODPT API Client ==
(function() {
    'use strict';
    window.OdptApi = {
        fetchLine: function(lineId) {
            var key = window.KeyManager ? window.KeyManager.getKeyForOperator('JR-East') : '';
            return fetch('https://api-challenge.odpt.org/api/v4/odpt:Railway?odpt:operator=' + lineId + '&acl:consumerKey=' + encodeURIComponent(key)).then(r=>r.json());
        },
        fetchStations: function(lineId) {
            var key = window.KeyManager ? window.KeyManager.getKeyForOperator('JR-East') : '';
            return fetch('https://api-challenge.odpt.org/api/v4/odpt:Station?odpt:operator=odpt.Operator:' + lineId + '&acl:consumerKey=' + encodeURIComponent(key)).then(r=>r.json());
        }
    };
    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>console.log('OdptApi init')); else console.log('OdptApi init');
})();'''
with open('js/odpt-api.js','w',encoding='utf-8') as f:
    f.write(odpt_api_code)
print('[OK] Created js/odpt-api.js')

# === Step 2: Fix home.html script order and remove duplicates ===
def fix_html(filepath):
    with open(filepath,'r',encoding='utf-8') as f:
        content = f.read()
    
    # Remove duplicate lang-tab-preserve entries
    pattern = r'(script src=\"../js/lang-tab-preserve\.js\"></script>\s*)\1+'
    content = re.sub(pattern, r'\1', content)
    
    # Ensure odpt-api is before app.js
    app_pos = content.find('<script src=\"../js/app.js\"></script>')
    if app_pos > -1 and '<script src=\"../js/odpt-api.js\"></script>' not in content[:app_pos]:
        insert_point = '<script src=\"../js/odpt-api.js\"></script>\n'
        content = content[:app_pos] + insert_point + content[app_pos:]
    
    with open(filepath,'w',encoding='utf-8') as f:
        f.write(content)
    print('[OK] Fixed', filepath)

fix_html('pages/home.html')

# === Step 3: Verify realtime.html has running-status-auto-refresh correctly ===
with open('pages/realtime.html','r',encoding='utf-8') as f:
    rt = f.read()
if 'running-status-auto-refresh.js' in rt:
    print('[OK] realtime.html has running-status-auto-refresh.js')
else:
    print('[WARN] realtime.py missing running-status-auto-refresh.js - adding...')
    rt = rt.replace('</html>', '    <script src=\"../js/running-status-auto-refresh.js\"></script>\n</html>')
    with open('pages/realtime.html','w',encoding='utf-8') as f:
        f.write(rt)
print('All fixes complete!')
