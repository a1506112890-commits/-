
import express from "express";
import {createServer} from "http";
import {WebSocketServer} from "ws";

const app=express();
const server=createServer(app);
app.use(express.static("public"));

let rooms={};

function roomCode(){
 return Math.random().toString(36).slice(2,7).toUpperCase();
}

const wss=new WebSocketServer({server});

wss.on("connection",ws=>{
 let game=null;

 ws.on("message",raw=>{
  const m=JSON.parse(raw);

  if(m.type==="single"){
   game={
    you:{hero:"曹操",hp:4,hand:["杀","杀","闪","桃"]},
    ai:{hero:"刘备",hp:4,hand:["闪","杀","桃"]}
   };
   ws.send(JSON.stringify({type:"game",game}));
  }

  if(m.type==="create"){
   const id=roomCode();
   rooms[id]=[];
   rooms[id].push(ws);
   ws.room=id;
   ws.send(JSON.stringify({type:"room",id}));
  }

  if(m.type==="join"){
   if(rooms[m.id]){
    rooms[m.id].push(ws);
    rooms[m.id].forEach(c=>c.send(JSON.stringify({
      type:"room_join",
      text:"玩家加入房间"
    })));
   }
  }

  if(m.type==="play" && game){
   if(m.card==="杀"){
    if(game.ai.hand.includes("闪")){
     game.ai.hand.splice(game.ai.hand.indexOf("闪"),1);
     ws.send(JSON.stringify({type:"log",text:"AI使用【闪】"}));
    }else{
     game.ai.hp--;
     ws.send(JSON.stringify({type:"log",text:"你使用【杀】，AI掉1血"}));
    }
   }

   if(m.card==="桃"){
    game.you.hp=Math.min(4,game.you.hp+1);
    ws.send(JSON.stringify({type:"log",text:"你使用【桃】回复1血"}));
   }

   ws.send(JSON.stringify({type:"game",game}));

   if(game.ai.hp<=0){
    ws.send(JSON.stringify({type:"log",text:"胜利"}));
   }
  }
 });
});

app.listen(process.env.PORT||8080,"0.0.0.0",
()=>console.log("QunyouSha v7.1 running"));
