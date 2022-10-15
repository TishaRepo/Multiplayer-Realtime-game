let url = "ws://" + location.hostname + ":9090";
let ws = new WebSocket(url)

const createbutton = document.getElementById("b1");
const joinbutton = document.getElementById("b2");
const writejoin = document.getElementById("t1");
const startgame = document.getElementById("b3");

const players = document.getElementById("players");
const board = document.getElementById("board");

//global vars

var patternFromServer = [];
var isReverse = true;
let gameIdGlobal = 0;
var isJoined = false;
var isStarted = false;







//start the game

startgame.addEventListener("click", e => {

   
    if(isStarted === true) {return;}
    
        const sendtoserver = {
            "method": "start",
            "gameIdGlobal": gameIdGlobal
        }
        ws.send(encodeObject(sendtoserver));
    
})


// i wanna join the game

joinbutton.addEventListener("click", e => {
    if(isJoined === true) {return;}
    var name = document.getElementById("name").value;
    if (gameid === null)
        gameid = t1.value;

    const sendtoserver = {
        "method": "join",
        "cid": cid,
        "gameid": gameid,
        "playerName": name + " "
    }

    ws.send(encodeObject(sendtoserver));

})


// i wanna create the game
createbutton.addEventListener("click", e => {
    if(isJoined === true) {return;}
    const sendtoserver = {
        "method": "create",
        "cid": cid
    }

    ws.send(encodeObject(sendtoserver))
})
let cid = null;
let gameid = null;




// responses sent by server
ws.onmessage = message => {
    const receivedfromserver = parseObject(message.data);



    if (receivedfromserver.method === "connect") {
        cid = receivedfromserver.cid;
        console.log("Id for client is " + cid)
    }



    if (receivedfromserver.method === "create") {

        gameid = receivedfromserver.game.id;
        gameIdGlobal = gameid;
        console.log(" game successfully created with id " + gameid + " with " + receivedfromserver.game.balls + " balls")
        document.getElementById("g-id").innerHTML = " Your Game id is : " + gameid;
    }


    if (receivedfromserver.method === "TerminateGame") {

        var message = ""
        const clientInfo = receivedfromserver.clientInfo;

        if (clientInfo[0].score > clientInfo[1].score) {
            message = clientInfo[0].clientId + " Won the game !!"
        } else if (clientInfo[0].score === clientInfo[1].score) {
            message = " It's a TIE !!! "
        } else {
            message = clientInfo[1].clientId + " Won the game !!"
        }
        alert(message);
    }


    if (receivedfromserver.method === "patternupdate") {
        isStarted =true;
        

        const ScoreInfo = receivedfromserver.ScoreInfo;

        const intRemove = receivedfromserver.removeId;
        const pattern = receivedfromserver.pattern;
        isReverse = receivedfromserver.isReverse;

        patternFromServer = pattern;

        CreateLabel(ScoreInfo);

        for (let i = 0; i < pattern.length; i++) {

            const ballObject = document.getElementById("ball" + pattern[i]);

            ballObject.style.backgroundColor = "Yellow";
            ballObject.tag = i + 1;
        }

        if (intRemove > 0) {
            const ballObject = document.getElementById("ball" + intRemove);
            ballObject.style.backgroundColor = "#F0F0F0";


        }


    }
    if (receivedfromserver.method === "updateTimer") {
        const second = receivedfromserver.second;
        const d = document.getElementById("timerlabel");
        d.innerText = "  Remaining Time is " + second + "s";
        d.style.color = "white"

    }

    if (receivedfromserver.method === "join") {
         isJoined= true;
        const game = receivedfromserver.game;
        var rule = " DESCENDING ";
        while (players.firstChild)
            players.removeChild(players.firstChild)

        game.clientdict.forEach(c => {

            const d = document.createElement("div");
            d.style.width = "300px";
            d.style.height = "67px";
            d.style.background = c.color;
            d.innerHTML = c.name + " , <br> Id :" + c.cid + " , <br>  RULE : Press Buttons in " + rule + " order ";
            d.style.margin = "10px";
            d.style.padding = "10px";
            d.style.float= "right";
            players.appendChild(d);
            rule = " ASCENDING "

        })


        while (board.firstChild)
            board.removeChild(board.firstChild)

        for (let i = 0; i < game.balls; i++) {

            const b = document.createElement("button");
            b.id = "ball" + (i + 1);
            b.tag = i + 1
            b.textContent = i + 1
            b.style.width = "150px"
            b.style.height = "150px"
            b.style.borderRadius = "100px"
            b.style.marginLeft = "4px"
            b.style.marginRight = "4px"
            b.style.marginTop = "7px"
            b.style.marginBottom = "7px"
            b.addEventListener("click", e => {

                let buttonNumber = null;
                let isIdPresent = false;


                for (let id of patternFromServer) {
                    if (e.target.id === ("ball" + id)) {
                        isIdPresent = true;
                        buttonNumber = id;
                        break;
                    }
                }


                for (let id of patternFromServer) {
                    let condition = isReverse ? id > buttonNumber : id < buttonNumber;
                    if (condition) {
                        isIdPresent = false;
                        break;
                    }
                }

                if (isIdPresent === false) return;

                const send = {
                    "method": "onWallBreak",
                    "cid": cid,
                    "gameid": gameid,
                    "ballId": b.tag,
                    "IsIdPresent": isIdPresent,
                    "buttonNumber": buttonNumber



                }
                ws.send(encodeObject(send))
            })
            board.appendChild(b);
        }




    }

    if (receivedfromserver.method === "minPlayers") {
        alert(" Minimum TWO Players Required ! ");
    }

    if (receivedfromserver.method === "maxPlayers") {
        alert(" ONlY Two Players Allowed !! ");
    }



}

function CreateLabel(arrScoreInfo) {
    const v = document.getElementById("scorelabel");

    while (v.firstChild) {
        v.removeChild(v.firstChild)
    }
    for (let clientObject of arrScoreInfo) {
        const l = document.createElement("label");
        l.textContent = clientObject.clientId + " Score is " + clientObject.score;
        l.style.color = "white";
        l.style.margin = "10px"
        v.appendChild(l);
    }
}