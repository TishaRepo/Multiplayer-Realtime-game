const GetPattern= function (currentPattern) {
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
module.exports=GetPattern ;