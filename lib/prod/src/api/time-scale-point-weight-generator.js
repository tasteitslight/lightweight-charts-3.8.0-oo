function hours(count) {
    return count * 60 * 60 * 1000;
}
function minutes(count) {
    return count * 60 * 1000;
}
function seconds(count) {
    return count * 1000;
}
var intradayWeightDivisors = [
    { _internal_divisor: seconds(1), _internal_weight: 10 /* Second */ },
    { _internal_divisor: minutes(1), _internal_weight: 20 /* Minute1 */ },
    { _internal_divisor: minutes(5), _internal_weight: 21 /* Minute5 */ },
    { _internal_divisor: minutes(30), _internal_weight: 22 /* Minute30 */ },
    { _internal_divisor: hours(1), _internal_weight: 30 /* Hour1 */ },
    { _internal_divisor: hours(3), _internal_weight: 31 /* Hour3 */ },
    { _internal_divisor: hours(6), _internal_weight: 32 /* Hour6 */ },
    { _internal_divisor: hours(12), _internal_weight: 33 /* Hour12 */ },
];
function weightByTime(currentDate, prevDate) {
    if (currentDate.getUTCFullYear() !== prevDate.getUTCFullYear()) {
        return 70 /* Year */;
    }
    else if (currentDate.getUTCMonth() !== prevDate.getUTCMonth()) {
        return 60 /* Month */;
    }
    else if (currentDate.getUTCDate() !== prevDate.getUTCDate()) {
        return 50 /* Day */;
    }
    for (var i = intradayWeightDivisors.length - 1; i >= 0; --i) {
        if (Math.floor(prevDate.getTime() / intradayWeightDivisors[i]._internal_divisor) !== Math.floor(currentDate.getTime() / intradayWeightDivisors[i]._internal_divisor)) {
            return intradayWeightDivisors[i]._internal_weight;
        }
    }
    return 0 /* LessThanSecond */;
}
export function fillWeightsForPoints(sortedTimePoints, startIndex) {
    if (startIndex === void 0) { startIndex = 0; }
    if (sortedTimePoints.length === 0) {
        return;
    }
    var prevTime = startIndex === 0 ? null : sortedTimePoints[startIndex - 1]._internal_time._internal_timestamp;
    var prevDate = prevTime !== null ? new Date(prevTime * 1000) : null;
    var totalTimeDiff = 0;
    for (var index = startIndex; index < sortedTimePoints.length; ++index) {
        var currentPoint = sortedTimePoints[index];
        var currentDate = new Date(currentPoint._internal_time._internal_timestamp * 1000);
        if (prevDate !== null) {
            currentPoint._internal_timeWeight = weightByTime(currentDate, prevDate);
        }
        totalTimeDiff += currentPoint._internal_time._internal_timestamp - (prevTime || currentPoint._internal_time._internal_timestamp);
        prevTime = currentPoint._internal_time._internal_timestamp;
        prevDate = currentDate;
    }
    if (startIndex === 0 && sortedTimePoints.length > 1) {
        // let's guess a weight for the first point
        // let's say the previous point was average time back in the history
        var averageTimeDiff = Math.ceil(totalTimeDiff / (sortedTimePoints.length - 1));
        var approxPrevDate = new Date((sortedTimePoints[0]._internal_time._internal_timestamp - averageTimeDiff) * 1000);
        sortedTimePoints[0]._internal_timeWeight = weightByTime(new Date(sortedTimePoints[0]._internal_time._internal_timestamp * 1000), approxPrevDate);
    }
}
