import { assert } from '../../helpers/assertions';
import { applyAlpha } from '../../helpers/color';
import { SeriesLastPriceAnimationRenderer } from '../../renderers/series-last-price-animation-renderer';
;
var animationStagesData = [
    {
        _internal_start: 0,
        _internal_end: 0.25 /* Stage1Period */,
        _internal_startRadius: 4 /* Stage1StartCircleRadius */,
        _internal_endRadius: 10 /* Stage1EndCircleRadius */,
        _internal_startFillAlpha: 0.25 /* Stage1StartFillAlpha */,
        _internal_endFillAlpha: 0 /* Stage1EndFillAlpha */,
        _internal_startStrokeAlpha: 0.4 /* Stage1StartStrokeAlpha */,
        _internal_endStrokeAlpha: 0.8 /* Stage1EndStrokeAlpha */,
    },
    {
        _internal_start: 0.25 /* Stage1Period */,
        _internal_end: 0.25 /* Stage1Period */ + 0.275 /* Stage2Period */,
        _internal_startRadius: 10 /* Stage2StartCircleRadius */,
        _internal_endRadius: 14 /* Stage2EndCircleRadius */,
        _internal_startFillAlpha: 0 /* Stage2StartFillAlpha */,
        _internal_endFillAlpha: 0 /* Stage2EndFillAlpha */,
        _internal_startStrokeAlpha: 0.8 /* Stage2StartStrokeAlpha */,
        _internal_endStrokeAlpha: 0 /* Stage2EndStrokeAlpha */,
    },
    {
        _internal_start: 0.25 /* Stage1Period */ + 0.275 /* Stage2Period */,
        _internal_end: 0.25 /* Stage1Period */ + 0.275 /* Stage2Period */ + 0.475 /* Stage3Period */,
        _internal_startRadius: 14 /* Stage3StartCircleRadius */,
        _internal_endRadius: 14 /* Stage3EndCircleRadius */,
        _internal_startFillAlpha: 0 /* Stage3StartFillAlpha */,
        _internal_endFillAlpha: 0 /* Stage3EndFillAlpha */,
        _internal_startStrokeAlpha: 0 /* Stage3StartStrokeAlpha */,
        _internal_endStrokeAlpha: 0 /* Stage3EndStrokeAlpha */,
    },
];
function color(seriesLineColor, stage, startAlpha, endAlpha) {
    var alpha = startAlpha + (endAlpha - startAlpha) * stage;
    return applyAlpha(seriesLineColor, alpha);
}
function radius(stage, startRadius, endRadius) {
    return startRadius + (endRadius - startRadius) * stage;
}
function animationData(durationSinceStart, lineColor) {
    var globalStage = (durationSinceStart % 2600 /* AnimationPeriod */) / 2600 /* AnimationPeriod */;
    var currentStageData;
    for (var _i = 0, animationStagesData_1 = animationStagesData; _i < animationStagesData_1.length; _i++) {
        var stageData = animationStagesData_1[_i];
        if (globalStage >= stageData._internal_start && globalStage <= stageData._internal_end) {
            currentStageData = stageData;
            break;
        }
    }
    assert(currentStageData !== undefined, 'Last price animation internal logic error');
    var subStage = (globalStage - currentStageData._internal_start) / (currentStageData._internal_end - currentStageData._internal_start);
    return {
        _internal_fillColor: color(lineColor, subStage, currentStageData._internal_startFillAlpha, currentStageData._internal_endFillAlpha),
        _internal_strokeColor: color(lineColor, subStage, currentStageData._internal_startStrokeAlpha, currentStageData._internal_endStrokeAlpha),
        _internal_radius: radius(subStage, currentStageData._internal_startRadius, currentStageData._internal_endRadius),
    };
}
var SeriesLastPriceAnimationPaneView = /** @class */ (function () {
    function SeriesLastPriceAnimationPaneView(series) {
        this._private__renderer = new SeriesLastPriceAnimationRenderer();
        this._private__invalidated = true;
        this._private__stageInvalidated = true;
        this._private__startTime = performance.now();
        this._private__endTime = this._private__startTime - 1;
        this._private__series = series;
    }
    SeriesLastPriceAnimationPaneView.prototype._internal_onDataCleared = function () {
        this._private__endTime = this._private__startTime - 1;
        this._internal_update();
    };
    SeriesLastPriceAnimationPaneView.prototype._internal_onNewRealtimeDataReceived = function () {
        this._internal_update();
        if (this._private__series._internal_options().lastPriceAnimation === 2 /* OnDataUpdate */) {
            var now = performance.now();
            var timeToAnimationEnd = this._private__endTime - now;
            if (timeToAnimationEnd > 0) {
                if (timeToAnimationEnd < 2600 /* AnimationPeriod */ / 4) {
                    this._private__endTime += 2600 /* AnimationPeriod */;
                }
                return;
            }
            this._private__startTime = now;
            this._private__endTime = now + 2600 /* AnimationPeriod */;
        }
    };
    SeriesLastPriceAnimationPaneView.prototype._internal_update = function () {
        this._private__invalidated = true;
    };
    SeriesLastPriceAnimationPaneView.prototype._internal_invalidateStage = function () {
        this._private__stageInvalidated = true;
    };
    SeriesLastPriceAnimationPaneView.prototype._internal_visible = function () {
        // center point is always visible if lastPriceAnimation is not LastPriceAnimationMode.Disabled
        return this._private__series._internal_options().lastPriceAnimation !== 0 /* Disabled */;
    };
    SeriesLastPriceAnimationPaneView.prototype._internal_animationActive = function () {
        switch (this._private__series._internal_options().lastPriceAnimation) {
            case 0 /* Disabled */:
                return false;
            case 1 /* Continuous */:
                return true;
            case 2 /* OnDataUpdate */:
                return performance.now() <= this._private__endTime;
        }
    };
    SeriesLastPriceAnimationPaneView.prototype._internal_renderer = function (height, width) {
        if (this._private__invalidated) {
            this._private__updateImpl(height, width);
            this._private__invalidated = false;
            this._private__stageInvalidated = false;
        }
        else if (this._private__stageInvalidated) {
            this._private__updateRendererDataStage();
            this._private__stageInvalidated = false;
        }
        return this._private__renderer;
    };
    SeriesLastPriceAnimationPaneView.prototype._private__updateImpl = function (height, width) {
        this._private__renderer._internal_setData(null);
        var timeScale = this._private__series._internal_model()._internal_timeScale();
        var visibleRange = timeScale._internal_visibleStrictRange();
        var firstValue = this._private__series._internal_firstValue();
        if (visibleRange === null || firstValue === null) {
            return;
        }
        var lastValue = this._private__series._internal_lastValueData(true);
        if (lastValue._internal_noData || !visibleRange._internal_contains(lastValue._internal_index)) {
            return;
        }
        var lastValuePoint = {
            x: timeScale._internal_indexToCoordinate(lastValue._internal_index),
            y: this._private__series._internal_priceScale()._internal_priceToCoordinate(lastValue._internal_price, firstValue._internal_value),
        };
        var seriesLineColor = lastValue._internal_color;
        var seriesLineWidth = this._private__series._internal_options().lineWidth;
        var data = animationData(this._private__duration(), seriesLineColor);
        this._private__renderer._internal_setData({
            _internal_seriesLineColor: seriesLineColor,
            _internal_seriesLineWidth: seriesLineWidth,
            _internal_fillColor: data._internal_fillColor,
            _internal_strokeColor: data._internal_strokeColor,
            _internal_radius: data._internal_radius,
            _internal_center: lastValuePoint,
        });
    };
    SeriesLastPriceAnimationPaneView.prototype._private__updateRendererDataStage = function () {
        var rendererData = this._private__renderer._internal_data();
        if (rendererData !== null) {
            var data = animationData(this._private__duration(), rendererData._internal_seriesLineColor);
            rendererData._internal_fillColor = data._internal_fillColor;
            rendererData._internal_strokeColor = data._internal_strokeColor;
            rendererData._internal_radius = data._internal_radius;
        }
    };
    SeriesLastPriceAnimationPaneView.prototype._private__duration = function () {
        return this._internal_animationActive() ? performance.now() - this._private__startTime : 2600 /* AnimationPeriod */ - 1;
    };
    return SeriesLastPriceAnimationPaneView;
}());
export { SeriesLastPriceAnimationPaneView };
