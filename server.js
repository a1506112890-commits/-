
import express from "express";
import {createServer} from "http";
import {WebSocketServer} from "ws";
import {spawn} from "child_process";

const app=express();
const server=createServer(app);
app.use(express.static("web"));

const rooms=new Map();

app.get("/api/status",(req,res)=>{
 res.json({
  ok:true,
  version:"qunyousha-private-server-alpha2",
  core:"noname-shijian"
 });
});

const wss=new WebSocketServer({server});
wss.on("connection",ws=>{
 ws.send(JSON.stringify({type:"server",text:"群友杀私服 alpha2"}));
 ws.on("message",m=>{
  const msg=JSON.parse(m);
  if(msg.type==="create"){
   const id=Math.random().toString(36).slice(2,7).toUpperCase();
   rooms.set(id,[ws]);
   ws.room=id;
   ws.send(JSON.stringify({type:"room",id}));
  }
  if(msg.type==="join" && rooms.has(msg.id)){
   rooms.get(msg.id).push(ws);
   for(const p of rooms.get(msg.id)){
    p.send(JSON.stringify({type:"room_join",id:msg.id}));
   }
  }
 });
});

server.listen(process.env.PORT||8080,"0.0.0.0");
