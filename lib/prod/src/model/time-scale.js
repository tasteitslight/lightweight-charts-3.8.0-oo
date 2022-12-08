import { DateFormatter } from '../formatters/date-formatter';
import { DateTimeFormatter } from '../formatters/date-time-formatter';
import { lowerbound } from '../helpers/algorithms';
import { ensureNotNull } from '../helpers/assertions';
import { Delegate } from '../helpers/delegate';
import { clamp } from '../helpers/mathex';
import { isInteger, merge } from '../helpers/strict-type-checks';
import { defaultTickMarkFormatter } from './default-tick-mark-formatter';
import { FormattedLabelsCache } from './formatted-labels-cache';
import { areRangesEqual, RangeImpl } from './range-impl';
import { TickMarks } from './tick-marks';
import { TimeScaleVisibleRange } from './time-scale-visible-range';
;
/**
 * Represents the type of a tick mark on the time axis.
 */
export var TickMarkType;
(function (TickMarkType) {
    /**
     * The start of the year (e.g. it's the first tick mark in a year).
     */
    TickMarkType[TickMarkType["Year"] = 0] = "Year";
    /**
     * The start of the month (e.g. it's the first tick mark in a month).
     */
    TickMarkType[TickMarkType["Month"] = 1] = "Month";
    /**
     * A day of the month.
     */
    TickMarkType[TickMarkType["DayOfMonth"] = 2] = "DayOfMonth";
    /**
     * A time without seconds.
     */
    TickMarkType[TickMarkType["Time"] = 3] = "Time";
    /**
     * A time with seconds.
     */
    TickMarkType[TickMarkType["TimeWithSeconds"] = 4] = "TimeWithSeconds";
})(TickMarkType || (TickMarkType = {}));
var TimeScale = /** @class */ (function () {
    function TimeScale(model, options, localizationOptions) {
        this._private__width = 0;
        this._private__baseIndexOrNull = null;
        this._private__points = [];
        this._private__scrollStartPoint = null;
        this._private__scaleStartPoint = null;
        this._private__tickMarks = new TickMarks();
        this._private__formattedByWeight = new Map();
        this._private__visibleRange = TimeScaleVisibleRange._internal_invalid();
        this._private__visibleRangeInvalidated = true;
        this._private__visibleBarsChanged = new Delegate();
        this._private__logicalRangeChanged = new Delegate();
        this._private__optionsApplied = new Delegate();
        this._private__commonTransitionStartState = null;
        this._private__timeMarksCache = null;
        this._private__labels = [];
        this._private__options = options;
        this._private__localizationOptions = localizationOptions;
        this._private__rightOffset = options.rightOffset;
        this._private__barSpacing = options.barSpacing;
        this._private__model = model;
        this._private__updateDateTimeFormatter();
    }
    TimeScale.prototype._internal_options = function () {
        return this._private__options;
    };
    TimeScale.prototype._internal_applyLocalizationOptions = function (localizationOptions) {
        merge(this._private__localizationOptions, localizationOptions);
        this._private__invalidateTickMarks();
        this._private__updateDateTimeFormatter();
    };
    TimeScale.prototype._internal_applyOptions = function (options, localizationOptions) {
        var _a;
        merge(this._private__options, options);
        if (this._private__options.fixLeftEdge) {
            this._private__doFixLeftEdge();
        }
        if (this._private__options.fixRightEdge) {
            this._private__doFixRightEdge();
        }
        // note that bar spacing should be applied before right offset
        // because right offset depends on bar spacing
        if (options.barSpacing !== undefined) {
            this._private__model._internal_setBarSpacing(options.barSpacing);
        }
        if (options.rightOffset !== undefined) {
            this._private__model._internal_setRightOffset(options.rightOffset);
        }
        if (options.minBarSpacing !== undefined) {
            // yes, if we apply min bar spacing then we need to correct bar spacing
            // the easiest way is to apply it once again
            this._private__model._internal_setBarSpacing((_a = options.barSpacing) !== null && _a !== void 0 ? _a : this._private__barSpacing);
        }
        this._private__invalidateTickMarks();
        this._private__updateDateTimeFormatter();
        this._private__optionsApplied._internal_fire();
    };
    TimeScale.prototype._internal_indexToTime = function (index) {
        var _a;
        return ((_a = this._private__points[index]) === null || _a === void 0 ? void 0 : _a._internal_time) || null;
    };
    TimeScale.prototype._internal_timeToIndex = function (time, findNearest) {
        if (this._private__points.length < 1) {
            // no time points available
            return null;
        }
        if (time._internal_timestamp > this._private__points[this._private__points.length - 1]._internal_time._internal_timestamp) {
            // special case
            return findNearest ? this._private__points.length - 1 : null;
        }
        var index = lowerbound(this._private__points, time._internal_timestamp, function (a, b) { return a._internal_time._internal_timestamp < b; });
        if (time._internal_timestamp < this._private__points[index]._internal_time._internal_timestamp) {
            return findNearest ? index : null;
        }
        return index;
    };
    TimeScale.prototype._internal_isEmpty = function () {
        return this._private__width === 0 || this._private__points.length === 0 || this._private__baseIndexOrNull === null;
    };
    // strict range: integer indices of the bars in the visible range rounded in more wide direction
    TimeScale.prototype._internal_visibleStrictRange = function () {
        this._private__updateVisibleRange();
        return this._private__visibleRange._internal_strictRange();
    };
    TimeScale.prototype._internal_visibleLogicalRange = function () {
        this._private__updateVisibleRange();
        return this._private__visibleRange._internal_logicalRange();
    };
    TimeScale.prototype._internal_visibleTimeRange = function () {
        var visibleBars = this._internal_visibleStrictRange();
        if (visibleBars === null) {
            return null;
        }
        var range = {
            from: visibleBars._internal_left(),
            to: visibleBars._internal_right(),
        };
        return this._internal_timeRangeForLogicalRange(range);
    };
    TimeScale.prototype._internal_timeRangeForLogicalRange = function (range) {
        var from = Math.round(range.from);
        var to = Math.round(range.to);
        var firstIndex = ensureNotNull(this._private__firstIndex());
        var lastIndex = ensureNotNull(this._private__lastIndex());
        return {
            from: ensureNotNull(this._internal_indexToTime(Math.max(firstIndex, from))),
            to: ensureNotNull(this._internal_indexToTime(Math.min(lastIndex, to))),
        };
    };
    TimeScale.prototype._internal_logicalRangeForTimeRange = function (range) {
        return {
            from: ensureNotNull(this._internal_timeToIndex(range.from, true)),
            to: ensureNotNull(this._internal_timeToIndex(range.to, true)),
        };
    };
    TimeScale.prototype._internal_width = function () {
        return this._private__width;
    };
    TimeScale.prototype._internal_setWidth = function (width) {
        if (!isFinite(width) || width <= 0) {
            return;
        }
        if (this._private__width === width) {
            return;
        }
        if (this._private__options.lockVisibleTimeRangeOnResize && this._private__width) {
            // recalculate bar spacing
            var newBarSpacing = this._private__barSpacing * width / this._private__width;
            this._private__barSpacing = newBarSpacing;
        }
        // if time scale is scrolled to the end of data and we have fixed right edge
        // keep left edge instead of right
        // we need it to avoid "shaking" if the last bar visibility affects time scale width
        if (this._private__options.fixLeftEdge) {
            var visibleRange = this._internal_visibleStrictRange();
            if (visibleRange !== null) {
                var firstVisibleBar = visibleRange._internal_left();
                // firstVisibleBar could be less than 0
                // since index is a center of bar
                if (firstVisibleBar <= 0) {
                    var delta = this._private__width - width;
                    // reduce  _rightOffset means move right
                    // we could move more than required - this will be fixed by _correctOffset()
                    this._private__rightOffset -= Math.round(delta / this._private__barSpacing) + 1;
                }
            }
        }
        this._private__width = width;
        this._private__visibleRangeInvalidated = true;
        // updating bar spacing should be first because right offset depends on it
        this._private__correctBarSpacing();
        this._private__correctOffset();
    };
    TimeScale.prototype._internal_indexToCoordinate = function (index) {
        if (this._internal_isEmpty() || !isInteger(index)) {
            return 0;
        }
        var baseIndex = this._internal_baseIndex();
        var deltaFromRight = baseIndex + this._private__rightOffset - index;
        var coordinate = this._private__width - (deltaFromRight + 0.5) * this._private__barSpacing - 1;
        return coordinate;
    };
    TimeScale.prototype._internal_indexesToCoordinates = function (points, visibleRange) {
        var baseIndex = this._internal_baseIndex();
        var indexFrom = (visibleRange === undefined) ? 0 : visibleRange.from;
        var indexTo = (visibleRange === undefined) ? points.length : visibleRange.to;
        for (var i = indexFrom; i < indexTo; i++) {
            var index = points[i]._internal_time;
            var deltaFromRight = baseIndex + this._private__rightOffset - index;
            var coordinate = this._private__width - (deltaFromRight + 0.5) * this._private__barSpacing - 1;
            points[i]._internal_x = coordinate;
        }
    };
    TimeScale.prototype._internal_coordinateToIndex = function (x) {
        return Math.ceil(this._private__coordinateToFloatIndex(x));
    };
    TimeScale.prototype._internal_setRightOffset = function (offset) {
        this._private__visibleRangeInvalidated = true;
        this._private__rightOffset = offset;
        this._private__correctOffset();
        this._private__model._internal_recalculateAllPanes();
        this._private__model._internal_lightUpdate();
    };
    TimeScale.prototype._internal_barSpacing = function () {
        return this._private__barSpacing;
    };
    TimeScale.prototype._internal_setBarSpacing = function (newBarSpacing) {
        this._private__setBarSpacing(newBarSpacing);
        // do not allow scroll out of visible bars
        this._private__correctOffset();
        this._private__model._internal_recalculateAllPanes();
        this._private__model._internal_lightUpdate();
    };
    TimeScale.prototype._internal_rightOffset = function () {
        return this._private__rightOffset;
    };
    // eslint-disable-next-line complexity
    TimeScale.prototype._internal_marks = function () {
        if (this._internal_isEmpty()) {
            return null;
        }
        if (this._private__timeMarksCache !== null) {
            return this._private__timeMarksCache;
        }
        var spacing = this._private__barSpacing;
        var fontSize = this._private__model._internal_options().layout.fontSize;
        var maxLabelWidth = (fontSize + 4) * 5;
        var indexPerLabel = Math.round(maxLabelWidth / spacing);
        var visibleBars = ensureNotNull(this._internal_visibleStrictRange());
        var firstBar = Math.max(visibleBars._internal_left(), visibleBars._internal_left() - indexPerLabel);
        var lastBar = Math.max(visibleBars._internal_right(), visibleBars._internal_right() - indexPerLabel);
        var items = this._private__tickMarks._internal_build(spacing, maxLabelWidth);
        // according to indexPerLabel value this value means "earliest index which _might be_ used as the second label on time scale"
        var earliestIndexOfSecondLabel = this._private__firstIndex() + indexPerLabel;
        // according to indexPerLabel value this value means "earliest index which _might be_ used as the second last label on time scale"
        var indexOfSecondLastLabel = this._private__lastIndex() - indexPerLabel;
        var isAllScalingAndScrollingDisabled = this._private__isAllScalingAndScrollingDisabled();
        var isLeftEdgeFixed = this._private__options.fixLeftEdge || isAllScalingAndScrollingDisabled;
        var isRightEdgeFixed = this._private__options.fixRightEdge || isAllScalingAndScrollingDisabled;
        var targetIndex = 0;
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var tm = items_1[_i];
            if (!(firstBar <= tm._internal_index && tm._internal_index <= lastBar)) {
                continue;
            }
            var label = void 0;
            if (targetIndex < this._private__labels.length) {
                label = this._private__labels[targetIndex];
                label._internal_coord = this._internal_indexToCoordinate(tm._internal_index);
                label._internal_label = this._private__formatLabel(tm._internal_time, tm._internal_weight);
                label._internal_weight = tm._internal_weight;
            }
            else {
                label = {
                    _internal_needAlignCoordinate: false,
                    _internal_coord: this._internal_indexToCoordinate(tm._internal_index),
                    _internal_label: this._private__formatLabel(tm._internal_time, tm._internal_weight),
                    _internal_weight: tm._internal_weight,
                };
                this._private__labels.push(label);
            }
            if (this._private__barSpacing > (maxLabelWidth / 2) && !isAllScalingAndScrollingDisabled) {
                // if there is enough space then let's show all tick marks as usual
                label._internal_needAlignCoordinate = false;
            }
            else {
                // if a user is able to scroll after a tick mark then show it as usual, otherwise the coordinate might be aligned
                // if the index is for the second (last) label or later (earlier) then most likely this label might be displayed without correcting the coordinate
                label._internal_needAlignCoordinate = (isLeftEdgeFixed && tm._internal_index <= earliestIndexOfSecondLabel) || (isRightEdgeFixed && tm._internal_index >= indexOfSecondLastLabel);
            }
            targetIndex++;
        }
        this._private__labels.length = targetIndex;
        this._private__timeMarksCache = this._private__labels;
        return this._private__labels;
    };
    TimeScale.prototype._internal_restoreDefault = function () {
        this._private__visibleRangeInvalidated = true;
        this._internal_setBarSpacing(this._private__options.barSpacing);
        this._internal_setRightOffset(this._private__options.rightOffset);
    };
    TimeScale.prototype._internal_setBaseIndex = function (baseIndex) {
        this._private__visibleRangeInvalidated = true;
        this._private__baseIndexOrNull = baseIndex;
        this._private__correctOffset();
        this._private__doFixLeftEdge();
    };
    /**
     * Zoom in/out the scale around a `zoomPoint` on `scale` value.
     *
     * @param zoomPoint - X coordinate of the point to apply the zoom.
     * If `rightBarStaysOnScroll` option is disabled, then will be used to restore right offset.
     * @param scale - Zoom value (in 1/10 parts of current bar spacing).
     * Negative value means zoom out, positive - zoom in.
     */
    TimeScale.prototype._internal_zoom = function (zoomPoint, scale) {
        var floatIndexAtZoomPoint = this._private__coordinateToFloatIndex(zoomPoint);
        var barSpacing = this._internal_barSpacing();
        var newBarSpacing = barSpacing + scale * (barSpacing / 10);
        // zoom in/out bar spacing
        this._internal_setBarSpacing(newBarSpacing);
        if (!this._private__options.rightBarStaysOnScroll) {
            // and then correct right offset to move index under zoomPoint back to its coordinate
            this._internal_setRightOffset(this._internal_rightOffset() + (floatIndexAtZoomPoint - this._private__coordinateToFloatIndex(zoomPoint)));
        }
    };
    TimeScale.prototype._internal_startScale = function (x) {
        if (this._private__scrollStartPoint) {
            this._internal_endScroll();
        }
        if (this._private__scaleStartPoint !== null || this._private__commonTransitionStartState !== null) {
            return;
        }
        if (this._internal_isEmpty()) {
            return;
        }
        this._private__scaleStartPoint = x;
        this._private__saveCommonTransitionsStartState();
    };
    TimeScale.prototype._internal_scaleTo = function (x) {
        if (this._private__commonTransitionStartState === null) {
            return;
        }
        var startLengthFromRight = clamp(this._private__width - x, 0, this._private__width);
        var currentLengthFromRight = clamp(this._private__width - ensureNotNull(this._private__scaleStartPoint), 0, this._private__width);
        if (startLengthFromRight === 0 || currentLengthFromRight === 0) {
            return;
        }
        this._internal_setBarSpacing(this._private__commonTransitionStartState._internal_barSpacing * startLengthFromRight / currentLengthFromRight);
    };
    TimeScale.prototype._internal_endScale = function () {
        if (this._private__scaleStartPoint === null) {
            return;
        }
        this._private__scaleStartPoint = null;
        this._private__clearCommonTransitionsStartState();
    };
    TimeScale.prototype._internal_startScroll = function (x) {
        if (this._private__scrollStartPoint !== null || this._private__commonTransitionStartState !== null) {
            return;
        }
        if (this._internal_isEmpty()) {
            return;
        }
        this._private__scrollStartPoint = x;
        this._private__saveCommonTransitionsStartState();
    };
    TimeScale.prototype._internal_scrollTo = function (x) {
        if (this._private__scrollStartPoint === null) {
            return;
        }
        var shiftInLogical = (this._private__scrollStartPoint - x) / this._internal_barSpacing();
        this._private__rightOffset = ensureNotNull(this._private__commonTransitionStartState)._internal_rightOffset + shiftInLogical;
        this._private__visibleRangeInvalidated = true;
        // do not allow scroll out of visible bars
        this._private__correctOffset();
    };
    TimeScale.prototype._internal_endScroll = function () {
        if (this._private__scrollStartPoint === null) {
            return;
        }
        this._private__scrollStartPoint = null;
        this._private__clearCommonTransitionsStartState();
    };
    TimeScale.prototype._internal_scrollToRealTime = function () {
        this._internal_scrollToOffsetAnimated(this._private__options.rightOffset);
    };
    TimeScale.prototype._internal_scrollToOffsetAnimated = function (offset, animationDuration) {
        var _this = this;
        if (animationDuration === void 0) { animationDuration = 400 /* DefaultAnimationDuration */; }
        if (!isFinite(offset)) {
            throw new RangeError('offset is required and must be finite number');
        }
        if (!isFinite(animationDuration) || animationDuration <= 0) {
            throw new RangeError('animationDuration (optional) must be finite positive number');
        }
        var source = this._private__rightOffset;
        var animationStart = performance.now();
        var animationFn = function () {
            var animationProgress = (performance.now() - animationStart) / animationDuration;
            var finishAnimation = animationProgress >= 1;
            var rightOffset = finishAnimation ? offset : source + (offset - source) * animationProgress;
            _this._internal_setRightOffset(rightOffset);
            if (!finishAnimation) {
                setTimeout(animationFn, 20);
            }
        };
        animationFn();
    };
    TimeScale.prototype._internal_update = function (newPoints, firstChangedPointIndex) {
        this._private__visibleRangeInvalidated = true;
        this._private__points = newPoints;
        this._private__tickMarks._internal_setTimeScalePoints(newPoints, firstChangedPointIndex);
        this._private__correctOffset();
    };
    TimeScale.prototype._internal_visibleBarsChanged = function () {
        return this._private__visibleBarsChanged;
    };
    TimeScale.prototype._internal_logicalRangeChanged = function () {
        return this._private__logicalRangeChanged;
    };
    TimeScale.prototype._internal_optionsApplied = function () {
        return this._private__optionsApplied;
    };
    TimeScale.prototype._internal_baseIndex = function () {
        // null is used to known that baseIndex is not set yet
        // so in methods which should known whether it is set or not
        // we should check field `_baseIndexOrNull` instead of getter `baseIndex()`
        // see minRightOffset for example
        return this._private__baseIndexOrNull || 0;
    };
    TimeScale.prototype._internal_setVisibleRange = function (range) {
        var length = range._internal_count();
        this._private__setBarSpacing(this._private__width / length);
        this._private__rightOffset = range._internal_right() - this._internal_baseIndex();
        this._private__correctOffset();
        this._private__visibleRangeInvalidated = true;
        this._private__model._internal_recalculateAllPanes();
        this._private__model._internal_lightUpdate();
    };
    TimeScale.prototype._internal_fitContent = function () {
        var first = this._private__firstIndex();
        var last = this._private__lastIndex();
        if (first === null || last === null) {
            return;
        }
        this._internal_setVisibleRange(new RangeImpl(first, last + this._private__options.rightOffset));
    };
    TimeScale.prototype._internal_setLogicalRange = function (range) {
        var barRange = new RangeImpl(range.from, range.to);
        this._internal_setVisibleRange(barRange);
    };
    TimeScale.prototype._internal_formatDateTime = function (time) {
        if (this._private__localizationOptions.timeFormatter !== undefined) {
            return this._private__localizationOptions.timeFormatter(time._internal_businessDay || time._internal_timestamp);
        }
        return this._private__dateTimeFormatter._internal_format(new Date(time._internal_timestamp * 1000));
    };
    TimeScale.prototype._private__isAllScalingAndScrollingDisabled = function () {
        var _a = this._private__model._internal_options(), handleScroll = _a.handleScroll, handleScale = _a.handleScale;
        return !handleScroll.horzTouchDrag
            && !handleScroll.mouseWheel
            && !handleScroll.pressedMouseMove
            && !handleScroll.vertTouchDrag
            && !handleScale.axisDoubleClickReset
            && !handleScale.axisPressedMouseMove.time
            && !handleScale.mouseWheel
            && !handleScale.pinch;
    };
    TimeScale.prototype._private__firstIndex = function () {
        return this._private__points.length === 0 ? null : 0;
    };
    TimeScale.prototype._private__lastIndex = function () {
        return this._private__points.length === 0 ? null : (this._private__points.length - 1);
    };
    TimeScale.prototype._private__rightOffsetForCoordinate = function (x) {
        return (this._private__width - 1 - x) / this._private__barSpacing;
    };
    TimeScale.prototype._private__coordinateToFloatIndex = function (x) {
        var deltaFromRight = this._private__rightOffsetForCoordinate(x);
        var baseIndex = this._internal_baseIndex();
        var index = baseIndex + this._private__rightOffset - deltaFromRight;
        // JavaScript uses very strange rounding
        // we need rounding to avoid problems with calculation errors
        return Math.round(index * 1000000) / 1000000;
    };
    TimeScale.prototype._private__setBarSpacing = function (newBarSpacing) {
        var oldBarSpacing = this._private__barSpacing;
        this._private__barSpacing = newBarSpacing;
        this._private__correctBarSpacing();
        // this._barSpacing might be changed in _correctBarSpacing
        if (oldBarSpacing !== this._private__barSpacing) {
            this._private__visibleRangeInvalidated = true;
            this._private__resetTimeMarksCache();
        }
    };
    TimeScale.prototype._private__updateVisibleRange = function () {
        if (!this._private__visibleRangeInvalidated) {
            return;
        }
        this._private__visibleRangeInvalidated = false;
        if (this._internal_isEmpty()) {
            this._private__setVisibleRange(TimeScaleVisibleRange._internal_invalid());
            return;
        }
        var baseIndex = this._internal_baseIndex();
        var newBarsLength = this._private__width / this._private__barSpacing;
        var rightBorder = this._private__rightOffset + baseIndex;
        var leftBorder = rightBorder - newBarsLength + 1;
        var logicalRange = new RangeImpl(leftBorder, rightBorder);
        this._private__setVisibleRange(new TimeScaleVisibleRange(logicalRange));
    };
    TimeScale.prototype._private__correctBarSpacing = function () {
        var minBarSpacing = this._private__minBarSpacing();
        if (this._private__barSpacing < minBarSpacing) {
            this._private__barSpacing = minBarSpacing;
            this._private__visibleRangeInvalidated = true;
        }
        if (this._private__width !== 0) {
            // make sure that this (1 / Constants.MinVisibleBarsCount) >= coeff in max bar spacing (it's 0.5 here)
            var maxBarSpacing = this._private__width * 0.5;
            if (this._private__barSpacing > maxBarSpacing) {
                this._private__barSpacing = maxBarSpacing;
                this._private__visibleRangeInvalidated = true;
            }
        }
    };
    TimeScale.prototype._private__minBarSpacing = function () {
        // if both options are enabled then limit bar spacing so that zooming-out is not possible
        // if it would cause either the first or last points to move too far from an edge
        if (this._private__options.fixLeftEdge && this._private__options.fixRightEdge && this._private__points.length !== 0) {
            return this._private__width / this._private__points.length;
        }
        return this._private__options.minBarSpacing;
    };
    TimeScale.prototype._private__correctOffset = function () {
        // block scrolling of to future
        var maxRightOffset = this._private__maxRightOffset();
        if (this._private__rightOffset > maxRightOffset) {
            this._private__rightOffset = maxRightOffset;
            this._private__visibleRangeInvalidated = true;
        }
        // block scrolling of to past
        var minRightOffset = this._private__minRightOffset();
        if (minRightOffset !== null && this._private__rightOffset < minRightOffset) {
            this._private__rightOffset = minRightOffset;
            this._private__visibleRangeInvalidated = true;
        }
    };
    TimeScale.prototype._private__minRightOffset = function () {
        var firstIndex = this._private__firstIndex();
        var baseIndex = this._private__baseIndexOrNull;
        if (firstIndex === null || baseIndex === null) {
            return null;
        }
        var barsEstimation = this._private__options.fixLeftEdge
            ? this._private__width / this._private__barSpacing
            : Math.min(2 /* MinVisibleBarsCount */, this._private__points.length);
        return firstIndex - baseIndex - 1 + barsEstimation;
    };
    TimeScale.prototype._private__maxRightOffset = function () {
        return this._private__options.fixRightEdge
            ? 0
            : (this._private__width / this._private__barSpacing) - Math.min(2 /* MinVisibleBarsCount */, this._private__points.length);
    };
    TimeScale.prototype._private__saveCommonTransitionsStartState = function () {
        this._private__commonTransitionStartState = {
            _internal_barSpacing: this._internal_barSpacing(),
            _internal_rightOffset: this._internal_rightOffset(),
        };
    };
    TimeScale.prototype._private__clearCommonTransitionsStartState = function () {
        this._private__commonTransitionStartState = null;
    };
    TimeScale.prototype._private__formatLabel = function (time, weight) {
        var _this = this;
        var formatter = this._private__formattedByWeight.get(weight);
        if (formatter === undefined) {
            formatter = new FormattedLabelsCache(function (timePoint) {
                return _this._private__formatLabelImpl(timePoint, weight);
            });
            this._private__formattedByWeight.set(weight, formatter);
        }
        return formatter._internal_format(time);
    };
    TimeScale.prototype._private__formatLabelImpl = function (timePoint, weight) {
        var _a;
        var tickMarkType = weightToTickMarkType(weight, this._private__options.timeVisible, this._private__options.secondsVisible);
        if (this._private__options.tickMarkFormatter !== undefined) {
            // this is temporary solution to make more consistency API
            // it looks like that all time types in API should have the same form
            // but for know defaultTickMarkFormatter is on model level and can't determine whether passed time is business day or UTCTimestamp
            // because type guards are declared on API level
            // in other hand, type guards couldn't be declared on model level so far
            // because they are know about string representation of business day ¯\_(ツ)_/¯
            // let's fix in for all cases for the whole API
            return this._private__options.tickMarkFormatter((_a = timePoint._internal_businessDay) !== null && _a !== void 0 ? _a : timePoint._internal_timestamp, tickMarkType, this._private__localizationOptions.locale);
        }
        return defaultTickMarkFormatter(timePoint, tickMarkType, this._private__localizationOptions.locale);
    };
    TimeScale.prototype._private__setVisibleRange = function (newVisibleRange) {
        var oldVisibleRange = this._private__visibleRange;
        this._private__visibleRange = newVisibleRange;
        if (!areRangesEqual(oldVisibleRange._internal_strictRange(), this._private__visibleRange._internal_strictRange())) {
            this._private__visibleBarsChanged._internal_fire();
        }
        if (!areRangesEqual(oldVisibleRange._internal_logicalRange(), this._private__visibleRange._internal_logicalRange())) {
            this._private__logicalRangeChanged._internal_fire();
        }
        // TODO: reset only coords in case when this._visibleBars has not been changed
        this._private__resetTimeMarksCache();
    };
    TimeScale.prototype._private__resetTimeMarksCache = function () {
        this._private__timeMarksCache = null;
    };
    TimeScale.prototype._private__invalidateTickMarks = function () {
        this._private__resetTimeMarksCache();
        this._private__formattedByWeight.clear();
    };
    TimeScale.prototype._private__updateDateTimeFormatter = function () {
        var dateFormat = this._private__localizationOptions.dateFormat;
        if (this._private__options.timeVisible) {
            this._private__dateTimeFormatter = new DateTimeFormatter({
                _internal_dateFormat: dateFormat,
                _internal_timeFormat: this._private__options.secondsVisible ? '%h:%m:%s' : '%h:%m',
                _internal_dateTimeSeparator: '   ',
                _internal_locale: this._private__localizationOptions.locale,
            });
        }
        else {
            this._private__dateTimeFormatter = new DateFormatter(dateFormat, this._private__localizationOptions.locale);
        }
    };
    TimeScale.prototype._private__doFixLeftEdge = function () {
        if (!this._private__options.fixLeftEdge) {
            return;
        }
        var firstIndex = this._private__firstIndex();
        if (firstIndex === null) {
            return;
        }
        var visibleRange = this._internal_visibleStrictRange();
        if (visibleRange === null) {
            return;
        }
        var delta = visibleRange._internal_left() - firstIndex;
        if (delta < 0) {
            var leftEdgeOffset = this._private__rightOffset - delta - 1;
            this._internal_setRightOffset(leftEdgeOffset);
        }
        this._private__correctBarSpacing();
    };
    TimeScale.prototype._private__doFixRightEdge = function () {
        this._private__correctOffset();
        this._private__correctBarSpacing();
    };
    return TimeScale;
}());
export { TimeScale };
// eslint-disable-next-line complexity
function weightToTickMarkType(weight, timeVisible, secondsVisible) {
    switch (weight) {
        case 0 /* LessThanSecond */:
        case 10 /* Second */:
            return timeVisible
                ? (secondsVisible ? 4 /* TimeWithSeconds */ : 3 /* Time */)
                : 2 /* DayOfMonth */;
        case 20 /* Minute1 */:
        case 21 /* Minute5 */:
        case 22 /* Minute30 */:
        case 30 /* Hour1 */:
        case 31 /* Hour3 */:
        case 32 /* Hour6 */:
        case 33 /* Hour12 */:
            return timeVisible ? 3 /* Time */ : 2 /* DayOfMonth */;
        case 50 /* Day */:
            return 2 /* DayOfMonth */;
        case 60 /* Month */:
            return 1 /* Month */;
        case 70 /* Year */:
            return 0 /* Year */;
    }
}
