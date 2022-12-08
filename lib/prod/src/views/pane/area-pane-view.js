import { __extends } from "tslib";
import { PaneRendererArea } from '../../renderers/area-renderer';
import { CompositeRenderer } from '../../renderers/composite-renderer';
import { PaneRendererLine } from '../../renderers/line-renderer';
import { LinePaneViewBase } from './line-pane-view-base';
var SeriesAreaPaneView = /** @class */ (function (_super) {
    __extends(SeriesAreaPaneView, _super);
    function SeriesAreaPaneView(series, model) {
        var _this = _super.call(this, series, model) || this;
        _this._private__renderer = new CompositeRenderer();
        _this._private__areaRenderer = new PaneRendererArea();
        _this._private__lineRenderer = new PaneRendererLine();
        _this._private__renderer._internal_setRenderers([_this._private__areaRenderer, _this._private__lineRenderer]);
        return _this;
    }
    SeriesAreaPaneView.prototype._internal_renderer = function (height, width) {
        if (!this._internal__series._internal_visible()) {
            return null;
        }
        var areaStyleProperties = this._internal__series._internal_options();
        this._internal__makeValid();
        this._private__areaRenderer._internal_setData({
            _internal_lineType: areaStyleProperties.lineType,
            _internal_items: this._internal__items,
            _internal_lineStyle: areaStyleProperties.lineStyle,
            _internal_lineWidth: areaStyleProperties.lineWidth,
            _internal_topColor: areaStyleProperties.topColor,
            _internal_bottomColor: areaStyleProperties.bottomColor,
            _internal_baseLevelCoordinate: height,
            _internal_bottom: height,
            _internal_visibleRange: this._internal__itemsVisibleRange,
            _internal_barWidth: this._internal__model._internal_timeScale()._internal_barSpacing(),
        });
        this._private__lineRenderer._internal_setData({
            _internal_lineType: areaStyleProperties.lineType,
            _internal_items: this._internal__items,
            _internal_lineColor: areaStyleProperties.lineColor,
            _internal_lineStyle: areaStyleProperties.lineStyle,
            _internal_lineWidth: areaStyleProperties.lineWidth,
            _internal_visibleRange: this._internal__itemsVisibleRange,
            _internal_barWidth: this._internal__model._internal_timeScale()._internal_barSpacing(),
        });
        return this._private__renderer;
    };
    SeriesAreaPaneView.prototype._internal__createRawItem = function (time, price) {
        return this._internal__createRawItemBase(time, price);
    };
    return SeriesAreaPaneView;
}(LinePaneViewBase));
export { SeriesAreaPaneView };
