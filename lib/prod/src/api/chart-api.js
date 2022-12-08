import { ChartWidget } from '../gui/chart-widget';
import { ensureDefined } from '../helpers/assertions';
import { Delegate } from '../helpers/delegate';
import { warn } from '../helpers/logger';
import { clone, isBoolean, merge } from '../helpers/strict-type-checks';
import { fillUpDownCandlesticksColors, precisionByMinMove, } from '../model/series-options';
import { CandlestickSeriesApi } from './candlestick-series-api';
import { DataLayer } from './data-layer';
import { chartOptionsDefaults } from './options/chart-options-defaults';
import { areaStyleDefaults, barStyleDefaults, baselineStyleDefaults, candlestickStyleDefaults, histogramStyleDefaults, lineStyleDefaults, seriesOptionsDefaults, } from './options/series-options-defaults';
import { PriceScaleApi } from './price-scale-api';
import { migrateOptions, SeriesApi } from './series-api';
import { TimeScaleApi } from './time-scale-api';
function patchPriceFormat(priceFormat) {
    if (priceFormat === undefined || priceFormat.type === 'custom') {
        return;
    }
    var priceFormatBuiltIn = priceFormat;
    if (priceFormatBuiltIn.minMove !== undefined && priceFormatBuiltIn.precision === undefined) {
        priceFormatBuiltIn.precision = precisionByMinMove(priceFormatBuiltIn.minMove);
    }
}
function migrateHandleScaleScrollOptions(options) {
    if (isBoolean(options.handleScale)) {
        var handleScale = options.handleScale;
        options.handleScale = {
            axisDoubleClickReset: handleScale,
            axisPressedMouseMove: {
                time: handleScale,
                price: handleScale,
            },
            mouseWheel: handleScale,
            pinch: handleScale,
        };
    }
    else if (options.handleScale !== undefined && isBoolean(options.handleScale.axisPressedMouseMove)) {
        var axisPressedMouseMove = options.handleScale.axisPressedMouseMove;
        options.handleScale.axisPressedMouseMove = {
            time: axisPressedMouseMove,
            price: axisPressedMouseMove,
        };
    }
    var handleScroll = options.handleScroll;
    if (isBoolean(handleScroll)) {
        options.handleScroll = {
            horzTouchDrag: handleScroll,
            vertTouchDrag: handleScroll,
            mouseWheel: handleScroll,
            pressedMouseMove: handleScroll,
        };
    }
}
function migratePriceScaleOptions(options) {
    /* eslint-disable deprecation/deprecation */
    if (options.priceScale) {
        warn('"priceScale" option has been deprecated, use "leftPriceScale", "rightPriceScale" and "overlayPriceScales" instead');
        options.leftPriceScale = options.leftPriceScale || {};
        options.rightPriceScale = options.rightPriceScale || {};
        var position = options.priceScale.position;
        delete options.priceScale.position;
        options.leftPriceScale = merge(options.leftPriceScale, options.priceScale);
        options.rightPriceScale = merge(options.rightPriceScale, options.priceScale);
        if (position === 'left') {
            options.leftPriceScale.visible = true;
            options.rightPriceScale.visible = false;
        }
        if (position === 'right') {
            options.leftPriceScale.visible = false;
            options.rightPriceScale.visible = true;
        }
        if (position === 'none') {
            options.leftPriceScale.visible = false;
            options.rightPriceScale.visible = false;
        }
        // copy defaults for overlays
        options.overlayPriceScales = options.overlayPriceScales || {};
        if (options.priceScale.invertScale !== undefined) {
            options.overlayPriceScales.invertScale = options.priceScale.invertScale;
        }
        // do not migrate mode for backward compatibility
        if (options.priceScale.scaleMargins !== undefined) {
            options.overlayPriceScales.scaleMargins = options.priceScale.scaleMargins;
        }
    }
    /* eslint-enable deprecation/deprecation */
}
export function migrateLayoutOptions(options) {
    /* eslint-disable deprecation/deprecation */
    if (!options.layout) {
        return;
    }
    if (options.layout.backgroundColor && !options.layout.background) {
        options.layout.background = { type: "solid" /* Solid */, color: options.layout.backgroundColor };
    }
    /* eslint-enable deprecation/deprecation */
}
function toInternalOptions(options) {
    migrateHandleScaleScrollOptions(options);
    migratePriceScaleOptions(options);
    migrateLayoutOptions(options);
    return options;
}
var ChartApi = /** @class */ (function () {
    function ChartApi(container, options) {
        var _this = this;
        this._private__dataLayer = new DataLayer();
        this._private__seriesMap = new Map();
        this._private__seriesMapReversed = new Map();
        this._private__clickedDelegate = new Delegate();
        this._private__crosshairMovedDelegate = new Delegate();
        var internalOptions = (options === undefined) ?
            clone(chartOptionsDefaults) :
            merge(clone(chartOptionsDefaults), toInternalOptions(options));
        this._private__chartWidget = new ChartWidget(container, internalOptions);
        this._private__chartWidget._internal_clicked()._internal_subscribe(function (paramSupplier) {
            if (_this._private__clickedDelegate._internal_hasListeners()) {
                _this._private__clickedDelegate._internal_fire(_this._private__convertMouseParams(paramSupplier()));
            }
        }, this);
        this._private__chartWidget._internal_crosshairMoved()._internal_subscribe(function (paramSupplier) {
            if (_this._private__crosshairMovedDelegate._internal_hasListeners()) {
                _this._private__crosshairMovedDelegate._internal_fire(_this._private__convertMouseParams(paramSupplier()));
            }
        }, this);
        var model = this._private__chartWidget._internal_model();
        this._private__timeScaleApi = new TimeScaleApi(model, this._private__chartWidget._internal_timeAxisWidget());
    }
    ChartApi.prototype.remove = function () {
        this._private__chartWidget._internal_clicked()._internal_unsubscribeAll(this);
        this._private__chartWidget._internal_crosshairMoved()._internal_unsubscribeAll(this);
        this._private__timeScaleApi._internal_destroy();
        this._private__chartWidget._internal_destroy();
        this._private__seriesMap.clear();
        this._private__seriesMapReversed.clear();
        this._private__clickedDelegate._internal_destroy();
        this._private__crosshairMovedDelegate._internal_destroy();
        this._private__dataLayer._internal_destroy();
    };
    ChartApi.prototype.resize = function (width, height, forceRepaint) {
        this._private__chartWidget._internal_resize(width, height, forceRepaint);
    };
    ChartApi.prototype.addAreaSeries = function (options) {
        if (options === void 0) { options = {}; }
        options = migrateOptions(options);
        patchPriceFormat(options.priceFormat);
        var strictOptions = merge(clone(seriesOptionsDefaults), areaStyleDefaults, options);
        var series = this._private__chartWidget._internal_model()._internal_createSeries('Area', strictOptions);
        var res = new SeriesApi(series, this, this);
        this._private__seriesMap.set(res, series);
        this._private__seriesMapReversed.set(series, res);
        return res;
    };
    ChartApi.prototype.addBaselineSeries = function (options) {
        if (options === void 0) { options = {}; }
        options = migrateOptions(options);
        patchPriceFormat(options.priceFormat);
        // to avoid assigning fields to defaults we have to clone them
        var strictOptions = merge(clone(seriesOptionsDefaults), clone(baselineStyleDefaults), options);
        var series = this._private__chartWidget._internal_model()._internal_createSeries('Baseline', strictOptions);
        var res = new SeriesApi(series, this, this);
        this._private__seriesMap.set(res, series);
        this._private__seriesMapReversed.set(series, res);
        return res;
    };
    ChartApi.prototype.addBarSeries = function (options) {
        if (options === void 0) { options = {}; }
        options = migrateOptions(options);
        patchPriceFormat(options.priceFormat);
        var strictOptions = merge(clone(seriesOptionsDefaults), barStyleDefaults, options);
        var series = this._private__chartWidget._internal_model()._internal_createSeries('Bar', strictOptions);
        var res = new SeriesApi(series, this, this);
        this._private__seriesMap.set(res, series);
        this._private__seriesMapReversed.set(series, res);
        return res;
    };
    ChartApi.prototype.addCandlestickSeries = function (options) {
        if (options === void 0) { options = {}; }
        options = migrateOptions(options);
        fillUpDownCandlesticksColors(options);
        patchPriceFormat(options.priceFormat);
        var strictOptions = merge(clone(seriesOptionsDefaults), candlestickStyleDefaults, options);
        var series = this._private__chartWidget._internal_model()._internal_createSeries('Candlestick', strictOptions);
        var res = new CandlestickSeriesApi(series, this, this);
        this._private__seriesMap.set(res, series);
        this._private__seriesMapReversed.set(series, res);
        return res;
    };
    ChartApi.prototype.addHistogramSeries = function (options) {
        if (options === void 0) { options = {}; }
        options = migrateOptions(options);
        patchPriceFormat(options.priceFormat);
        var strictOptions = merge(clone(seriesOptionsDefaults), histogramStyleDefaults, options);
        var series = this._private__chartWidget._internal_model()._internal_createSeries('Histogram', strictOptions);
        var res = new SeriesApi(series, this, this);
        this._private__seriesMap.set(res, series);
        this._private__seriesMapReversed.set(series, res);
        return res;
    };
    ChartApi.prototype.addLineSeries = function (options) {
        if (options === void 0) { options = {}; }
        options = migrateOptions(options);
        patchPriceFormat(options.priceFormat);
        var strictOptions = merge(clone(seriesOptionsDefaults), lineStyleDefaults, options);
        var series = this._private__chartWidget._internal_model()._internal_createSeries('Line', strictOptions);
        var res = new SeriesApi(series, this, this);
        this._private__seriesMap.set(res, series);
        this._private__seriesMapReversed.set(series, res);
        return res;
    };
    ChartApi.prototype.removeSeries = function (seriesApi) {
        var series = ensureDefined(this._private__seriesMap.get(seriesApi));
        var update = this._private__dataLayer._internal_removeSeries(series);
        var model = this._private__chartWidget._internal_model();
        model._internal_removeSeries(series);
        this._private__sendUpdateToChart(update);
        this._private__seriesMap.delete(seriesApi);
        this._private__seriesMapReversed.delete(series);
    };
    ChartApi.prototype._internal_applyNewData = function (series, data) {
        this._private__sendUpdateToChart(this._private__dataLayer._internal_setSeriesData(series, data));
    };
    ChartApi.prototype._internal_updateData = function (series, data) {
        this._private__sendUpdateToChart(this._private__dataLayer._internal_updateSeriesData(series, data));
    };
    ChartApi.prototype.subscribeClick = function (handler) {
        this._private__clickedDelegate._internal_subscribe(handler);
    };
    ChartApi.prototype.unsubscribeClick = function (handler) {
        this._private__clickedDelegate._internal_unsubscribe(handler);
    };
    ChartApi.prototype.subscribeCrosshairMove = function (handler) {
        this._private__crosshairMovedDelegate._internal_subscribe(handler);
    };
    ChartApi.prototype.unsubscribeCrosshairMove = function (handler) {
        this._private__crosshairMovedDelegate._internal_unsubscribe(handler);
    };
    ChartApi.prototype.priceScale = function (priceScaleId) {
        if (priceScaleId === undefined) {
            warn('Using ChartApi.priceScale() method without arguments has been deprecated, pass valid price scale id instead');
            priceScaleId = this._private__chartWidget._internal_model()._internal_defaultVisiblePriceScaleId();
        }
        return new PriceScaleApi(this._private__chartWidget, priceScaleId);
    };
    ChartApi.prototype.timeScale = function () {
        return this._private__timeScaleApi;
    };
    ChartApi.prototype.applyOptions = function (options) {
        this._private__chartWidget._internal_applyOptions(toInternalOptions(options));
    };
    ChartApi.prototype.options = function () {
        return this._private__chartWidget._internal_options();
    };
    ChartApi.prototype.takeScreenshot = function () {
        return this._private__chartWidget._internal_takeScreenshot();
    };
    ChartApi.prototype._private__sendUpdateToChart = function (update) {
        var model = this._private__chartWidget._internal_model();
        model._internal_updateTimeScale(update._internal_timeScale._internal_baseIndex, update._internal_timeScale._internal_points, update._internal_timeScale._internal_firstChangedPointIndex);
        update._internal_series.forEach(function (value, series) { return series._internal_setData(value._internal_data, value._internal_info); });
        model._internal_recalculateAllPanes();
    };
    ChartApi.prototype._private__mapSeriesToApi = function (series) {
        return ensureDefined(this._private__seriesMapReversed.get(series));
    };
    ChartApi.prototype._private__convertMouseParams = function (param) {
        var _this = this;
        var seriesPrices = new Map();
        param._internal_seriesPrices.forEach(function (price, series) {
            seriesPrices.set(_this._private__mapSeriesToApi(series), price);
        });
        var hoveredSeries = param._internal_hoveredSeries === undefined ? undefined : this._private__mapSeriesToApi(param._internal_hoveredSeries);
        return {
            time: param._internal_time && (param._internal_time._internal_businessDay || param._internal_time._internal_timestamp),
            point: param._internal_point,
            hoveredSeries: hoveredSeries,
            hoveredMarkerId: param._internal_hoveredObject,
            seriesPrices: seriesPrices,
        };
    };
    return ChartApi;
}());
export { ChartApi };
