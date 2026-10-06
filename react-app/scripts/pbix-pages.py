#!/usr/bin/env python3
"""Regenerate src/embed/pbixPages.fixture.json from powerbi/All_visuals_template.pbix
(PBIR format inside the .pbix). Run after changing the sample report:
    python3 scripts/pbix-pages.py
"""
import json, pathlib, zipfile
root = pathlib.Path(__file__).resolve().parents[2]
z = zipfile.ZipFile(root / 'powerbi' / 'All_visuals_template.pbix')
names = z.namelist()
pages = json.loads(z.read('Report/definition/pages/pages.json'))
out = []
for pid in pages.get('pageOrder', []):
    page = json.loads(z.read(f'Report/definition/pages/{pid}/page.json'))
    prefix = f'Report/definition/pages/{pid}/visuals/'
    types = sorted({json.loads(z.read(n)).get('visual', {}).get('visualType') for n in names if n.startswith(prefix) and n.endswith('visual.json')} - {None})
    out.append({'name': pid, 'displayName': page.get('displayName'), 'visualTypes': types})
target = root / 'react-app' / 'src' / 'embed' / 'pbixPages.fixture.json'
target.write_text(json.dumps(out, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(f'{len(out)} pages → {target}')
