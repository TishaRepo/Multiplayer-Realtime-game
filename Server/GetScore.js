const GetScore = function (clientdict) {
    var arrClientInfo = [];
    for (const key in clientdict) {
        let objClient = {}

        objClient["clientId"] = key;
        objClient["score"] = clientdict[key].score;
        


        arrClientInfo.push(objClient);
    }


    return arrClientInfo;
}
module.exports=GetScore;