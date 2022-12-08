import { Series } from './series';
import { SeriesPlotRow } from './series-data';
import { TimePointIndex } from './time-data';
export interface PrecomputedBars {
    value: SeriesPlotRow;
    previousValue?: SeriesPlotRow;
}
export interface BarColorerStyle {
    barColor: string;
    barBorderColor: string;
    barWickColor: string;
}
export declare class SeriesBarColorer {
    private _series;
    constructor(series: Series);
    barStyle(barIndex: TimePointIndex, precomputedBars?: PrecomputedBars): BarColorerStyle;
    private _barStyle;
    private _candleStyle;
    private _areaStyle;
    private _baselineStyle;
    private _lineStyle;
    private _histogramStyle;
    private _findBar;
}
