import { assert } from '../helpers/assertions';
import { Delegate } from '../helpers/delegate';
import { clone } from '../helpers/strict-type-checks';
import { convertTime } from './data-layer';
;
var TimeScaleApi = /** @class */ (function () {
    function TimeScaleApi(model, timeAxisWidget) {
        this._private__timeRangeChanged = new Delegate();
        this._private__logicalRangeChanged = new Delegate();
        this._private__sizeChanged = new Delegate();
        this._private__model = model;
        this._private__timeScale = model._internal_timeScale();
        this._private__timeAxisWidget = timeAxisWidget;
        this._private__timeScale._internal_visibleBarsChanged()._internal_subscribe(this._private__onVisibleBarsChanged.bind(this));
        this._private__timeScale._internal_logicalRangeChanged()._internal_subscribe(this._private__onVisibleLogicalRangeChanged.bind(this));
        this._private__timeAxisWidget._internal_sizeChanged()._internal_subscribe(this._private__onSizeChanged.bind(this));
    }
    TimeScaleApi.prototype._internal_destroy = function () {
        this._private__timeScale._internal_visibleBarsChanged()._internal_unsubscribeAll(this);
        this._private__timeScale._internal_logicalRangeChanged()._internal_unsubscribeAll(this);
        this._private__timeAxisWidget._internal_sizeChanged()._internal_unsubscribeAll(this);
        this._private__timeRangeChanged._internal_destroy();
        this._private__logicalRangeChanged._internal_destroy();
        this._private__sizeChanged._internal_destroy();
    };
    TimeScaleApi.prototype.scrollPosition = function () {
        return this._private__timeScale._internal_rightOffset();
    };
    TimeScaleApi.prototype.scrollToPosition = function (position, animated) {
        if (!animated) {
            this._private__model._internal_setRightOffset(position);
            return;
        }
        this._private__timeScale._internal_scrollToOffsetAnimated(position, 1000 /* AnimationDurationMs */);
    };
    TimeScaleApi.prototype.scrollToRealTime = function () {
        this._private__timeScale._internal_scrollToRealTime();
    };
    TimeScaleApi.prototype.getVisibleRange = function () {
        var _a, _b;
        var timeRange = this._private__timeScale._internal_visibleTimeRange();
        if (timeRange === null) {
            return null;
        }
        return {
            from: (_a = timeRange.from._internal_businessDay) !== null && _a !== void 0 ? _a : timeRange.from._internal_timestamp,
            to: (_b = timeRange.to._internal_businessDay) !== null && _b !== void 0 ? _b : timeRange.to._internal_timestamp,
        };
    };
    TimeScaleApi.prototype.setVisibleRange = function (range) {
        var convertedRange = {
            from: convertTime(range.from),
            to: convertTime(range.to),
        };
        var logicalRange = this._private__timeScale._internal_logicalRangeForTimeRange(convertedRange);
        this._private__model._internal_setTargetLogicalRange(logicalRange);
    };
    TimeScaleApi.prototype.getVisibleLogicalRange = function () {
        var logicalRange = this._private__timeScale._internal_visibleLogicalRange();
        if (logicalRange === null) {
            return null;
        }
        return {
            from: logicalRange._internal_left(),
            to: logicalRange._internal_right(),
        };
    };
    TimeScaleApi.prototype.setVisibleLogicalRange = function (range) {
        assert(range.from <= range.to, 'The from index cannot be after the to index.');
        this._private__model._internal_setTargetLogicalRange(range);
    };
    TimeScaleApi.prototype.resetTimeScale = function () {
        this._private__model._internal_resetTimeScale();
    };
    TimeScaleApi.prototype.fitContent = function () {
        this._private__model._internal_fitContent();
    };
    TimeScaleApi.prototype.logicalToCoordinate = function (logical) {
        var timeScale = this._private__model._internal_timeScale();
        if (timeScale._internal_isEmpty()) {
            return null;
        }
        else {
            return timeScale._internal_indexToCoordinate(logical);
        }
    };
    TimeScaleApi.prototype.coordinateToLogical = function (x) {
        if (this._private__timeScale._internal_isEmpty()) {
            return null;
        }
        else {
            return this._private__timeScale._internal_coordinateToIndex(x);
        }
    };
    TimeScaleApi.prototype.timeToCoordinate = function (time) {
        var timePoint = convertTime(time);
        var timePointIndex = this._private__timeScale._internal_timeToIndex(timePoint, false);
        if (timePointIndex === null) {
            return null;
        }
        return this._private__timeScale._internal_indexToCoordinate(timePointIndex);
    };
    TimeScaleApi.prototype.coordinateToTime = function (x) {
        var _a;
        var timeScale = this._private__model._internal_timeScale();
        var timePointIndex = timeScale._internal_coordinateToIndex(x);
        var timePoint = timeScale._internal_indexToTime(timePointIndex);
        if (timePoint === null) {
            return null;
        }
        return (_a = timePoint._internal_businessDay) !== null && _a !== void 0 ? _a : timePoint._internal_timestamp;
    };
    TimeScaleApi.prototype.width = function () {
        return this._private__timeAxisWidget._internal_getSize()._internal_w;
    };
    TimeScaleApi.prototype.height = function () {
        return this._private__timeAxisWidget._internal_getSize()._internal_h;
    };
    TimeScaleApi.prototype.subscribeVisibleTimeRangeChange = function (handler) {
        this._private__timeRangeChanged._internal_subscribe(handler);
    };
    TimeScaleApi.prototype.unsubscribeVisibleTimeRangeChange = function (handler) {
        this._private__timeRangeChanged._internal_unsubscribe(handler);
    };
    TimeScaleApi.prototype.subscribeVisibleLogicalRangeChange = function (handler) {
        this._private__logicalRangeChanged._internal_subscribe(handler);
    };
    TimeScaleApi.prototype.unsubscribeVisibleLogicalRangeChange = function (handler) {
        this._private__logicalRangeChanged._internal_unsubscribe(handler);
    };
    TimeScaleApi.prototype.subscribeSizeChange = function (handler) {
        this._private__sizeChanged._internal_subscribe(handler);
    };
    TimeScaleApi.prototype.unsubscribeSizeChange = function (handler) {
        this._private__sizeChanged._internal_unsubscribe(handler);
    };
    TimeScaleApi.prototype.applyOptions = function (options) {
        this._private__timeScale._internal_applyOptions(options);
    };
    TimeScaleApi.prototype.options = function () {
        return clone(this._private__timeScale._internal_options());
    };
    TimeScaleApi.prototype._private__onVisibleBarsChanged = function () {
        if (this._private__timeRangeChanged._internal_hasListeners()) {
            this._private__timeRangeChanged._internal_fire(this.getVisibleRange());
        }
    };
    TimeScaleApi.prototype._private__onVisibleLogicalRangeChanged = function () {
        if (this._private__logicalRangeChanged._internal_hasListeners()) {
            this._private__logicalRangeChanged._internal_fire(this.getVisibleLogicalRange());
        }
    };
    TimeScaleApi.prototype._private__onSizeChanged = function (size) {
        this._private__sizeChanged._internal_fire(size._internal_w, size._internal_h);
    };
    return TimeScaleApi;
}());
export { TimeScaleApi };
