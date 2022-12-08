import { isWhitespaceData } from './data-consumer';
function getLineBasedSeriesPlotRow(time, index, item) {
    var val = item.value;
    return { _internal_index: index, _internal_time: time, _internal_value: [val, val, val, val] };
}
function getColoredLineBasedSeriesPlotRow(time, index, item) {
    var val = item.value;
    var res = { _internal_index: index, _internal_time: time, _internal_value: [val, val, val, val] };
    // 'color' here is public property (from API) so we can use `in` here safely
    // eslint-disable-next-line no-restricted-syntax
    if ('color' in item && item.color !== undefined) {
        res._internal_color = item.color;
    }
    return res;
}
function getBarSeriesPlotRow(time, index, item) {
    var res = { _internal_index: index, _internal_time: time, _internal_value: [item.open, item.high, item.low, item.close] };
    // 'color' here is public property (from API) so we can use `in` here safely
    // eslint-disable-next-line no-restricted-syntax
    if ('color' in item && item.color !== undefined) {
        res._internal_color = item.color;
    }
    return res;
}
function getCandlestickSeriesPlotRow(time, index, item) {
    var res = { _internal_index: index, _internal_time: time, _internal_value: [item.open, item.high, item.low, item.close] };
    // 'color' here is public property (from API) so we can use `in` here safely
    // eslint-disable-next-line no-restricted-syntax
    if ('color' in item && item.color !== undefined) {
        res._internal_color = item.color;
    }
    // 'borderColor' here is public property (from API) so we can use `in` here safely
    // eslint-disable-next-line no-restricted-syntax
    if ('borderColor' in item && item.borderColor !== undefined) {
        res._internal_borderColor = item.borderColor;
    }
    // 'wickColor' here is public property (from API) so we can use `in` here safely
    // eslint-disable-next-line no-restricted-syntax
    if ('wickColor' in item && item.wickColor !== undefined) {
        res._internal_wickColor = item.wickColor;
    }
    return res;
}
export function isSeriesPlotRow(row) {
    return row._internal_value !== undefined;
}
function wrapWhitespaceData(createPlotRowFn) {
    return function (time, index, bar) {
        if (isWhitespaceData(bar)) {
            return { _internal_time: time, _internal_index: index };
        }
        return createPlotRowFn(time, index, bar);
    };
}
var seriesPlotRowFnMap = {
    Candlestick: wrapWhitespaceData(getCandlestickSeriesPlotRow),
    Bar: wrapWhitespaceData(getBarSeriesPlotRow),
    Area: wrapWhitespaceData(getLineBasedSeriesPlotRow),
    Baseline: wrapWhitespaceData(getLineBasedSeriesPlotRow),
    Histogram: wrapWhitespaceData(getColoredLineBasedSeriesPlotRow),
    Line: wrapWhitespaceData(getColoredLineBasedSeriesPlotRow),
};
export function getSeriesPlotRowCreator(seriesType) {
    return seriesPlotRowFnMap[seriesType];
}
