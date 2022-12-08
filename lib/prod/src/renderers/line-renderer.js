import { __extends } from "tslib";
import { setLineStyle } from './draw-line';
import { ScaledRenderer } from './scaled-renderer';
import { walkLine } from './walk-line';
var PaneRendererLineBase = /** @class */ (function (_super) {
    __extends(PaneRendererLineBase, _super);
    function PaneRendererLineBase() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._internal__data = null;
        return _this;
    }
    PaneRendererLineBase.prototype._internal_setData = function (data) {
        this._internal__data = data;
    };
    PaneRendererLineBase.prototype._internal__drawImpl = function (ctx) {
        if (this._internal__data === null || this._internal__data._internal_items.length === 0 || this._internal__data._internal_visibleRange === null) {
            return;
        }
        ctx.lineCap = 'butt';
        ctx.lineWidth = this._internal__data._internal_lineWidth;
        setLineStyle(ctx, this._internal__data._internal_lineStyle);
        ctx.strokeStyle = this._internal__strokeStyle(ctx);
        ctx.lineJoin = 'round';
        if (this._internal__data._internal_items.length === 1) {
            ctx.beginPath();
            var point = this._internal__data._internal_items[0];
            ctx.moveTo(point._internal_x - this._internal__data._internal_barWidth / 2, point._internal_y);
            ctx.lineTo(point._internal_x + this._internal__data._internal_barWidth / 2, point._internal_y);
            if (point._internal_color !== undefined) {
                ctx.strokeStyle = point._internal_color;
            }
            ctx.stroke();
        }
        else {
            this._internal__drawLine(ctx, this._internal__data);
        }
    };
    PaneRendererLineBase.prototype._internal__drawLine = function (ctx, data) {
        ctx.beginPath();
        walkLine(ctx, data._internal_items, data._internal_lineType, data._internal_visibleRange);
        ctx.stroke();
    };
    return PaneRendererLineBase;
}(ScaledRenderer));
export { PaneRendererLineBase };
var PaneRendererLine = /** @class */ (function (_super) {
    __extends(PaneRendererLine, _super);
    function PaneRendererLine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Similar to {@link walkLine}, but supports color changes
     */
    PaneRendererLine.prototype._internal__drawLine = function (ctx, data) {
        var _a, _b;
        var items = data._internal_items, visibleRange = data._internal_visibleRange, lineType = data._internal_lineType, lineColor = data._internal_lineColor;
        if (items.length === 0 || visibleRange === null) {
            return;
        }
        ctx.beginPath();
        var firstItem = items[visibleRange.from];
        ctx.moveTo(firstItem._internal_x, firstItem._internal_y);
        var prevStrokeStyle = (_a = firstItem._internal_color) !== null && _a !== void 0 ? _a : lineColor;
        ctx.strokeStyle = prevStrokeStyle;
        var changeColor = function (color) {
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = color;
            prevStrokeStyle = color;
        };
        for (var i = visibleRange.from + 1; i < visibleRange.to; ++i) {
            var currItem = items[i];
            var prevItem = items[i - 1];
            var currentStrokeStyle = (_b = currItem._internal_color) !== null && _b !== void 0 ? _b : lineColor;
            if (lineType === 1 /* WithSteps */) {
                ctx.lineTo(currItem._internal_x, prevItem._internal_y);
                if (currentStrokeStyle !== prevStrokeStyle) {
                    changeColor(currentStrokeStyle);
                    ctx.moveTo(currItem._internal_x, prevItem._internal_y);
                }
            }
            ctx.lineTo(currItem._internal_x, currItem._internal_y);
            if (lineType !== 1 /* WithSteps */ && currentStrokeStyle !== prevStrokeStyle) {
                changeColor(currentStrokeStyle);
                ctx.moveTo(currItem._internal_x, currItem._internal_y);
            }
        }
        ctx.stroke();
    };
    PaneRendererLine.prototype._internal__strokeStyle = function () {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this._internal__data._internal_lineColor;
    };
    return PaneRendererLine;
}(PaneRendererLineBase));
export { PaneRendererLine };
