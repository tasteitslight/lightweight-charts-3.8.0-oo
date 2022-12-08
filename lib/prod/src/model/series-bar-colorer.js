import { __assign } from "tslib";
import { ensure, ensureNotNull } from '../helpers/assertions';
var emptyResult = {
    _internal_barColor: '',
    _internal_barBorderColor: '',
    _internal_barWickColor: '',
};
var SeriesBarColorer = /** @class */ (function () {
    function SeriesBarColorer(series) {
        this._private__series = series;
    }
    SeriesBarColorer.prototype._internal_barStyle = function (barIndex, precomputedBars) {
        // precomputedBars: {value: [Array BarValues], previousValue: [Array BarValues] | undefined}
        // Used to avoid binary search if bars are already known
        var targetType = this._private__series._internal_seriesType();
        var seriesOptions = this._private__series._internal_options();
        switch (targetType) {
            case 'Line':
                return this._private__lineStyle(seriesOptions, barIndex, precomputedBars);
            case 'Area':
                return this._private__areaStyle(seriesOptions);
            case 'Baseline':
                return this._private__baselineStyle(seriesOptions, barIndex, precomputedBars);
            case 'Bar':
                return this._private__barStyle(seriesOptions, barIndex, precomputedBars);
            case 'Candlestick':
                return this._private__candleStyle(seriesOptions, barIndex, precomputedBars);
            case 'Histogram':
                return this._private__histogramStyle(seriesOptions, barIndex, precomputedBars);
        }
        throw new Error('Unknown chart style');
    };
    SeriesBarColorer.prototype._private__barStyle = function (barStyle, barIndex, precomputedBars) {
        var result = __assign({}, emptyResult);
        var upColor = barStyle.upColor;
        var downColor = barStyle.downColor;
        var borderUpColor = upColor;
        var borderDownColor = downColor;
        var currentBar = ensureNotNull(this._private__findBar(barIndex, precomputedBars));
        var isUp = ensure(currentBar._internal_value[0 /* Open */]) <= ensure(currentBar._internal_value[3 /* Close */]);
        if (currentBar._internal_color !== undefined) {
            result._internal_barColor = currentBar._internal_color;
            result._internal_barBorderColor = currentBar._internal_color;
        }
        else {
            result._internal_barColor = isUp ? upColor : downColor;
            result._internal_barBorderColor = isUp ? borderUpColor : borderDownColor;
        }
        return result;
    };
    SeriesBarColorer.prototype._private__candleStyle = function (candlestickStyle, barIndex, precomputedBars) {
        var _a, _b, _c;
        var result = __assign({}, emptyResult);
        var upColor = candlestickStyle.upColor;
        var downColor = candlestickStyle.downColor;
        var borderUpColor = candlestickStyle.borderUpColor;
        var borderDownColor = candlestickStyle.borderDownColor;
        var wickUpColor = candlestickStyle.wickUpColor;
        var wickDownColor = candlestickStyle.wickDownColor;
        var currentBar = ensureNotNull(this._private__findBar(barIndex, precomputedBars));
        var isUp = ensure(currentBar._internal_value[0 /* Open */]) <= ensure(currentBar._internal_value[3 /* Close */]);
        result._internal_barColor = (_a = currentBar._internal_color) !== null && _a !== void 0 ? _a : (isUp ? upColor : downColor);
        result._internal_barBorderColor = (_b = currentBar._internal_borderColor) !== null && _b !== void 0 ? _b : (isUp ? borderUpColor : borderDownColor);
        result._internal_barWickColor = (_c = currentBar._internal_wickColor) !== null && _c !== void 0 ? _c : (isUp ? wickUpColor : wickDownColor);
        return result;
    };
    SeriesBarColorer.prototype._private__areaStyle = function (areaStyle) {
        return __assign(__assign({}, emptyResult), { _internal_barColor: areaStyle.lineColor });
    };
    SeriesBarColorer.prototype._private__baselineStyle = function (baselineStyle, barIndex, precomputedBars) {
        var currentBar = ensureNotNull(this._private__findBar(barIndex, precomputedBars));
        var isAboveBaseline = currentBar._internal_value[3 /* Close */] >= baselineStyle.baseValue.price;
        return __assign(__assign({}, emptyResult), { _internal_barColor: isAboveBaseline ? baselineStyle.topLineColor : baselineStyle.bottomLineColor });
    };
    SeriesBarColorer.prototype._private__lineStyle = function (lineStyle, barIndex, precomputedBars) {
        var _a;
        var currentBar = ensureNotNull(this._private__findBar(barIndex, precomputedBars));
        return __assign(__assign({}, emptyResult), { _internal_barColor: (_a = currentBar._internal_color) !== null && _a !== void 0 ? _a : lineStyle.color });
    };
    SeriesBarColorer.prototype._private__histogramStyle = function (histogramStyle, barIndex, precomputedBars) {
        var result = __assign({}, emptyResult);
        var currentBar = ensureNotNull(this._private__findBar(barIndex, precomputedBars));
        result._internal_barColor = currentBar._internal_color !== undefined ? currentBar._internal_color : histogramStyle.color;
        return result;
    };
    SeriesBarColorer.prototype._private__findBar = function (barIndex, precomputedBars) {
        if (precomputedBars !== undefined) {
            return precomputedBars._internal_value;
        }
        return this._private__series._internal_bars()._internal_valueAt(barIndex);
    };
    return SeriesBarColorer;
}());
export { SeriesBarColorer };
