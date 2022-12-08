import { __extends } from "tslib";
import { DataSource } from './data-source';
var PriceDataSource = /** @class */ (function (_super) {
    __extends(PriceDataSource, _super);
    function PriceDataSource(model) {
        var _this = _super.call(this) || this;
        _this._private__model = model;
        return _this;
    }
    PriceDataSource.prototype._internal_model = function () {
        return this._private__model;
    };
    return PriceDataSource;
}(DataSource));
export { PriceDataSource };
