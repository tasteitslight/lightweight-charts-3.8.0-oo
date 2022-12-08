import { __extends } from "tslib";
import { undefinedIfNull } from '../../helpers/strict-type-checks';
import { SeriesPaneViewBase } from './series-pane-view-base';
var LinePaneViewBase = /** @class */ (function (_super) {
    __extends(LinePaneViewBase, _super);
    function LinePaneViewBase(series, model) {
        return _super.call(this, series, model, true) || this;
    }
    LinePaneViewBase.prototype._internal__convertToCoordinates = function (priceScale, timeScale, firstValue) {
        timeScale._internal_indexesToCoordinates(this._internal__items, undefinedIfNull(this._internal__itemsVisibleRange));
        priceScale._internal_pointsArrayToCoordinates(this._internal__items, firstValue, undefinedIfNull(this._internal__itemsVisibleRange));
    };
    LinePaneViewBase.prototype._internal__createRawItemBase = function (time, price) {
        return {
            _internal_time: time,
            _internal_price: price,
            _internal_x: NaN,
            _internal_y: NaN,
        };
    };
    LinePaneViewBase.prototype._internal__updateOptions = function () { };
    LinePaneViewBase.prototype._internal__fillRawPoints = function () {
        var _this = this;
        var colorer = this._internal__series._internal_barColorer();
        this._internal__items = this._internal__series._internal_bars()._internal_rows().map(function (row) {
            var value = row._internal_value[3 /* Close */];
            return _this._internal__createRawItem(row._internal_index, value, colorer);
        });
    };
    return LinePaneViewBase;
}(SeriesPaneViewBase));
export { LinePaneViewBase };
