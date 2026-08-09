import os
import re

base_path = 'C:/Users/80996/Documents/项目/像素铁道'
js_path = os.path.join(base_path, 'data/railway/line-control.js')
images_path = os.path.join(base_path, 'images/鉄道')

# Read the JS file
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all image references
image_pattern = r'image:\s*"([^"]+)"'
images = re.findall(image_pattern, content)

print(f"Found {len(images)} image references")
print()

# Check each image
missing = []
for img in images:
    # Handle relative paths
    if img.startswith('../'):
        img = img[3:]  # Remove ../
    
    full_path = os.path.join(base_path, img)
    if not os.path.exists(full_path):
        missing.append(img)
        print(f"MISSING: {img}")

print()
if missing:
    print(f"Total missing: {len(missing)}")
else:
    print("All images exist!")
