import { PlotRow } from './plot-data';
import { PlotList } from './plot-list';
import { SeriesType } from './series-options';
export interface LinePlotRow extends PlotRow {
    readonly color?: string;
}
export interface HistogramPlotRow extends PlotRow {
    readonly color?: string;
}
export interface BarPlotRow extends PlotRow {
    readonly color?: string;
}
export interface CandlestickPlotRow extends PlotRow {
    readonly color?: string;
    readonly borderColor?: string;
    readonly wickColor?: string;
}
export interface SeriesPlotRowTypeAtTypeMap {
    Bar: BarPlotRow;
    Candlestick: CandlestickPlotRow;
    Area: PlotRow;
    Baseline: PlotRow;
    Line: LinePlotRow;
    Histogram: HistogramPlotRow;
}
export declare type SeriesPlotRow<T extends SeriesType = SeriesType> = SeriesPlotRowTypeAtTypeMap[T];
export declare type SeriesPlotList<T extends SeriesType = SeriesType> = PlotList<SeriesPlotRow<T>>;
export declare function createSeriesPlotList<T extends SeriesType = SeriesType>(): SeriesPlotList<T>;
