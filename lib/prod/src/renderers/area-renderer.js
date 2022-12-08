import { __extends } from "tslib";
import { setLineStyle } from './draw-line';
import { ScaledRenderer } from './scaled-renderer';
import { walkLine } from './walk-line';
var PaneRendererAreaBase = /** @class */ (function (_super) {
    __extends(PaneRendererAreaBase, _super);
    function PaneRendererAreaBase() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._internal__data = null;
        return _this;
    }
    PaneRendererAreaBase.prototype._internal_setData = function (data) {
        this._internal__data = data;
    };
    PaneRendererAreaBase.prototype._internal__drawImpl = function (ctx) {
        if (this._internal__data === null || this._internal__data._internal_items.length === 0 || this._internal__data._internal_visibleRange === null) {
            return;
        }
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'round';
        ctx.lineWidth = this._internal__data._internal_lineWidth;
        setLineStyle(ctx, this._internal__data._internal_lineStyle);
        // walk lines with width=1 to have more accurate gradient's filling
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (this._internal__data._internal_items.length === 1) {
            var point = this._internal__data._internal_items[0];
            var halfBarWidth = this._internal__data._internal_barWidth / 2;
            ctx.moveTo(point._internal_x - halfBarWidth, this._internal__data._internal_baseLevelCoordinate);
            ctx.lineTo(point._internal_x - halfBarWidth, point._internal_y);
            ctx.lineTo(point._internal_x + halfBarWidth, point._internal_y);
            ctx.lineTo(point._internal_x + halfBarWidth, this._internal__data._internal_baseLevelCoordinate);
        }
        else {
            ctx.moveTo(this._internal__data._internal_items[this._internal__data._internal_visibleRange.from]._internal_x, this._internal__data._internal_baseLevelCoordinate);
            ctx.lineTo(this._internal__data._internal_items[this._internal__data._internal_visibleRange.from]._internal_x, this._internal__data._internal_items[this._internal__data._internal_visibleRange.from]._internal_y);
            walkLine(ctx, this._internal__data._internal_items, this._internal__data._internal_lineType, this._internal__data._internal_visibleRange);
            if (this._internal__data._internal_visibleRange.to > this._internal__data._internal_visibleRange.from) {
                ctx.lineTo(this._internal__data._internal_items[this._internal__data._internal_visibleRange.to - 1]._internal_x, this._internal__data._internal_baseLevelCoordinate);
                ctx.lineTo(this._internal__data._internal_items[this._internal__data._internal_visibleRange.from]._internal_x, this._internal__data._internal_baseLevelCoordinate);
            }
        }
        ctx.closePath();
        ctx.fillStyle = this._internal__fillStyle(ctx);
        ctx.fill();
    };
    return PaneRendererAreaBase;
}(ScaledRenderer));
export { PaneRendererAreaBase };
var PaneRendererArea = /** @class */ (function (_super) {
    __extends(PaneRendererArea, _super);
    function PaneRendererArea() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PaneRendererArea.prototype._internal__fillStyle = function (ctx) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        var data = this._internal__data;
        var gradient = ctx.createLinearGradient(0, 0, 0, data._internal_bottom);
        gradient.addColorStop(0, data._internal_topColor);
        gradient.addColorStop(1, data._internal_bottomColor);
        return gradient;
    };
    return PaneRendererArea;
}(PaneRendererAreaBase));
export { PaneRendererArea };
