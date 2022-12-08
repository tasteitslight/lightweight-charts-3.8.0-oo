import { assert } from '../helpers/assertions';
import { isFulfilledData } from './data-consumer';
import { convertTime } from './data-layer';
export function checkPriceLineOptions(options) {
    if (process.env.NODE_ENV === 'production') {
        return;
    }
    // eslint-disable-next-line @typescript-eslint/tslint/config
    assert(typeof options.price === 'number', "the type of 'price' price line's property must be a number, got '".concat(typeof options.price, "'"));
}
export function checkItemsAreOrdered(data, allowDuplicates) {
    if (allowDuplicates === void 0) { allowDuplicates = false; }
    if (process.env.NODE_ENV === 'production') {
        return;
    }
    if (data.length === 0) {
        return;
    }
    var prevTime = convertTime(data[0].time)._internal_timestamp;
    for (var i = 1; i < data.length; ++i) {
        var currentTime = convertTime(data[i].time)._internal_timestamp;
        var checkResult = allowDuplicates ? prevTime <= currentTime : prevTime < currentTime;
        assert(checkResult, "data must be asc ordered by time, index=".concat(i, ", time=").concat(currentTime, ", prev time=").concat(prevTime));
        prevTime = currentTime;
    }
}
export function checkSeriesValuesType(type, data) {
    if (process.env.NODE_ENV === 'production') {
        return;
    }
    data.forEach(getChecker(type));
}
function getChecker(type) {
    switch (type) {
        case 'Bar':
        case 'Candlestick':
            return checkBarItem.bind(null, type);
        case 'Area':
        case 'Baseline':
        case 'Line':
        case 'Histogram':
            return checkLineItem.bind(null, type);
    }
}
function checkBarItem(type, barItem) {
    if (!isFulfilledData(barItem)) {
        return;
    }
    assert(
    // eslint-disable-next-line @typescript-eslint/tslint/config
    typeof barItem.open === 'number', "".concat(type, " series item data value of open must be a number, got=").concat(typeof barItem.open, ", value=").concat(barItem.open));
    assert(
    // eslint-disable-next-line @typescript-eslint/tslint/config
    typeof barItem.high === 'number', "".concat(type, " series item data value of high must be a number, got=").concat(typeof barItem.high, ", value=").concat(barItem.high));
    assert(
    // eslint-disable-next-line @typescript-eslint/tslint/config
    typeof barItem.low === 'number', "".concat(type, " series item data value of low must be a number, got=").concat(typeof barItem.low, ", value=").concat(barItem.low));
    assert(
    // eslint-disable-next-line @typescript-eslint/tslint/config
    typeof barItem.close === 'number', "".concat(type, " series item data value of close must be a number, got=").concat(typeof barItem.close, ", value=").concat(barItem.close));
}
function checkLineItem(type, lineItem) {
    if (!isFulfilledData(lineItem)) {
        return;
    }
    assert(
    // eslint-disable-next-line @typescript-eslint/tslint/config
    typeof lineItem.value === 'number', "".concat(type, " series item data value must be a number, got=").concat(typeof lineItem.value, ", value=").concat(lineItem.value));
}
