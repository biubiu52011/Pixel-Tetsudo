# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r'C:\Users\80996\Documents\项目\像素铁道\data\railway\line-control.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the wrongly placed delayInfo from Yamanote section
old_text = '''      delayInfo: {"interval": "東京→池袋", "cause": "車両故障", "trains": ["JY05", "JY10"]},
            delayInfo: {"interval": "品川→横浜", "cause": "信号障害", "trains": ["JO03"], "suspended": true},
  branchOf: null'''
new_text = '''      delayInfo: {"interval": "東京→池袋", "cause": "車両故障", "trains": ["JY05", "JY10"]},
      branchOf: null'''
content = content.replace(old_text, new_text)

# Add delayInfo to Yokosuka
old_yokosuka = '''    "Yokosuka": {
      name: "横須賀線", nameEn: "Yokosuka Line", code: "JO", color: "#E41C23",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/JR東日本/東海道線.png", durationTotalMin: 35, throughServices: [],
      transferStations: [{"station": "上野", "connects": ["Yamanote", "KeihinTohoku"]}, {"station": "東京", "connects": ["Yamanote"]}, {"station": "新橋", "connects": ["Yamanote"]}, {"station": "浜松町", "connects": ["Yamanote"]}, {"station": "品川", "connects": ["Yamanote"]}, {"station": "横須賀", "connects": []}],
      stations: ["上野", "東京", "有楽町", "新橋", "浜松町", "品川", "浦賀", "横須賀"],
      durations: Array(12).fill(2),
      branchOf: null'''
new_yokosuka = '''    "Yokosuka": {
      name: "横須賀線", nameEn: "Yokosuka Line", code: "JO", color: "#E41C23",
      operator: "JR East", region: "Tokyo Area", type: "straight",
      image: "images/鉄道/JR東日本/東海道線.png", durationTotalMin: 35, throughServices: [],
      transferStations: [{"station": "上野", "connects": ["Yamanote", "KeihinTohoku"]}, {"station": "東京", "connects": ["Yamanote"]}, {"station": "新橋", "connects": ["Yamanote"]}, {"station": "浜松町", "connects": ["Yamanote"]}, {"station": "品川", "connects": ["Yamanote"]}, {"station": "横須賀", "connects": []}],
      stations: ["上野", "東京", "有楽町", "新橋", "浜松町", "品川", "浦賀", "横須賀"],
      durations: Array(12).fill(2),
      delayInfo: {"interval": "品川→横浜", "cause": "信号障害", "trains": ["JO03"], "suspended": true},
      branchOf: null'''
content = content.replace(old_yokosuka, new_yokosuka)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed line-control.js')
