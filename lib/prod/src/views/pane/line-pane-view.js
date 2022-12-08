import { __extends } from "tslib";
import { PaneRendererLine } from '../../renderers/line-renderer';
import { LinePaneViewBase } from './line-pane-view-base';
var SeriesLinePaneView = /** @class */ (function (_super) {
    __extends(SeriesLinePaneView, _super);
    // eslint-disable-next-line no-useless-constructor
    function SeriesLinePaneView(series, model) {
        var _this = _super.call(this, series, model) || this;
        _this._private__lineRenderer = new PaneRendererLine();
        return _this;
    }
    SeriesLinePaneView.prototype._internal_renderer = function (height, width) {
        if (!this._internal__series._internal_visible()) {
            return null;
        }
        var lineStyleProps = this._internal__series._internal_options();
        this._internal__makeValid();
        var data = {
            _internal_items: this._internal__items,
            _internal_lineColor: lineStyleProps.color,
            _internal_lineStyle: lineStyleProps.lineStyle,
            _internal_lineType: lineStyleProps.lineType,
            _internal_lineWidth: lineStyleProps.lineWidth,
            _internal_visibleRange: this._internal__itemsVisibleRange,
            _internal_barWidth: this._internal__model._internal_timeScale()._internal_barSpacing(),
        };
        this._private__lineRenderer._internal_setData(data);
        return this._private__lineRenderer;
    };
    SeriesLinePaneView.prototype._internal__updateOptions = function () {
        var _this = this;
        this._internal__items.forEach(function (item) {
            item._internal_color = _this._internal__series._internal_barColorer()._internal_barStyle(item._internal_time)._internal_barColor;
        });
    };
    SeriesLinePaneView.prototype._internal__createRawItem = function (time, price, colorer) {
        var item = this._internal__createRawItemBase(time, price);
        item._internal_color = colorer._internal_barStyle(time)._internal_barColor;
        return item;
    };
    return SeriesLinePaneView;
}(LinePaneViewBase));
export { SeriesLinePaneView };
