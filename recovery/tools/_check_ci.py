import urllib.request, json
try:
    resp = urllib.request.urlopen('https://api.github.com/repos/biubiu52011/Pixel-Tetsudo/actions/runs?per_page=3', timeout=10)
    data = json.loads(resp.read().decode('utf-8'))
    for run in data.get('workflow_runs', []):
        jresp = urllib.request.urlopen(run['jobs_url'], timeout=10)
        jdata = json.loads(jresp.read().decode('utf-8'))
        for job in jdata.get('jobs', []):
            print(run['head_sha'][:8], job['name'], job.get('conclusion') or 'pending')
except Exception as e:
    print(str(e)[:100])
