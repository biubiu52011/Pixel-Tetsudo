path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Show full Takasaki block
idx = content.find('"Takasaki":')
end = content.find('    },', idx) + 8
block = content[idx:end]
print(block)
