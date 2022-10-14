const {
    create
} = require("domain");
const http = require("http");
const app = require("express")();
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"))
app.listen(9091, () => console.log("Listening on http port 9091"))
const websocketServer = require("websocket").server
const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("Listening.. on 9090"))

const clientdict = {};
var isGameRunning = false;
const games = {};
var currentPattern = {
    patternNo: 0,
    pattern: []
};


const wsServer = new websocketServer({
    "httpServer": httpServer
})
wsServer.on("request", request => {
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
            const pattern = GetPattern();
            currentPattern.pattern = pattern;
            updateClientPattern(pattern, -1);
            SetTimer();
        }



        //player has sent join request
        if (receivedfromclient.method === "join") {

            var name = receivedfromclient.playerName;
            const cid = receivedfromclient.cid;
            const gameid = receivedfromclient.gameid;
            const game = games[gameid];

            if (game.clientdict.length > 2) {


                return;
            }

            const color = {
                "0": "Red",
                "1": "Green"
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
                TempCurrentPattern = GetPattern();
                currentPattern.pattern = TempCurrentPattern;
                if (TempCurrentPattern.includes(buttonNumber)) {
                    buttonNumber = -1;
                }
            }
            updateClientPattern(TempCurrentPattern, buttonNumber);
        }

    })

    const cid = genid();

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

    var clientInfo = GetScore();
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

function GetScore() {
    var arrClientInfo = [];
    for (const key in clientdict) {
        let objClient = {}

        objClient["clientId"] = key;
        objClient["score"] = clientdict[key].score;

        arrClientInfo.push(objClient);
    }


    return arrClientInfo;
}

function GetPattern() {
    if (currentPattern.patternNo < 0 || currentPattern.patternNo > 4) {
        currentPattern.patternNo = 0;

    }
    let PatternObject = {
        0: [7, 4, 9],
        1: [4, 7, 3],
        2: [2, 15, 18],
        3: [17, 14, 19],
        4: [12, 8, 6]
    }
    return PatternObject[currentPattern.patternNo];
}

function SetTimer() {
    var second = 20;
    var interval = setInterval(function () {
        if (second == 0) {
            isGameRunning = false;
            var clientInfo = GetScore();

            for (const g of Object.keys(games)) {

                const game = games[g]
                const sendtoclient = {
                    "method": "TerminateGame",
                    "clientInfo": clientInfo
                }

                game.clientdict.forEach(c => {
                    clientdict[c.cid].connection.send(JSON.stringify(sendtoclient));

                })
            }

            clearInterval(interval)
        }


        for (const g of Object.keys(games)) {

            const game = games[g]
            const sendtoclient = {
                "method": "updateTimer",
                "second": second
            }

            game.clientdict.forEach(c => {
                clientdict[c.cid].connection.send(JSON.stringify(sendtoclient));

            })
        }

        second = second - 1;

    }, 1000);
}




const genid = () => Math.floor(Math.random() * 900000 + 100000);