import { log10 } from '../helpers/mathex';
import { PriceRangeImpl } from './price-range-impl';
var defLogFormula = {
    _internal_logicalOffset: 4,
    _internal_coordOffset: 0.0001,
};
export function fromPercent(value, baseValue) {
    if (baseValue < 0) {
        value = -value;
    }
    return (value / 100) * baseValue + baseValue;
}
export function toPercent(value, baseValue) {
    var result = 100 * (value - baseValue) / baseValue;
    return (baseValue < 0 ? -result : result);
}
export function toPercentRange(priceRange, baseValue) {
    var minPercent = toPercent(priceRange._internal_minValue(), baseValue);
    var maxPercent = toPercent(priceRange._internal_maxValue(), baseValue);
    return new PriceRangeImpl(minPercent, maxPercent);
}
export function fromIndexedTo100(value, baseValue) {
    value -= 100;
    if (baseValue < 0) {
        value = -value;
    }
    return (value / 100) * baseValue + baseValue;
}
export function toIndexedTo100(value, baseValue) {
    var result = 100 * (value - baseValue) / baseValue + 100;
    return (baseValue < 0 ? -result : result);
}
export function toIndexedTo100Range(priceRange, baseValue) {
    var minPercent = toIndexedTo100(priceRange._internal_minValue(), baseValue);
    var maxPercent = toIndexedTo100(priceRange._internal_maxValue(), baseValue);
    return new PriceRangeImpl(minPercent, maxPercent);
}
export function toLog(price, logFormula) {
    var m = Math.abs(price);
    if (m < 1e-15) {
        return 0;
    }
    var res = log10(m + logFormula._internal_coordOffset) + logFormula._internal_logicalOffset;
    return ((price < 0) ? -res : res);
}
export function fromLog(logical, logFormula) {
    var m = Math.abs(logical);
    if (m < 1e-15) {
        return 0;
    }
    var res = Math.pow(10, m - logFormula._internal_logicalOffset) - logFormula._internal_coordOffset;
    return (logical < 0) ? -res : res;
}
export function convertPriceRangeToLog(priceRange, logFormula) {
    if (priceRange === null) {
        return null;
    }
    var min = toLog(priceRange._internal_minValue(), logFormula);
    var max = toLog(priceRange._internal_maxValue(), logFormula);
    return new PriceRangeImpl(min, max);
}
export function canConvertPriceRangeFromLog(priceRange, logFormula) {
    if (priceRange === null) {
        return false;
    }
    var min = fromLog(priceRange._internal_minValue(), logFormula);
    var max = fromLog(priceRange._internal_maxValue(), logFormula);
    return isFinite(min) && isFinite(max);
}
export function convertPriceRangeFromLog(priceRange, logFormula) {
    if (priceRange === null) {
        return null;
    }
    var min = fromLog(priceRange._internal_minValue(), logFormula);
    var max = fromLog(priceRange._internal_maxValue(), logFormula);
    return new PriceRangeImpl(min, max);
}
export function logFormulaForPriceRange(range) {
    if (range === null) {
        return defLogFormula;
    }
    var diff = Math.abs(range._internal_maxValue() - range._internal_minValue());
    if (diff >= 1 || diff < 1e-15) {
        return defLogFormula;
    }
    var digits = Math.ceil(Math.abs(Math.log10(diff)));
    var logicalOffset = defLogFormula._internal_logicalOffset + digits;
    var coordOffset = 1 / Math.pow(10, logicalOffset);
    return {
        _internal_logicalOffset: logicalOffset,
        _internal_coordOffset: coordOffset,
    };
}
export function logFormulasAreSame(f1, f2) {
    return f1._internal_logicalOffset === f2._internal_logicalOffset && f1._internal_coordOffset === f2._internal_coordOffset;
}
