import re

css_path = r'C:\Users\80996\Documents\项目\像素铁道\css\realtime.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

old_card = '.rs-line-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--card);
  border: 2px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s ease;
}'
new_card = '.rs-line-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--card);
  border: none;
  border-left: 4px solid var(--line-color, var(--green));
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s ease;
}'
css = css.replace(old_card, new_card)

new_styles = '''
.rs-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--green);
  display: inline-block;
  margin-right: 7px;
  animation: rsLivePulse 2s ease infinite;
  box-shadow: 0 0 8px rgba(0, 160, 78, 0.4);
}
@keyframes rsLivePulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}
.rs-line-detail {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}
.rs-line-operator, .rs-line-type, .rs-train-count {
  font-size: 9px;
  color: var(--text-muted);
  background: var(--bg3);
  padding: 3px 10px;
  border-radius: 12px;
}
.rs-status-symbol {
  font-size: 20px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.rs-line-arrow { display: none; }
'''

css = css.replace('/* Container */', new_styles + '\n/* Container */')

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)
print('CSS done!')
