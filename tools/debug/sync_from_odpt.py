# -*- coding: utf-8 -*-
"""ODPT API sync tool - fetch station/railway data and compare with local line-control.js"""
import json, re, sys, urllib.request
from pathlib import Path

BASE = Path(r"C:\Users\80996\Documents\项目\像素铁道")
LINE_PATH = BASE / "data" / "railway" / "line-control.js"
KEY_FILE = BASE / "data" / "api-keys.enc"

OP_TO_LINES = {
    "JR-East": ["Yamanote","KeihinTohoku","Yokosuka","ChuoRapid","Saikyo","Joban","SobuLocal","Keiyo","Musashino","ShonanShinjuku","Takasaki","Tsurumi","Nambu","Tokaido","JobanLocal"],
    "TokyoMetro": ["Ginza","Marunouchi","Hibiya","Yurakucho","Tozai"],
    "Toei": ["Asakusa","Mita","Shinjuku","Oedo"],
    "YokohamaMunicipal": ["YokohamaBlue"],
    "Keio": ["Keio"],
    "Tokyu": ["TokyuToyoko"],
    "Seibu": ["SeibuShinjuku","SeibuIkebukuro","SeibuChichibu","SeibuTamako","SeibuTamagawa"],
    "Odakyu": ["Odawara","OdakyuEnoshima"],
    "Tobu": ["TobuIsesaki","TobuSkytree","TobuNikko","TobuNoda"],
    "Keisei": ["Keisei"],
    "Yurikamome": ["Yurikamome"],
}

def load_keys():
    keys = {}
    if KEY_FILE.exists():
        for pair in KEY_FILE.read_text(encoding="utf-8").strip().split("|"):
            if ":" in pair:
                n, v = pair.split(":", 1)
                keys[n.strip()] = v.strip()
    return keys

def fetch(url):
    try:
        req = urllib.request.Request(url, headers={"Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode("utf-8")).get("value", [])
    except Exception as e:
        return []

def main():
    print("=== ODPT API Sync Tool ===")
    keys = load_keys()
    chal = keys.get("CHALLENGE_2026", "")
    center = keys.get("ODPT_CENTER", "")
    print(f"Challenge key: {chal[:8] if chal else 'NONE'}")
    print(f"Center key: {center[:8] if center else 'NONE'}")
    print()
    
    # Load local data
    content = LINE_PATH.read_text(encoding="utf-8")
    lines = {}
    for m in re.findall(r'"(\w+)"\s*:\s*\{([^}]+)\}', content, re.DOTALL):
        lid, body = m
        stations = re.search(r'stations:\s*\[([^\]]+)\]', body)
        line_stations = [s.strip().strip('"') for s in stations.group(1).split(',')] if stations else []
        lines[lid] = {"stations": line_stations, "count": len(line_stations)}
    
    print(f"Local lines: {len(lines)}")
    print()
    
    # Test API connectivity
    print("--- API Tests ---")
    
    # JR-East
    if chal:
        url = f"https://api-challenge.odpt.org/api/v4/odpt:Station?acl:consumerKey={chal}&odpt:operator=odpt.Operator:JR-East"
        st = fetch(url)
        print(f"JR-East stations: {len(st)} records")
        if st:
            print(f"  Sample: {st[0].get('odpt:stationTitle',{}).get('ja','?')}")
        
        url2 = f"https://api-challenge.odpt.org/api/v4/odpt:Railway?acl:consumerKey={chal}&odpt:operator=odpt.Operator:JR-East"
        rw = fetch(url2)
        print(f"JR-East railways: {len(rw)} records")
        if rw:
            for r in rw[:3]:
                title = r.get("odpt:railwayTitle", {})
                print(f"  {title.get('ja','?')} ({r.get('odpt:railwayCode','?')})")
    
    # TokyoMetro
    if center:
        url = f"https://api.odpt.org/api/v4/odpt:Station?acl:consumerKey={center}&odpt:operator=odpt.Operator:TokyoMetro"
        st = fetch(url)
        print(f"TokyoMetro stations: {len(st)} records")
        
        url2 = f"https://api.odpt.org/api/v4/odpt:Railway?acl:consumerKey={center}&odpt:operator=odpt.Operator:TokyoMetro"
        rw = fetch(url2)
        print(f"TokyoMetro railways: {len(rw)} records")
        if rw:
            for r in rw[:3]:
                title = r.get("odpt:railwayTitle", {})
                print(f"  {title.get('ja','?')} ({r.get('odpt:railwayCode','?')})")
    
    # Toei
    if center:
        url = f"https://api.odpt.org/api/v4/odpt:Station?acl:consumerKey={center}&odpt:operator=odpt.Operator:Toei"
        st = fetch(url)
        print(f"Toei stations: {len(st)} records")
    
    print()
    print("--- Station Count Comparison ---")
    for op, lids in OP_TO_LINES.items():
        key = chal if op == "JR-East" else center
        if not key:
            continue
        url = f"https://api-challenge.odpt.org/api/v4/odpt:Station?acl:consumerKey={key}&odpt:operator=odpt.Operator:{op}"
        api_stations = fetch(url)
        api_names = set()
        for s in api_stations:
            t = s.get("odpt:stationTitle", {})
            if isinstance(t, dict):
                api_names.add(t.get("ja", ""))
            else:
                api_names.add(str(t))
        api_names.discard("")
        print(f"{op}: API={len(api_names)} stations")
        for lid in lids:
            local = lines.get(lid, {}).get("count", 0)
            print(f"  {lid}: local={local}")
    
    print()
    print("=== Done ===")

if __name__ == "__main__":
    main()
