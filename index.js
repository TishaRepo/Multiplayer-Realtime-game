const { create } = require("domain");
const http = require("http");
const app= require("express")();
app.get("/", (req,res)=> res.sendFile(__dirname + "/index.html"))
app.listen(9091,()=>console.log("Listening on http port 9091"))
const websocketServer =require("websocket").server
const httpServer = http.createServer();
httpServer.listen(9090,() => console.log("Listening.. on 9090"))

const clientdict={};
const games = {};
var currentPattern = {patternNo:0,pattern:[]};
const wsServer = new websocketServer({"httpServer":httpServer})
wsServer.on("request", request =>{
    const connection = request.accept(null,request.origin);
    connection.on("open",() => console.log("opened!"))
    connection.on("closed",() => console.log("closed!"))
    connection.on("message",message => { 
        const receivedfromclient =JSON.parse(message.utf8Data)
        console.log(receivedfromclient)


           //player has sent create request

        if(receivedfromclient.method==="create"){
            const cid=receivedfromclient.cid;
           
            const gameid=genid();
            games[gameid]={
                "id":gameid,
                "balls":20,
                "clientdict":[ ]
            }

            const send ={
                "method":"create",
                "game":games[gameid]
            }

            const con =clientdict[cid].connection;
            con.send(JSON.stringify(send)); 
        }


           //player has sent start request
        if(receivedfromclient.method === "start"){
            const pattern = GetPattern();
            currentPattern.pattern=pattern;
            updateClientPattern(pattern,-1);
        }



            //player has sent join request
        if(receivedfromclient.method === "join")
        {
            const cid = receivedfromclient.cid;
            const gameid = receivedfromclient.gameid;
            const game = games[gameid];
            if (game.clientdict.length >= 2) 
            {
               
                return;
            }
            const color =  {"0": "Red", "1": "Green"}[game.clientdict.length]
            game.clientdict.push({
                "cid": cid,
                "color": color
            })
           
            

            const send = {
                "method": "join",
                "game": game
            }
           
            game.clientdict.forEach(c => {
                clientdict[c.cid].connection.send(JSON.stringify(send))
            })
        }


          // we'll start playing once we click a cell i.e a button
        if(receivedfromclient.method === "play"){
            const gameid = receivedfromclient.gameid;
            const game = games[gameid];
            const cid = receivedfromclient.cid;
            const ballId = receivedfromclient.ballId;
            const color = receivedfromclient.color;
            const pattern=[7,2,9];
            if(game.clientdict.length < 2)
            {
                const send = {
                    "method": "eplayers",
                     "game": game
                }
               
                game.clientdict.forEach(c => {
                    clientdict[c.cid].connection.send(JSON.stringify(send))
                })
                
            }

            let state = games[gameid].state;
            if (!state)
                state = {}
            
            state[ballId] = color;
            games[gameid].state = state;
        }




        if(receivedfromclient.method === "onWallBreak")
        {   
            
            let buttonNumber =receivedfromclient.buttonNumber;
            let TempCurrentPattern=currentPattern.pattern;
            TempCurrentPattern.splice(TempCurrentPattern.indexOf(buttonNumber),1);
            if(TempCurrentPattern.length<=0){
                
                
                currentPattern.patternNo=currentPattern.patternNo+1;
                TempCurrentPattern=GetPattern();
                currentPattern.pattern=TempCurrentPattern;
                if(TempCurrentPattern.includes(buttonNumber))
                {buttonNumber = -1;}
            }
            updateClientPattern(TempCurrentPattern,buttonNumber);
        }
         
    }) 
    
    const cid = genid();

    clientdict[cid]={
       "connection":connection
    }

    const response ={
       "method":"connect",
       "cid":cid
    }
    connection.send(JSON.stringify(response))

})

function updateClientPattern(p_arrPattern,removeId){
  
    for (const g of Object.keys(games)) {
        
        const game = games[g]
        var sendtoclient = {
        "method": "patternupdate",
        "game": game,
        "pattern":p_arrPattern,
        "removeId":removeId,
        "isReverse":true
      }

     game.clientdict.forEach(c=> {
        clientdict[c.cid].connection.send(JSON.stringify(sendtoclient));
        sendtoclient.isReverse=!sendtoclient.isReverse;
      })
      }
}

function GetPattern()
{  if(currentPattern.patternNo<0 || currentPattern.patternNo>4 )
    {
      currentPattern.patternNo=0;
      
    }
   let PatternObject = { 
    0:[7,4,9] ,
    1:[4,7,3] ,
    2:[2,15,18] ,
    3:[17,14,19] ,
    4:[12,8,6] 
  }  
  return PatternObject[currentPattern.patternNo];
}


function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
 
const genid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substring(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();