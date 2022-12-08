import { __extends } from "tslib";
import { PaneRendererBaselineArea, PaneRendererBaselineLine } from '../../renderers/baseline-renderer';
import { CompositeRenderer } from '../../renderers/composite-renderer';
import { LinePaneViewBase } from './line-pane-view-base';
var SeriesBaselinePaneView = /** @class */ (function (_super) {
    __extends(SeriesBaselinePaneView, _super);
    function SeriesBaselinePaneView(series, model) {
        var _this = _super.call(this, series, model) || this;
        _this._private__baselineAreaRenderer = new PaneRendererBaselineArea();
        _this._private__baselineLineRenderer = new PaneRendererBaselineLine();
        _this._private__compositeRenderer = new CompositeRenderer();
        _this._private__compositeRenderer._internal_setRenderers([_this._private__baselineAreaRenderer, _this._private__baselineLineRenderer]);
        return _this;
    }
    SeriesBaselinePaneView.prototype._internal_renderer = function (height, width) {
        if (!this._internal__series._internal_visible()) {
            return null;
        }
        var firstValue = this._internal__series._internal_firstValue();
        if (firstValue === null) {
            return null;
        }
        var baselineProps = this._internal__series._internal_options();
        this._internal__makeValid();
        var baseLevelCoordinate = this._internal__series._internal_priceScale()._internal_priceToCoordinate(baselineProps.baseValue.price, firstValue._internal_value);
        var barWidth = this._internal__model._internal_timeScale()._internal_barSpacing();
        this._private__baselineAreaRenderer._internal_setData({
            _internal_items: this._internal__items,
            _internal_topFillColor1: baselineProps.topFillColor1,
            _internal_topFillColor2: baselineProps.topFillColor2,
            _internal_bottomFillColor1: baselineProps.bottomFillColor1,
            _internal_bottomFillColor2: baselineProps.bottomFillColor2,
            _internal_lineWidth: baselineProps.lineWidth,
            _internal_lineStyle: baselineProps.lineStyle,
            _internal_lineType: 0 /* Simple */,
            _internal_baseLevelCoordinate: baseLevelCoordinate,
            _internal_bottom: height,
            _internal_visibleRange: this._internal__itemsVisibleRange,
            _internal_barWidth: barWidth,
        });
        this._private__baselineLineRenderer._internal_setData({
            _internal_items: this._internal__items,
            _internal_topColor: baselineProps.topLineColor,
            _internal_bottomColor: baselineProps.bottomLineColor,
            _internal_lineWidth: baselineProps.lineWidth,
            _internal_lineStyle: baselineProps.lineStyle,
            _internal_lineType: 0 /* Simple */,
            _internal_baseLevelCoordinate: baseLevelCoordinate,
            _internal_bottom: height,
            _internal_visibleRange: this._internal__itemsVisibleRange,
            _internal_barWidth: barWidth,
        });
        return this._private__compositeRenderer;
    };
    SeriesBaselinePaneView.prototype._internal__createRawItem = function (time, price) {
        return this._internal__createRawItemBase(time, price);
    };
    return SeriesBaselinePaneView;
}(LinePaneViewBase));
export { SeriesBaselinePaneView };
