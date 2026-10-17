// Local CI harness only. Production HTML/assets are unchanged on disk.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const root=process.cwd(),fixtures=JSON.parse(zlib.gunzipSync(fs.readFileSync('tests/fixtures/guards/network-har-replay.json.gz')));
const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf'};
http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/__replay-data'){
    const fixture=fixtures[url.searchParams.get('case')];
    res.writeHead(fixture?200:404,{'Content-Type':'application/json'});res.end(JSON.stringify(fixture||{}));return;
  }
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  let data=fs.readFileSync(file);
  if(url.pathname==='/pages/trains.html'&&url.searchParams.has('replay')){
    data=Buffer.from(data.toString().replace('<head>','<head><script src="../tests/browser/replay-bootstrap.js"></script>')
      .replace('</body>','<script src="../tests/browser/replay-verify.js"></script></body>'));
  }
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
}).listen(Number(process.env.REPLAY_PORT)||8789,'127.0.0.1',()=>console.log('HAR browser replay server ready'));
