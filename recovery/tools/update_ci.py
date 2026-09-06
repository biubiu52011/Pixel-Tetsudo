import os
repo = os.getcwd()
yml_path = os.path.join(repo, '.github/workflows/ci-cd.yml')
with open(yml_path, 'r', encoding='utf-8') as f:
    c = f.read()
old = 'echo \ Canonical data OK\'
new_step = '''
      - name: Entity Preservation Guard
        run: |
          echo \Checking entity preservation...\
          python .github/workflows/ci_guard_check.py'''
if old in c:
    c = c.replace(old, old + new_step)
    with open(yml_path, 'w', encoding='utf-8') as f:
        f.write(c)
    print('Updated CI workflow')
else:
    print('Marker not found')
