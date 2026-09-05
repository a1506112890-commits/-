
import express from 'express';
import {createServer} from 'http';
import {WebSocketServer} from 'ws';

const app=express();
const server=createServer(app);
app.use(express.json());
app.use(express.static('public'));

let rooms={};

function code(){
 return Math.random().toString(36).slice(2,7).toUpperCase();
}

const wss=new WebSocketServer({server});

wss.on('connection',ws=>{
 ws.send(JSON.stringify({type:'welcome',version:'7.0'}));

 ws.on('message',raw=>{
  const m=JSON.parse(raw);

  if(m.type==='create'){
   let id=code();
   rooms[id]={mode:m.mode,players:[m.name]};
   ws.room=id;
   ws.send(JSON.stringify({type:'room',id}));
  }

  if(m.type==='join'){
   if(rooms[m.id]){
    rooms[m.id].players.push(m.name);
    ws.send(JSON.stringify({type:'joined',room:rooms[m.id]}));
   }
  }

  if(m.type==='single'){
   ws.send(JSON.stringify({
    type:'game',
    player:{hero:'曹操',hp:4,hand:['杀','闪','桃']},
    ai:{hero:'刘备',hp:4}
   }));
  }
 });
});

app.get('/api/status',(req,res)=>res.json({
ok:true,
version:'7.0',
features:[
'AI',
'1v1',
'rooms',
'DIY characters',
'skill editor'
]
}));

app.listen(process.env.PORT||8080,'0.0.0.0',
()=>console.log('QunyouSha v7 running'));
