import { Coordinate } from '../model/coordinate';
import { PaneRendererAreaBase, PaneRendererAreaDataBase } from './area-renderer';
import { PaneRendererLineBase, PaneRendererLineDataBase } from './line-renderer';
export interface PaneRendererBaselineData extends PaneRendererAreaDataBase {
    topFillColor1: string;
    topFillColor2: string;
    bottomFillColor1: string;
    bottomFillColor2: string;
}
export declare class PaneRendererBaselineArea extends PaneRendererAreaBase<PaneRendererBaselineData> {
    protected _fillStyle(ctx: CanvasRenderingContext2D): CanvasRenderingContext2D['fillStyle'];
}
export interface PaneRendererBaselineLineData extends PaneRendererLineDataBase {
    topColor: string;
    bottomColor: string;
    baseLevelCoordinate: Coordinate;
    bottom: Coordinate;
}
export declare class PaneRendererBaselineLine extends PaneRendererLineBase<PaneRendererBaselineLineData> {
    protected _strokeStyle(ctx: CanvasRenderingContext2D): CanvasRenderingContext2D['strokeStyle'];
}
