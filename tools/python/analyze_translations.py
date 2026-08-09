"""分析翻译数据"""

import re
with open('js/translations.js', 'r', encoding='utf-8') as f:
    content = f.read()
match = re.search(r'var I18N=(\{.*?\});', content, re.DOTALL)
if match:
    js_obj = match.group(1)
    for lang in ['en', 'ja', 'zh', 'ko']:
        start = js_obj.find('"' + lang + '{')
        if start >= 0:
            brace_count = 0
            i = start
            while i < len(js_obj):
                if js_obj[i] == '{':
                    brace_count += 1
                elif js_obj[i] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        end = i + 1
                        break
                i += 1
            lang_str = js_obj[start:end]
            entries = re.findall(r'[^,]\s*:\s*"([^"]*)"', lang_str)
            print(f'{lang}: {len(entries)} entries')


