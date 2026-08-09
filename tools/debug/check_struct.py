path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Check structure
print('First 200 chars:')
print(content[:200])
print()
print('Last 200 chars:')
print(content[-200:])
print()
print('Has UNIFIED_LINES:', 'UNIFIED_LINES' in content)
print('Has (function():', '(function()' in content)
print('Has });', '});' in content)
print('Has })();', '})();' in content)
