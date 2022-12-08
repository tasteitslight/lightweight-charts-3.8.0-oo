import { __extends } from "tslib";
import { generateContrastColors } from '../../helpers/color';
import { PriceAxisView } from './price-axis-view';
var SeriesPriceAxisView = /** @class */ (function (_super) {
    __extends(SeriesPriceAxisView, _super);
    function SeriesPriceAxisView(source) {
        var _this = _super.call(this) || this;
        _this._private__source = source;
        return _this;
    }
    SeriesPriceAxisView.prototype._internal__updateRendererData = function (axisRendererData, paneRendererData, commonRendererData) {
        axisRendererData._internal_visible = false;
        paneRendererData._internal_visible = false;
        var source = this._private__source;
        if (!source._internal_visible()) {
            return;
        }
        var seriesOptions = source._internal_options();
        var showSeriesLastValue = seriesOptions.lastValueVisible;
        var showSymbolLabel = source._internal_title() !== '';
        var showPriceAndPercentage = seriesOptions.seriesLastValueMode === 0 /* LastPriceAndPercentageValue */;
        var lastValueData = source._internal_lastValueData(false);
        if (lastValueData._internal_noData) {
            return;
        }
        if (showSeriesLastValue) {
            axisRendererData._internal_text = this._internal__axisText(lastValueData, showSeriesLastValue, showPriceAndPercentage);
            axisRendererData._internal_visible = axisRendererData._internal_text.length !== 0;
        }
        if (showSymbolLabel || showPriceAndPercentage) {
            paneRendererData._internal_text = this._internal__paneText(lastValueData, showSeriesLastValue, showSymbolLabel, showPriceAndPercentage);
            paneRendererData._internal_visible = paneRendererData._internal_text.length > 0;
        }
        var lastValueColor = source._internal_priceLineColor(lastValueData._internal_color);
        var colors = generateContrastColors(lastValueColor);
        commonRendererData._internal_background = colors._internal_background;
        commonRendererData._internal_color = colors._internal_foreground;
        commonRendererData._internal_coordinate = lastValueData._internal_coordinate;
        paneRendererData._internal_borderColor = source._internal_model()._internal_backgroundColorAtYPercentFromTop(lastValueData._internal_coordinate / source._internal_priceScale()._internal_height());
        axisRendererData._internal_borderColor = lastValueColor;
    };
    SeriesPriceAxisView.prototype._internal__paneText = function (lastValue, showSeriesLastValue, showSymbolLabel, showPriceAndPercentage) {
        var result = '';
        var title = this._private__source._internal_title();
        if (showSymbolLabel && title.length !== 0) {
            result += "".concat(title, " ");
        }
        if (showSeriesLastValue && showPriceAndPercentage) {
            result += this._private__source._internal_priceScale()._internal_isPercentage() ?
                lastValue._internal_formattedPriceAbsolute : lastValue._internal_formattedPricePercentage;
        }
        return result.trim();
    };
    SeriesPriceAxisView.prototype._internal__axisText = function (lastValueData, showSeriesLastValue, showPriceAndPercentage) {
        if (!showSeriesLastValue) {
            return '';
        }
        if (!showPriceAndPercentage) {
            return lastValueData._internal_text;
        }
        return this._private__source._internal_priceScale()._internal_isPercentage() ?
            lastValueData._internal_formattedPricePercentage : lastValueData._internal_formattedPriceAbsolute;
    };
    return SeriesPriceAxisView;
}(PriceAxisView));
export { SeriesPriceAxisView };
