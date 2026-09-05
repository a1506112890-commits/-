import express from "express";
import {WebSocketServer} from "ws";
import {createServer} from "http";

const app=express();
const server=createServer(app);
app.use(express.static("public"));

const rooms={};

function code(){
 return Math.random().toString(36).substring(2,7).toUpperCase();
}

const wss=new WebSocketServer({server});

wss.on("connection",ws=>{
 ws.send(JSON.stringify({type:"welcome",message:"DIY武将杀v4在线"}));

 ws.on("message",data=>{
  const msg=JSON.parse(data);

  if(msg.type==="create"){
    let c=code();
    while(rooms[c]) c=code();
    rooms[c]={players:[ws]};
    ws.room=c;
    ws.send(JSON.stringify({type:"room",room:c}));
  }

  if(msg.type==="join"){
    if(!rooms[msg.room]){
      ws.send(JSON.stringify({type:"error",message:"房间不存在"}));
      return;
    }
    rooms[msg.room].players.push(ws);
    ws.room=msg.room;
    rooms[msg.room].players.forEach(p=>{
      p.send(JSON.stringify({
        type:"players",
        count:rooms[msg.room].players.length
      }));
    });
  }
 });
});

app.get("/api/status",(req,res)=>{
 res.json({ok:true,version:"4.0.0"});
});

server.listen(process.env.PORT||8080,"0.0.0.0",
()=>console.log("DIY server started"));
