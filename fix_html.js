var fs=require('fs');var r=fs.readFileSync('pages/realtime.html','utf8');r=r.replace(/<div id=.realtimeStatusContainer.real.*?<div id=.realtimeFilterBar./.s,'<div id=
realtimeFilterBar class=rs-filter-bar></div><div id=realtimeStatusContainer class=pixel-card></div>');fs.writeFileSync('pages/realtime.html',r,'utf8');
