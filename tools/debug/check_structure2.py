path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Check if file has the correct structure
# Look for the beginning and end
print('First 100 chars:', repr(content[:100]))
print()
print('Last 100 chars:', repr(content[-100:]))
print()

# Check for UNIFIED_LINES
print('UNIFIED_LINES found:', 'UNIFIED_LINES' in content)
print('(function(){' found:', '(function() {' in content or '(function(){' in content)
print('})();' found:', '})();' in content)
