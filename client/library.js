// this is for both client and server

function encodeObject(Object)
{
  var encodedObject= JSON.stringify(Object);
  return encodedObject ;
}

function parseObject(Object)
{
  var parsedObject= JSON.parse(Object);
  return parsedObject ;
}

function GetPattern(currentPattern) {
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

(function (exports) {

    //this is for server 
    const genid = () => Math.floor(Math.random() * 900000 + 100000);


    
    //exports function
    exports.encodeObject =encodeObject;
    exports.parseObject =parseObject;
    exports.genid = genid;
    exports.GetPattern = GetPattern;

})(typeof exports === 'undefined' ? this['sampleModule'] = {} : exports);