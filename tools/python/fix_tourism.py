""""""

# -*- coding: utf-8 -*-
import os

tourism_content = """// Tourism Data with translations
window.TOURISM_DATA = {
  'Asakusa': {
    name: '',
    spots: [
      { emoji: '', name: ' & ', dist: '5 ', dir: '', desc: '', tags: ['history', 'all'] },
      { emoji: '', name: '', dist: '6 ', dir: '', desc: '250', tags: ['food', 'all'] },
      { emoji: '', name: '', dist: '12 ', dir: '', desc: '', tags: ['all', 'all'] },
      { emoji: '', name: '', dist: '3 ', dir: '', desc: '', tags: ['all', 'seasonal'] },
      { emoji: '', name: '', dist: '15 ', dir: '', desc: '', tags: ['nature', 'seasonal'] },
      { emoji: '', name: '', dist: '8 ', dir: '', desc: '', tags: ['all', 'all'] },
      { emoji: '', name: '', dist: '5 ', dir: '', desc: '', tags: ['night', 'seasonal', 'history'] }
    ]
  },
  'Shibuya': {
    name: '',
    spots: [
      { emoji: '', name: '', dist: '2 ', dir: '', desc: '', tags: ['seasonal', 'all'] },
      { emoji: '', name: '', dist: '1 ', dir: '', desc: '800', tags: ['all', 'night'] },
      { emoji: '', name: 'SHIBUYA SKY', dist: '3 ', dir: '', desc: '360', tags: ['all', 'all'] },
      { emoji: '', name: '', dist: '3 ', dir: '', desc: '', tags: ['all', 'history'] },
      { emoji: '', name: ' Hikarie ', dist: '4 ', dir: '', desc: '21', tags: ['night', 'all'] }
    ]
  },
  'Kamakura': {
    name: '',
    spots: [
      { emoji: '', name: '', dist: '5 ', dir: '', desc: '11.3', tags: ['history', 'all'] },
      { emoji: '', name: '', dist: '8 ', dir: '', desc: '', tags: ['history', 'shrine'] },
      { emoji: '', name: '', dist: '10 ', dir: '', desc: '', tags: ['nature', 'seasonal'] },
      { emoji: '', name: '', dist: '15 ', dir: '', desc: '', tags: ['nature', 'seasonal'] },
      { emoji: '', name: '', dist: '2 ', dir: '', desc: '', tags: ['nature', 'history'] }
    ]
  },
  'Nikko': {
    name: '',
    spots: [
      { emoji: '', name: '', dist: '10 ', dir: '', desc: '', tags: ['history', 'all'] },
      { emoji: '', name: '', dist: '5 ', dir: '', desc: '', tags: ['history', 'nature'] },
      { emoji: '', name: '', dist: '20 ', dir: '', desc: '1,269', tags: ['nature', 'seasonal'] },
      { emoji: '', name: '', dist: '15 ', dir: '', desc: '97', tags: ['nature', 'all'] },
      { emoji: '', name: '', dist: '5 ', dir: '', desc: '', tags: ['history', 'all'] }
    ]
  },
  'Shinjuku': {
    name: '',
    spots: [
      { emoji: '', name: '', dist: '10 ', dir: '', desc: '', tags: ['nature', 'seasonal'] },
      { emoji: '', name: '', dist: '3 ', dir: '', desc: '', tags: ['nature', 'all'] },
      { emoji: '', name: '', dist: '10 ', dir: '', desc: '45202', tags: ['all', 'all'] },
      { emoji: '', name: '', dist: '5 ', dir: '', desc: '', tags: ['food', 'night'] },
      { emoji: '', name: '', dist: '10 ', dir: '', desc: '', tags: ['night', 'seasonal', 'nature'] }
    ]
  },
  'Ueno': {
    name: '',
    spots: [
      { emoji: '', name: '', dist: '5 ', dir: '', desc: '', tags: ['history', 'all'] },
      { emoji: '', name: '', dist: '5 ', dir: '', desc: '3,000', tags: ['all', 'all'] },
      { emoji: '', name: ' & ', dist: '3 ', dir: '', desc: '', tags: ['nature', 'seasonal'] },
      { emoji: '', name: ' & ', dist: '5 ', dir: '', desc: '', tags: ['history', 'shrine'] }
    ]
  }
};

window.TOURISM_STATIONS = Object.keys(window.TOURISM_DATA);
"""

path = r'C:\Users\80996\OneDrive\\\\data\tourism-data.js'
with open(path, 'w', encoding='utf-8') as f:
    f.write(tourism_content)
print('tourism-data.js updated')
