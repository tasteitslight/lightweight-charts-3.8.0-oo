import { __assign, __extends } from "tslib";
import { PaneRendererCandlesticks, } from '../../renderers/candlesticks-renderer';
import { BarsPaneViewBase } from './bars-pane-view-base';
var SeriesCandlesticksPaneView = /** @class */ (function (_super) {
    __extends(SeriesCandlesticksPaneView, _super);
    function SeriesCandlesticksPaneView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._private__renderer = new PaneRendererCandlesticks();
        return _this;
    }
    SeriesCandlesticksPaneView.prototype._internal_renderer = function (height, width) {
        if (!this._internal__series._internal_visible()) {
            return null;
        }
        var candlestickStyleProps = this._internal__series._internal_options();
        this._internal__makeValid();
        var data = {
            _internal_bars: this._internal__items,
            _internal_barSpacing: this._internal__model._internal_timeScale()._internal_barSpacing(),
            _internal_wickVisible: candlestickStyleProps.wickVisible,
            _internal_borderVisible: candlestickStyleProps.borderVisible,
            _internal_visibleRange: this._internal__itemsVisibleRange,
        };
        this._private__renderer._internal_setData(data);
        return this._private__renderer;
    };
    SeriesCandlesticksPaneView.prototype._internal__updateOptions = function () {
        var _this = this;
        this._internal__items.forEach(function (item) {
            var style = _this._internal__series._internal_barColorer()._internal_barStyle(item._internal_time);
            item._internal_color = style._internal_barColor;
            item._internal_wickColor = style._internal_barWickColor;
            item._internal_borderColor = style._internal_barBorderColor;
        });
    };
    SeriesCandlesticksPaneView.prototype._internal__createRawItem = function (time, bar, colorer) {
        var style = colorer._internal_barStyle(time);
        return __assign(__assign({}, this._internal__createDefaultItem(time, bar, colorer)), { _internal_color: style._internal_barColor, _internal_wickColor: style._internal_barWickColor, _internal_borderColor: style._internal_barBorderColor });
    };
    return SeriesCandlesticksPaneView;
}(BarsPaneViewBase));
export { SeriesCandlesticksPaneView };
