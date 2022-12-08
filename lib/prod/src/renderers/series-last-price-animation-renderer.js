var SeriesLastPriceAnimationRenderer = /** @class */ (function () {
    function SeriesLastPriceAnimationRenderer() {
        this._private__data = null;
    }
    SeriesLastPriceAnimationRenderer.prototype._internal_setData = function (data) {
        this._private__data = data;
    };
    SeriesLastPriceAnimationRenderer.prototype._internal_data = function () {
        return this._private__data;
    };
    SeriesLastPriceAnimationRenderer.prototype._internal_draw = function (ctx, pixelRatio, isHovered, hitTestData) {
        var data = this._private__data;
        if (data === null) {
            return;
        }
        ctx.save();
        var tickWidth = Math.max(1, Math.floor(pixelRatio));
        var correction = (tickWidth % 2) / 2;
        var centerX = Math.round(data._internal_center.x * pixelRatio) + correction; // correct x coordinate only
        var centerY = data._internal_center.y * pixelRatio;
        ctx.fillStyle = data._internal_seriesLineColor;
        ctx.beginPath();
        var centerPointRadius = Math.max(2, data._internal_seriesLineWidth * 1.5) * pixelRatio;
        ctx.arc(centerX, centerY, centerPointRadius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.fillStyle = data._internal_fillColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, data._internal_radius * pixelRatio, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.lineWidth = tickWidth;
        ctx.strokeStyle = data._internal_strokeColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY, data._internal_radius * pixelRatio + tickWidth / 2, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.restore();
    };
    return SeriesLastPriceAnimationRenderer;
}());
export { SeriesLastPriceAnimationRenderer };
