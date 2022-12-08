import { __extends } from "tslib";
import { ensureNotNull } from '../../helpers/assertions';
import { visibleTimedValues } from '../../model/time-data';
import { CompositeRenderer } from '../../renderers/composite-renderer';
import { PaneRendererHistogram } from '../../renderers/histogram-renderer';
import { SeriesPaneViewBase } from './series-pane-view-base';
function createEmptyHistogramData(barSpacing) {
    return {
        _internal_items: [],
        _internal_barSpacing: barSpacing,
        _internal_histogramBase: NaN,
        _internal_visibleRange: null,
    };
}
function createRawItem(time, price, color) {
    return {
        _internal_time: time,
        _internal_price: price,
        _internal_x: NaN,
        _internal_y: NaN,
        _internal_color: color,
    };
}
var SeriesHistogramPaneView = /** @class */ (function (_super) {
    __extends(SeriesHistogramPaneView, _super);
    function SeriesHistogramPaneView(series, model) {
        var _this = _super.call(this, series, model, false) || this;
        _this._private__compositeRenderer = new CompositeRenderer();
        _this._private__histogramData = createEmptyHistogramData(0);
        _this._private__renderer = new PaneRendererHistogram();
        return _this;
    }
    SeriesHistogramPaneView.prototype._internal_renderer = function (height, width) {
        if (!this._internal__series._internal_visible()) {
            return null;
        }
        this._internal__makeValid();
        return this._private__compositeRenderer;
    };
    SeriesHistogramPaneView.prototype._internal__fillRawPoints = function () {
        var barSpacing = this._internal__model._internal_timeScale()._internal_barSpacing();
        this._private__histogramData = createEmptyHistogramData(barSpacing);
        var targetIndex = 0;
        var itemIndex = 0;
        var defaultColor = this._internal__series._internal_options().color;
        for (var _i = 0, _a = this._internal__series._internal_bars()._internal_rows(); _i < _a.length; _i++) {
            var row = _a[_i];
            var value = row._internal_value[3 /* Close */];
            var color = row._internal_color !== undefined ? row._internal_color : defaultColor;
            var item = createRawItem(row._internal_index, value, color);
            targetIndex++;
            if (targetIndex < this._private__histogramData._internal_items.length) {
                this._private__histogramData._internal_items[targetIndex] = item;
            }
            else {
                this._private__histogramData._internal_items.push(item);
            }
            this._internal__items[itemIndex++] = { _internal_time: row._internal_index, _internal_x: 0 };
        }
        this._private__renderer._internal_setData(this._private__histogramData);
        this._private__compositeRenderer._internal_setRenderers([this._private__renderer]);
    };
    SeriesHistogramPaneView.prototype._internal__updateOptions = function () { };
    SeriesHistogramPaneView.prototype._internal__clearVisibleRange = function () {
        _super.prototype._internal__clearVisibleRange.call(this);
        this._private__histogramData._internal_visibleRange = null;
    };
    SeriesHistogramPaneView.prototype._internal__convertToCoordinates = function (priceScale, timeScale, firstValue) {
        if (this._internal__itemsVisibleRange === null) {
            return;
        }
        var barSpacing = timeScale._internal_barSpacing();
        var visibleBars = ensureNotNull(timeScale._internal_visibleStrictRange());
        var histogramBase = priceScale._internal_priceToCoordinate(this._internal__series._internal_options().base, firstValue);
        timeScale._internal_indexesToCoordinates(this._private__histogramData._internal_items);
        priceScale._internal_pointsArrayToCoordinates(this._private__histogramData._internal_items, firstValue);
        this._private__histogramData._internal_histogramBase = histogramBase;
        this._private__histogramData._internal_visibleRange = visibleTimedValues(this._private__histogramData._internal_items, visibleBars, false);
        this._private__histogramData._internal_barSpacing = barSpacing;
        // need this to update cache
        this._private__renderer._internal_setData(this._private__histogramData);
    };
    return SeriesHistogramPaneView;
}(SeriesPaneViewBase));
export { SeriesHistogramPaneView };
