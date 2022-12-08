;
function mergePaneInvalidation(beforeValue, newValue) {
    if (beforeValue === undefined) {
        return newValue;
    }
    var level = Math.max(beforeValue._internal_level, newValue._internal_level);
    var autoScale = beforeValue._internal_autoScale || newValue._internal_autoScale;
    return { _internal_level: level, _internal_autoScale: autoScale };
}
;
var InvalidateMask = /** @class */ (function () {
    function InvalidateMask(globalLevel) {
        this._private__invalidatedPanes = new Map();
        this._private__timeScaleInvalidations = [];
        this._private__globalLevel = globalLevel;
    }
    InvalidateMask.prototype._internal_invalidatePane = function (paneIndex, invalidation) {
        var prevValue = this._private__invalidatedPanes.get(paneIndex);
        var newValue = mergePaneInvalidation(prevValue, invalidation);
        this._private__invalidatedPanes.set(paneIndex, newValue);
    };
    InvalidateMask.prototype._internal_fullInvalidation = function () {
        return this._private__globalLevel;
    };
    InvalidateMask.prototype._internal_invalidateForPane = function (paneIndex) {
        var paneInvalidation = this._private__invalidatedPanes.get(paneIndex);
        if (paneInvalidation === undefined) {
            return {
                _internal_level: this._private__globalLevel,
            };
        }
        return {
            _internal_level: Math.max(this._private__globalLevel, paneInvalidation._internal_level),
            _internal_autoScale: paneInvalidation._internal_autoScale,
        };
    };
    InvalidateMask.prototype._internal_setFitContent = function () {
        // modifies both bar spacing and right offset
        this._private__timeScaleInvalidations = [{ _internal_type: 0 /* FitContent */ }];
    };
    InvalidateMask.prototype._internal_applyRange = function (range) {
        // modifies both bar spacing and right offset
        this._private__timeScaleInvalidations = [{ _internal_type: 1 /* ApplyRange */, _internal_value: range }];
    };
    InvalidateMask.prototype._internal_resetTimeScale = function () {
        // modifies both bar spacing and right offset
        this._private__timeScaleInvalidations = [{ _internal_type: 4 /* Reset */ }];
    };
    InvalidateMask.prototype._internal_setBarSpacing = function (barSpacing) {
        this._private__timeScaleInvalidations.push({ _internal_type: 2 /* ApplyBarSpacing */, _internal_value: barSpacing });
    };
    InvalidateMask.prototype._internal_setRightOffset = function (offset) {
        this._private__timeScaleInvalidations.push({ _internal_type: 3 /* ApplyRightOffset */, _internal_value: offset });
    };
    InvalidateMask.prototype._internal_timeScaleInvalidations = function () {
        return this._private__timeScaleInvalidations;
    };
    InvalidateMask.prototype._internal_merge = function (other) {
        var _this = this;
        for (var _i = 0, _a = other._private__timeScaleInvalidations; _i < _a.length; _i++) {
            var tsInvalidation = _a[_i];
            this._private__applyTimeScaleInvalidation(tsInvalidation);
        }
        this._private__globalLevel = Math.max(this._private__globalLevel, other._private__globalLevel);
        other._private__invalidatedPanes.forEach(function (invalidation, index) {
            _this._internal_invalidatePane(index, invalidation);
        });
    };
    InvalidateMask.prototype._private__applyTimeScaleInvalidation = function (invalidation) {
        switch (invalidation._internal_type) {
            case 0 /* FitContent */:
                this._internal_setFitContent();
                break;
            case 1 /* ApplyRange */:
                this._internal_applyRange(invalidation._internal_value);
                break;
            case 2 /* ApplyBarSpacing */:
                this._internal_setBarSpacing(invalidation._internal_value);
                break;
            case 3 /* ApplyRightOffset */:
                this._internal_setRightOffset(invalidation._internal_value);
                break;
            case 4 /* Reset */:
                this._internal_resetTimeScale();
                break;
        }
    };
    return InvalidateMask;
}());
export { InvalidateMask };
