import { __extends } from "tslib";
import { clamp } from '../helpers/mathex';
import { PaneRendererAreaBase } from './area-renderer';
import { PaneRendererLineBase } from './line-renderer';
var PaneRendererBaselineArea = /** @class */ (function (_super) {
    __extends(PaneRendererBaselineArea, _super);
    function PaneRendererBaselineArea() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PaneRendererBaselineArea.prototype._internal__fillStyle = function (ctx) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        var data = this._internal__data;
        var gradient = ctx.createLinearGradient(0, 0, 0, data._internal_bottom);
        var baselinePercent = clamp(data._internal_baseLevelCoordinate / data._internal_bottom, 0, 1);
        gradient.addColorStop(0, data._internal_topFillColor1);
        gradient.addColorStop(baselinePercent, data._internal_topFillColor2);
        gradient.addColorStop(baselinePercent, data._internal_bottomFillColor1);
        gradient.addColorStop(1, data._internal_bottomFillColor2);
        return gradient;
    };
    return PaneRendererBaselineArea;
}(PaneRendererAreaBase));
export { PaneRendererBaselineArea };
var PaneRendererBaselineLine = /** @class */ (function (_super) {
    __extends(PaneRendererBaselineLine, _super);
    function PaneRendererBaselineLine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PaneRendererBaselineLine.prototype._internal__strokeStyle = function (ctx) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        var data = this._internal__data;
        var gradient = ctx.createLinearGradient(0, 0, 0, data._internal_bottom);
        var baselinePercent = clamp(data._internal_baseLevelCoordinate / data._internal_bottom, 0, 1);
        gradient.addColorStop(0, data._internal_topColor);
        gradient.addColorStop(baselinePercent, data._internal_topColor);
        gradient.addColorStop(baselinePercent, data._internal_bottomColor);
        gradient.addColorStop(1, data._internal_bottomColor);
        return gradient;
    };
    return PaneRendererBaselineLine;
}(PaneRendererLineBase));
export { PaneRendererBaselineLine };
