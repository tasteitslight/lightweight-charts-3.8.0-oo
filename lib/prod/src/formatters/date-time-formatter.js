import { __assign } from "tslib";
import { DateFormatter } from './date-formatter';
import { TimeFormatter } from './time-formatter';
var defaultParams = {
    _internal_dateFormat: 'yyyy-MM-dd',
    _internal_timeFormat: '%h:%m:%s',
    _internal_dateTimeSeparator: ' ',
    _internal_locale: 'default',
};
var DateTimeFormatter = /** @class */ (function () {
    function DateTimeFormatter(params) {
        if (params === void 0) { params = {}; }
        var formatterParams = __assign(__assign({}, defaultParams), params);
        this._private__dateFormatter = new DateFormatter(formatterParams._internal_dateFormat, formatterParams._internal_locale);
        this._private__timeFormatter = new TimeFormatter(formatterParams._internal_timeFormat);
        this._private__separator = formatterParams._internal_dateTimeSeparator;
    }
    DateTimeFormatter.prototype._internal_format = function (dateTime) {
        return "".concat(this._private__dateFormatter._internal_format(dateTime)).concat(this._private__separator).concat(this._private__timeFormatter._internal_format(dateTime));
    };
    return DateTimeFormatter;
}());
export { DateTimeFormatter };
