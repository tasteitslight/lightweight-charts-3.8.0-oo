import { isInteger, isNumber } from '../helpers/strict-type-checks';
var formatterOptions = {
    _internal_decimalSign: '.',
    _internal_decimalSignFractional: '\'',
};
/**
 * @param value - The number of convert.
 * @param length - The length. Must be between 0 and 16 inclusive.
 */
export function numberToStringWithLeadingZero(value, length) {
    if (!isNumber(value)) {
        return 'n/a';
    }
    if (!isInteger(length)) {
        throw new TypeError('invalid length');
    }
    if (length < 0 || length > 16) {
        throw new TypeError('invalid length');
    }
    if (length === 0) {
        return value.toString();
    }
    var dummyString = '0000000000000000';
    return (dummyString + value.toString()).slice(-length);
}
var PriceFormatter = /** @class */ (function () {
    function PriceFormatter(priceScale, minMove) {
        if (!minMove) {
            minMove = 1;
        }
        if (!isNumber(priceScale) || !isInteger(priceScale)) {
            priceScale = 100;
        }
        if (priceScale < 0) {
            throw new TypeError('invalid base');
        }
        this._private__priceScale = priceScale;
        this._private__minMove = minMove;
        this._private__calculateDecimal();
    }
    PriceFormatter.prototype.format = function (price) {
        // \u2212 is unicode's minus sign https://www.fileformat.info/info/unicode/char/2212/index.htm
        // we should use it because it has the same width as plus sign +
        var sign = price < 0 ? '\u2212' : '';
        price = Math.abs(price);
        return sign + this._private__formatAsDecimal(price);
    };
    PriceFormatter.prototype._private__calculateDecimal = function () {
        // check if this._base is power of 10
        // for double fractional _fractionalLength if for the main fractional only
        this._internal__fractionalLength = 0;
        if (this._private__priceScale > 0 && this._private__minMove > 0) {
            var base = this._private__priceScale;
            while (base > 1) {
                base /= 10;
                this._internal__fractionalLength++;
            }
        }
    };
    PriceFormatter.prototype._private__formatAsDecimal = function (price) {
        var base = this._private__priceScale / this._private__minMove;
        var intPart = Math.floor(price);
        var fracString = '';
        var fracLength = this._internal__fractionalLength !== undefined ? this._internal__fractionalLength : NaN;
        if (base > 1) {
            var fracPart = +(Math.round(price * base) - intPart * base).toFixed(this._internal__fractionalLength);
            if (fracPart >= base) {
                fracPart -= base;
                intPart += 1;
            }
            fracString = formatterOptions._internal_decimalSign + numberToStringWithLeadingZero(+fracPart.toFixed(this._internal__fractionalLength) * this._private__minMove, fracLength);
        }
        else {
            // should round int part to min move
            intPart = Math.round(intPart * base) / base;
            // if min move > 1, fractional part is always = 0
            if (fracLength > 0) {
                fracString = formatterOptions._internal_decimalSign + numberToStringWithLeadingZero(0, fracLength);
            }
        }
        return intPart.toFixed(0) + fracString;
    };
    return PriceFormatter;
}());
export { PriceFormatter };
