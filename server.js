import express from 'express';
import {createServer} from 'http';
import {WebSocketServer} from 'ws';
const app=express();const server=createServer(app);
app.use(express.json());app.use(express.static('public'));
let rooms={};let skills=[];
const wss=new WebSocketServer({server});
function code(){return Math.random().toString(36).slice(2,7).toUpperCase()}
wss.on('connection',ws=>{
ws.send(JSON.stringify({type:'ready',version:'6.8'}));
ws.on('message',m=>{let x=JSON.parse(m);
if(x.type==='create'){let r=code();rooms[r]={players:[ws],mode:x.mode};ws.send(JSON.stringify({type:'room',room:r}))}
if(x.type==='skill_test'){ws.send(JSON.stringify({type:'skill_result',text:'技能链执行完成'}))}
})});
app.post('/api/admin/skill',(req,res)=>{skills.push(req.body);res.json({ok:true})});
app.get('/api/admin/skills',(req,res)=>res.json(skills));
app.get('/api/status',(req,res)=>res.json({ok:true,version:'6.8'}));
server.listen(process.env.PORT||8080,'0.0.0.0');
