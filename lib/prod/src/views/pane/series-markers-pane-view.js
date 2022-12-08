import { ensureNever } from '../../helpers/assertions';
import { isNumber } from '../../helpers/strict-type-checks';
import { visibleTimedValues } from '../../model/time-data';
import { SeriesMarkersRenderer, } from '../../renderers/series-markers-renderer';
import { calculateShapeHeight, shapeMargin as calculateShapeMargin, } from '../../renderers/series-markers-utils';
;
// eslint-disable-next-line max-params
function fillSizeAndY(rendererItem, marker, seriesData, offsets, textHeight, shapeMargin, priceScale, timeScale, firstValue) {
    var inBarPrice = isNumber(seriesData) ? seriesData : seriesData.close;
    var highPrice = isNumber(seriesData) ? seriesData : seriesData.high;
    var lowPrice = isNumber(seriesData) ? seriesData : seriesData.low;
    var sizeMultiplier = isNumber(marker.size) ? Math.max(marker.size, 0) : 1;
    var shapeSize = calculateShapeHeight(timeScale._internal_barSpacing()) * sizeMultiplier;
    var halfSize = shapeSize / 2;
    rendererItem._internal_size = shapeSize;
    switch (marker.position) {
        case 'inBar': {
            rendererItem._internal_y = priceScale._internal_priceToCoordinate(inBarPrice, firstValue);
            if (rendererItem._internal_text !== undefined) {
                rendererItem._internal_text._internal_y = rendererItem._internal_y + halfSize + shapeMargin + textHeight * (0.5 + 0.1 /* TextMargin */);
            }
            return;
        }
        case 'aboveBar': {
            rendererItem._internal_y = (priceScale._internal_priceToCoordinate(highPrice, firstValue) - halfSize - offsets._internal_aboveBar);
            if (rendererItem._internal_text !== undefined) {
                rendererItem._internal_text._internal_y = rendererItem._internal_y - halfSize - textHeight * (0.5 + 0.1 /* TextMargin */);
                offsets._internal_aboveBar += textHeight * (1 + 2 * 0.1 /* TextMargin */);
            }
            offsets._internal_aboveBar += shapeSize + shapeMargin;
            return;
        }
        case 'belowBar': {
            rendererItem._internal_y = (priceScale._internal_priceToCoordinate(lowPrice, firstValue) + halfSize + offsets._internal_belowBar);
            if (rendererItem._internal_text !== undefined) {
                rendererItem._internal_text._internal_y = rendererItem._internal_y + halfSize + shapeMargin + textHeight * (0.5 + 0.1 /* TextMargin */);
                offsets._internal_belowBar += textHeight * (1 + 2 * 0.1 /* TextMargin */);
            }
            offsets._internal_belowBar += shapeSize + shapeMargin;
            return;
        }
    }
    ensureNever(marker.position);
}
var SeriesMarkersPaneView = /** @class */ (function () {
    function SeriesMarkersPaneView(series, model) {
        this._private__invalidated = true;
        this._private__dataInvalidated = true;
        this._private__autoScaleMarginsInvalidated = true;
        this._private__autoScaleMargins = null;
        this._private__renderer = new SeriesMarkersRenderer();
        this._private__series = series;
        this._private__model = model;
        this._private__data = {
            _internal_items: [],
            _internal_visibleRange: null,
        };
    }
    SeriesMarkersPaneView.prototype._internal_update = function (updateType) {
        this._private__invalidated = true;
        this._private__autoScaleMarginsInvalidated = true;
        if (updateType === 'data') {
            this._private__dataInvalidated = true;
        }
    };
    SeriesMarkersPaneView.prototype._internal_renderer = function (height, width, addAnchors) {
        if (!this._private__series._internal_visible()) {
            return null;
        }
        if (this._private__invalidated) {
            this._internal__makeValid();
        }
        var layout = this._private__model._internal_options().layout;
        this._private__renderer._internal_setParams(layout.fontSize, layout.fontFamily);
        this._private__renderer._internal_setData(this._private__data);
        return this._private__renderer;
    };
    SeriesMarkersPaneView.prototype._internal_autoScaleMargins = function () {
        if (this._private__autoScaleMarginsInvalidated) {
            if (this._private__series._internal_indexedMarkers().length > 0) {
                var barSpacing = this._private__model._internal_timeScale()._internal_barSpacing();
                var shapeMargin = calculateShapeMargin(barSpacing);
                var marginsAboveAndBelow = calculateShapeHeight(barSpacing) * 1.5 + shapeMargin * 2;
                this._private__autoScaleMargins = {
                    above: marginsAboveAndBelow,
                    below: marginsAboveAndBelow,
                };
            }
            else {
                this._private__autoScaleMargins = null;
            }
            this._private__autoScaleMarginsInvalidated = false;
        }
        return this._private__autoScaleMargins;
    };
    SeriesMarkersPaneView.prototype._internal__makeValid = function () {
        var priceScale = this._private__series._internal_priceScale();
        var timeScale = this._private__model._internal_timeScale();
        var seriesMarkers = this._private__series._internal_indexedMarkers();
        if (this._private__dataInvalidated) {
            this._private__data._internal_items = seriesMarkers.map(function (marker) { return ({
                _internal_time: marker.time,
                _internal_x: 0,
                _internal_y: 0,
                _internal_size: 0,
                _internal_shape: marker.shape,
                _internal_color: marker.color,
                _internal_internalId: marker._internal_internalId,
                _internal_externalId: marker.id,
                _internal_text: undefined,
            }); });
            this._private__dataInvalidated = false;
        }
        var layoutOptions = this._private__model._internal_options().layout;
        this._private__data._internal_visibleRange = null;
        var visibleBars = timeScale._internal_visibleStrictRange();
        if (visibleBars === null) {
            return;
        }
        var firstValue = this._private__series._internal_firstValue();
        if (firstValue === null) {
            return;
        }
        if (this._private__data._internal_items.length === 0) {
            return;
        }
        var prevTimeIndex = NaN;
        var shapeMargin = calculateShapeMargin(timeScale._internal_barSpacing());
        var offsets = {
            _internal_aboveBar: shapeMargin,
            _internal_belowBar: shapeMargin,
        };
        this._private__data._internal_visibleRange = visibleTimedValues(this._private__data._internal_items, visibleBars, true);
        for (var index = this._private__data._internal_visibleRange.from; index < this._private__data._internal_visibleRange.to; index++) {
            var marker = seriesMarkers[index];
            if (marker.time !== prevTimeIndex) {
                // new bar, reset stack counter
                offsets._internal_aboveBar = shapeMargin;
                offsets._internal_belowBar = shapeMargin;
                prevTimeIndex = marker.time;
            }
            var rendererItem = this._private__data._internal_items[index];
            rendererItem._internal_x = timeScale._internal_indexToCoordinate(marker.time);
            if (marker.text !== undefined && marker.text.length > 0) {
                rendererItem._internal_text = {
                    _internal_content: marker.text,
                    _internal_y: 0,
                    _internal_width: 0,
                    _internal_height: 0,
                };
            }
            var dataAt = this._private__series._internal_dataAt(marker.time);
            if (dataAt === null) {
                continue;
            }
            fillSizeAndY(rendererItem, marker, dataAt, offsets, layoutOptions.fontSize, shapeMargin, priceScale, timeScale, firstValue._internal_value);
        }
        this._private__invalidated = false;
    };
    return SeriesMarkersPaneView;
}());
export { SeriesMarkersPaneView };
