import sys
sys.stdout.reconfigure(encoding='utf-8')
path = r'C:\\Users\\80996\\Documents\\项目\\像素铁道\\js\\tourism-detail.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Lines 138-142 (0-indexed) need to be replaced
# 138: tagsHtml = "<div class=...
# 139: var labels = {all:...
# 140: return "<span class=...
# 141: }).join...
# 142: }

new_block = [
    '      var _labels = {all:"全部",night:"夜景",history:"历史",nature:"自然",shrine:"神社",food:"美食",seasonal:"季节"};\n',
    '      tagsHtml = "<div class=\\"article-tags\\">" + spot.tags.map(function(tag) {\n',
    '        return "<span class=\\"tag-badge \\" + tag + \\"\\">" + (_labels[tag] || tag) + "</span>";\n',
    '      }).join("") + "</div>";\n',
]

result = lines[:138] + new_block + lines[143:]
with open(path, 'w', encoding='utf-8') as f:
    f.writelines(result)
print('OK, total lines:', len(result))
