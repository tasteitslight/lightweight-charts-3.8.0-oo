import { __extends } from "tslib";
import { generateContrastColors } from '../../helpers/color';
import { PriceAxisView } from './price-axis-view';
var CustomPriceLinePriceAxisView = /** @class */ (function (_super) {
    __extends(CustomPriceLinePriceAxisView, _super);
    function CustomPriceLinePriceAxisView(series, priceLine) {
        var _this = _super.call(this) || this;
        _this._private__series = series;
        _this._private__priceLine = priceLine;
        return _this;
    }
    CustomPriceLinePriceAxisView.prototype._internal__updateRendererData = function (axisRendererData, paneRendererData, commonData) {
        axisRendererData._internal_visible = false;
        paneRendererData._internal_visible = false;
        var options = this._private__priceLine._internal_options();
        var labelVisible = options.axisLabelVisible;
        var showPaneLabel = options.title !== '';
        var series = this._private__series;
        if (!labelVisible || !series._internal_visible()) {
            return;
        }
        var y = this._private__priceLine._internal_yCoord();
        if (y === null) {
            return;
        }
        if (showPaneLabel) {
            paneRendererData._internal_text = options.title;
            paneRendererData._internal_visible = true;
        }
        paneRendererData._internal_borderColor = series._internal_model()._internal_backgroundColorAtYPercentFromTop(y / series._internal_priceScale()._internal_height());
        axisRendererData._internal_text = series._internal_priceScale()._internal_formatPriceAbsolute(options.price);
        axisRendererData._internal_visible = true;
        var colors = generateContrastColors(options.color);
        commonData._internal_background = colors._internal_background;
        commonData._internal_color = colors._internal_foreground;
        commonData._internal_coordinate = y;
    };
    return CustomPriceLinePriceAxisView;
}(PriceAxisView));
export { CustomPriceLinePriceAxisView };
