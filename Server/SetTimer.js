const GetScore =require('./GetScore');

function SetTimer(isGameRunning,games,clientdict) {
    var second = 20;
    var interval = setInterval(function () {
        if (second == 0) {
            isGameRunning = false;
            var clientInfo = GetScore(clientdict);

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
module.exports=SetTimer;