import os
proj = r'C:\\Users\\80996\\Documents\\项目\\像素铁道'
for f in ['fix_scripts.py','fix_page2.py','fix_home.py','fix_page.py','gen_translations.py','find_keys.py','check_keys.py','check_keys2.py','analyze.py','analyze2.py','analyze3.py','write_home.py','add_scripts.py']:
    p = os.path.join(proj, f)
    if os.path.exists(p):
        os.remove(p)
        print('Removed:', f)
