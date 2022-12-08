import { equal, greaterOrEqual, isBaseDecimal, log10 } from '../helpers/mathex';
;
var PriceTickSpanCalculator = /** @class */ (function () {
    function PriceTickSpanCalculator(base, integralDividers) {
        this._private__base = base;
        this._private__integralDividers = integralDividers;
        if (isBaseDecimal(this._private__base)) {
            this._private__fractionalDividers = [2, 2.5, 2];
        }
        else {
            this._private__fractionalDividers = [];
            for (var baseRest = this._private__base; baseRest !== 1;) {
                if ((baseRest % 2) === 0) {
                    this._private__fractionalDividers.push(2);
                    baseRest /= 2;
                }
                else if ((baseRest % 5) === 0) {
                    this._private__fractionalDividers.push(2, 2.5);
                    baseRest /= 5;
                }
                else {
                    throw new Error('unexpected base');
                }
                if (this._private__fractionalDividers.length > 100) {
                    throw new Error('something wrong with base');
                }
            }
        }
    }
    PriceTickSpanCalculator.prototype._internal_tickSpan = function (high, low, maxTickSpan) {
        var minMovement = (this._private__base === 0) ? (0) : (1 / this._private__base);
        var resultTickSpan = Math.pow(10, Math.max(0, Math.ceil(log10(high - low))));
        var index = 0;
        var c = this._private__integralDividers[0];
        // eslint-disable-next-line no-constant-condition
        while (true) {
            // the second part is actual for small with very small values like 1e-10
            // greaterOrEqual fails for such values
            var resultTickSpanLargerMinMovement = greaterOrEqual(resultTickSpan, minMovement, 1e-14 /* TickSpanEpsilon */) && resultTickSpan > (minMovement + 1e-14 /* TickSpanEpsilon */);
            var resultTickSpanLargerMaxTickSpan = greaterOrEqual(resultTickSpan, maxTickSpan * c, 1e-14 /* TickSpanEpsilon */);
            var resultTickSpanLarger1 = greaterOrEqual(resultTickSpan, 1, 1e-14 /* TickSpanEpsilon */);
            var haveToContinue = resultTickSpanLargerMinMovement && resultTickSpanLargerMaxTickSpan && resultTickSpanLarger1;
            if (!haveToContinue) {
                break;
            }
            resultTickSpan /= c;
            c = this._private__integralDividers[++index % this._private__integralDividers.length];
        }
        if (resultTickSpan <= (minMovement + 1e-14 /* TickSpanEpsilon */)) {
            resultTickSpan = minMovement;
        }
        resultTickSpan = Math.max(1, resultTickSpan);
        if ((this._private__fractionalDividers.length > 0) && equal(resultTickSpan, 1, 1e-14 /* TickSpanEpsilon */)) {
            index = 0;
            c = this._private__fractionalDividers[0];
            while (greaterOrEqual(resultTickSpan, maxTickSpan * c, 1e-14 /* TickSpanEpsilon */) && resultTickSpan > (minMovement + 1e-14 /* TickSpanEpsilon */)) {
                resultTickSpan /= c;
                c = this._private__fractionalDividers[++index % this._private__fractionalDividers.length];
            }
        }
        return resultTickSpan;
    };
    return PriceTickSpanCalculator;
}());
export { PriceTickSpanCalculator };
