
const http = require("http");


var express = require('express'),
    path = require('path'),
    app = express();
    
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', function(req, res) {
    res.redirect('index.html');
});
app.listen(9091, () => console.log("Listening on http port 9091"))



const websocketServer = require("websocket").server
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("Listening.. on 9090"))

const GetPattern =require('./GetPattern');
const GetScore =require('./GetScore');
const SetTimer =require('./SetTimer');

const clientdict = {};
var isGameRunning = false;
 var nameGlobal = "";
const games = {};
var currentPattern = {
    patternNo: 0,
    pattern: []
};


const wsServer = new websocketServer({
    "httpServer": httpServer
})
wsServer.on("request", request =>
 {
    const connection = request.accept(null, request.origin);
    connection.on("open", () => console.log("opened!"))
    connection.on("closed", () => console.log("closed!"))
    connection.on("message", message => {
        const receivedfromclient = JSON.parse(message.utf8Data)
        console.log(receivedfromclient)


        //player has sent create request

        if (receivedfromclient.method === "create") {
            const cid = receivedfromclient.cid;

            const gameid = genid();
            games[gameid] = {
                "id": gameid,
                "balls": 20,
                "clientdict": []
            }

            const send = {
                "method": "create",
                "game": games[gameid]
            }

            const con = clientdict[cid].connection;
            con.send(JSON.stringify(send));
        }


        //player has sent start request
        if (receivedfromclient.method === "start") {
            const gid = receivedfromclient.gameIdGlobal;
            isGameRunning = true;
            const game = games[gid];
            if (game.clientdict.length < 2) {
                const send = {
                    "method": "minPlayers"
                }

                game.clientdict.forEach(c => {
                    clientdict[c.cid].connection.send(JSON.stringify(send))
                })
                return;
            }
            const pattern = GetPattern(currentPattern);
            currentPattern.pattern = pattern;
            updateClientPattern(pattern, -1);
            SetTimer(isGameRunning,games,clientdict);
        }



        //player has sent join request
        if (receivedfromclient.method === "join") {

            var name = receivedfromclient.playerName;
            nameGlobal =name + " ";
            const cid = receivedfromclient.cid;
            const gameid = receivedfromclient.gameid;
            const game = games[gameid];

            if (game.clientdict.length > 2) {


                return;
            }

            const color = {
                "0": "pink",
                "1": "MediumSeaGreen"
            } [game.clientdict.length]
            game.clientdict.push({
                "cid": cid,
                "color": color,
                "name": name
            })



            const send = {
                "method": "join",
                "game": game
            }

            game.clientdict.forEach(c => {
                clientdict[c.cid].connection.send(JSON.stringify(send))
            })
        }


        if (receivedfromclient.method === "onWallBreak") {
            let cid = receivedfromclient.cid;
            let buttonNumber = receivedfromclient.buttonNumber;
            let TempCurrentPattern = currentPattern.pattern;
            let s = clientdict[cid].score
            s = s + 1;
            clientdict[cid].score = s;
            TempCurrentPattern.splice(TempCurrentPattern.indexOf(buttonNumber), 1);
            if (TempCurrentPattern.length <= 0) {


                currentPattern.patternNo = currentPattern.patternNo + 1;
                TempCurrentPattern = GetPattern(currentPattern);
                currentPattern.pattern = TempCurrentPattern;
                if (TempCurrentPattern.includes(buttonNumber)) {
                    buttonNumber = -1;
                }
            }
            updateClientPattern(TempCurrentPattern, buttonNumber);
        }

    })

    const cid =genid();

    clientdict[cid] = {
        "connection": connection,
        "score": 0,
        

    }

    const response = {
        "method": "connect",
        "cid": cid
    }
    connection.send(JSON.stringify(response))

})

function updateClientPattern(p_arrPattern, removeId) {

    var clientInfo = GetScore(clientdict);
    if (isGameRunning === false) {
        return;
    }
    for (const g of Object.keys(games)) {

        const game = games[g]
        var sendtoclient = {
            "method": "patternupdate",
            "game": game,
            "pattern": p_arrPattern,
            "removeId": removeId,
            "isReverse": true,
            "ScoreInfo": clientInfo,

        }

        game.clientdict.forEach(c => {
            clientdict[c.cid].connection.send(JSON.stringify(sendtoclient));
            sendtoclient.isReverse = !sendtoclient.isReverse;
        })
    }
}


const genid = () => Math.floor(Math.random() * 900000 + 100000);