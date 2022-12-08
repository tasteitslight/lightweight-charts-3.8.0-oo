import { Coordinate } from '../model/coordinate';
import { SeriesItemsIndexesRange } from '../model/time-data';
import { LineStyle, LineType, LineWidth } from './draw-line';
import { LineItem } from './line-renderer';
import { ScaledRenderer } from './scaled-renderer';
export interface PaneRendererAreaDataBase {
    items: LineItem[];
    lineType: LineType;
    lineWidth: LineWidth;
    lineStyle: LineStyle;
    bottom: Coordinate;
    baseLevelCoordinate: Coordinate;
    barWidth: number;
    visibleRange: SeriesItemsIndexesRange | null;
}
export declare abstract class PaneRendererAreaBase<TData extends PaneRendererAreaDataBase> extends ScaledRenderer {
    protected _data: TData | null;
    setData(data: TData): void;
    protected _drawImpl(ctx: CanvasRenderingContext2D): void;
    protected abstract _fillStyle(ctx: CanvasRenderingContext2D): CanvasRenderingContext2D['fillStyle'];
}
export interface PaneRendererAreaData extends PaneRendererAreaDataBase {
    topColor: string;
    bottomColor: string;
}
export declare class PaneRendererArea extends PaneRendererAreaBase<PaneRendererAreaData> {
    protected _fillStyle(ctx: CanvasRenderingContext2D): CanvasRenderingContext2D['fillStyle'];
}
