import { Point } from '../model/point';
import { IPaneRenderer } from './ipane-renderer';
export interface LastPriceCircleRendererData {
    radius: number;
    fillColor: string;
    strokeColor: string;
    seriesLineColor: string;
    seriesLineWidth: number;
    center: Point;
}
export declare class SeriesLastPriceAnimationRenderer implements IPaneRenderer {
    private _data;
    setData(data: LastPriceCircleRendererData | null): void;
    data(): LastPriceCircleRendererData | null;
    draw(ctx: CanvasRenderingContext2D, pixelRatio: number, isHovered: boolean, hitTestData?: unknown): void;
}
