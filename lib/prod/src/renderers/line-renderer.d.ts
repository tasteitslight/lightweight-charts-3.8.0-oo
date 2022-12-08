import { PricedValue } from '../model/price-scale';
import { SeriesItemsIndexesRange, TimedValue } from '../model/time-data';
import { LinePoint, LineStyle, LineType, LineWidth } from './draw-line';
import { ScaledRenderer } from './scaled-renderer';
export declare type LineItem = TimedValue & PricedValue & LinePoint & {
    color?: string;
};
export interface PaneRendererLineDataBase {
    lineType: LineType;
    items: LineItem[];
    barWidth: number;
    lineWidth: LineWidth;
    lineStyle: LineStyle;
    visibleRange: SeriesItemsIndexesRange | null;
}
export declare abstract class PaneRendererLineBase<TData extends PaneRendererLineDataBase> extends ScaledRenderer {
    protected _data: TData | null;
    setData(data: TData): void;
    protected _drawImpl(ctx: CanvasRenderingContext2D): void;
    protected _drawLine(ctx: CanvasRenderingContext2D, data: TData): void;
    protected abstract _strokeStyle(ctx: CanvasRenderingContext2D): CanvasRenderingContext2D['strokeStyle'];
}
export interface PaneRendererLineData extends PaneRendererLineDataBase {
    lineColor: string;
}
export declare class PaneRendererLine extends PaneRendererLineBase<PaneRendererLineData> {
    /**
     * Similar to {@link walkLine}, but supports color changes
     */
    protected _drawLine(ctx: CanvasRenderingContext2D, data: PaneRendererLineData): void;
    protected _strokeStyle(): CanvasRenderingContext2D['strokeStyle'];
}
