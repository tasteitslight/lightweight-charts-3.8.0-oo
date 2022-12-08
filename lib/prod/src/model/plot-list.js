import { __assign } from "tslib";
import { lowerbound, upperbound } from '../helpers/algorithms';
import { ensureNotNull } from '../helpers/assertions';
;
// TODO: think about changing it dynamically
var CHUNK_SIZE = 30;
/**
 * PlotList is an array of plot rows
 * each plot row consists of key (index in timescale) and plot value map
 */
var PlotList = /** @class */ (function () {
    function PlotList() {
        this._private__items = [];
        this._private__minMaxCache = new Map();
        this._private__rowSearchCache = new Map();
    }
    // @returns Last row
    PlotList.prototype._internal_last = function () {
        return this._internal_size() > 0 ? this._private__items[this._private__items.length - 1] : null;
    };
    PlotList.prototype._internal_firstIndex = function () {
        return this._internal_size() > 0 ? this._private__indexAt(0) : null;
    };
    PlotList.prototype._internal_lastIndex = function () {
        return this._internal_size() > 0 ? this._private__indexAt((this._private__items.length - 1)) : null;
    };
    PlotList.prototype._internal_size = function () {
        return this._private__items.length;
    };
    PlotList.prototype._internal_isEmpty = function () {
        return this._internal_size() === 0;
    };
    PlotList.prototype._internal_contains = function (index) {
        return this._private__search(index, 0 /* Exact */) !== null;
    };
    PlotList.prototype._internal_valueAt = function (index) {
        return this._internal_search(index);
    };
    PlotList.prototype._internal_search = function (index, searchMode) {
        if (searchMode === void 0) { searchMode = 0 /* Exact */; }
        var pos = this._private__search(index, searchMode);
        if (pos === null) {
            return null;
        }
        return __assign(__assign({}, this._private__valueAt(pos)), { _internal_index: this._private__indexAt(pos) });
    };
    PlotList.prototype._internal_rows = function () {
        return this._private__items;
    };
    PlotList.prototype._internal_minMaxOnRangeCached = function (start, end, plots) {
        // this code works for single series only
        // could fail after whitespaces implementation
        if (this._internal_isEmpty()) {
            return null;
        }
        var result = null;
        for (var _i = 0, plots_1 = plots; _i < plots_1.length; _i++) {
            var plot = plots_1[_i];
            var plotMinMax = this._private__minMaxOnRangeCachedImpl(start, end, plot);
            result = mergeMinMax(result, plotMinMax);
        }
        return result;
    };
    PlotList.prototype._internal_setData = function (plotRows) {
        this._private__rowSearchCache.clear();
        this._private__minMaxCache.clear();
        this._private__items = plotRows;
    };
    PlotList.prototype._private__indexAt = function (offset) {
        return this._private__items[offset]._internal_index;
    };
    PlotList.prototype._private__valueAt = function (offset) {
        return this._private__items[offset];
    };
    PlotList.prototype._private__search = function (index, searchMode) {
        var exactPos = this._private__bsearch(index);
        if (exactPos === null && searchMode !== 0 /* Exact */) {
            switch (searchMode) {
                case -1 /* NearestLeft */:
                    return this._private__searchNearestLeft(index);
                case 1 /* NearestRight */:
                    return this._private__searchNearestRight(index);
                default:
                    throw new TypeError('Unknown search mode');
            }
        }
        return exactPos;
    };
    PlotList.prototype._private__searchNearestLeft = function (index) {
        var nearestLeftPos = this._private__lowerbound(index);
        if (nearestLeftPos > 0) {
            nearestLeftPos = nearestLeftPos - 1;
        }
        return (nearestLeftPos !== this._private__items.length && this._private__indexAt(nearestLeftPos) < index) ? nearestLeftPos : null;
    };
    PlotList.prototype._private__searchNearestRight = function (index) {
        var nearestRightPos = this._private__upperbound(index);
        return (nearestRightPos !== this._private__items.length && index < this._private__indexAt(nearestRightPos)) ? nearestRightPos : null;
    };
    PlotList.prototype._private__bsearch = function (index) {
        var start = this._private__lowerbound(index);
        if (start !== this._private__items.length && !(index < this._private__items[start]._internal_index)) {
            return start;
        }
        return null;
    };
    PlotList.prototype._private__lowerbound = function (index) {
        return lowerbound(this._private__items, index, function (a, b) { return a._internal_index < b; });
    };
    PlotList.prototype._private__upperbound = function (index) {
        return upperbound(this._private__items, index, function (a, b) { return b._internal_index > a; });
    };
    PlotList.prototype._private__plotMinMax = function (startIndex, endIndexExclusive, plotIndex) {
        var result = null;
        for (var i = startIndex; i < endIndexExclusive; i++) {
            var values = this._private__items[i]._internal_value;
            var v = values[plotIndex];
            if (Number.isNaN(v)) {
                continue;
            }
            if (result === null) {
                result = { _internal_min: v, _internal_max: v };
            }
            else {
                if (v < result._internal_min) {
                    result._internal_min = v;
                }
                if (v > result._internal_max) {
                    result._internal_max = v;
                }
            }
        }
        return result;
    };
    PlotList.prototype._private__minMaxOnRangeCachedImpl = function (start, end, plotIndex) {
        // this code works for single series only
        // could fail after whitespaces implementation
        if (this._internal_isEmpty()) {
            return null;
        }
        var result = null;
        // assume that bar indexes only increase
        var firstIndex = ensureNotNull(this._internal_firstIndex());
        var lastIndex = ensureNotNull(this._internal_lastIndex());
        var s = Math.max(start, firstIndex);
        var e = Math.min(end, lastIndex);
        var cachedLow = Math.ceil(s / CHUNK_SIZE) * CHUNK_SIZE;
        var cachedHigh = Math.max(cachedLow, Math.floor(e / CHUNK_SIZE) * CHUNK_SIZE);
        {
            var startIndex = this._private__lowerbound(s);
            var endIndex = this._private__upperbound(Math.min(e, cachedLow, end)); // non-inclusive end
            var plotMinMax = this._private__plotMinMax(startIndex, endIndex, plotIndex);
            result = mergeMinMax(result, plotMinMax);
        }
        var minMaxCache = this._private__minMaxCache.get(plotIndex);
        if (minMaxCache === undefined) {
            minMaxCache = new Map();
            this._private__minMaxCache.set(plotIndex, minMaxCache);
        }
        // now go cached
        for (var c = Math.max(cachedLow + 1, s); c < cachedHigh; c += CHUNK_SIZE) {
            var chunkIndex = Math.floor(c / CHUNK_SIZE);
            var chunkMinMax = minMaxCache.get(chunkIndex);
            if (chunkMinMax === undefined) {
                var chunkStart = this._private__lowerbound(chunkIndex * CHUNK_SIZE);
                var chunkEnd = this._private__upperbound((chunkIndex + 1) * CHUNK_SIZE - 1);
                chunkMinMax = this._private__plotMinMax(chunkStart, chunkEnd, plotIndex);
                minMaxCache.set(chunkIndex, chunkMinMax);
            }
            result = mergeMinMax(result, chunkMinMax);
        }
        // tail
        {
            var startIndex = this._private__lowerbound(cachedHigh);
            var endIndex = this._private__upperbound(e); // non-inclusive end
            var plotMinMax = this._private__plotMinMax(startIndex, endIndex, plotIndex);
            result = mergeMinMax(result, plotMinMax);
        }
        return result;
    };
    return PlotList;
}());
export { PlotList };
function mergeMinMax(first, second) {
    if (first === null) {
        return second;
    }
    else {
        if (second === null) {
            return first;
        }
        else {
            // merge MinMax values
            var min = Math.min(first._internal_min, second._internal_min);
            var max = Math.max(first._internal_max, second._internal_max);
            return { _internal_min: min, _internal_max: max };
        }
    }
}
