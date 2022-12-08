/// <reference types="_global-types" />
import { PlotRow } from '../model/plot-data';
import { SeriesPlotRow } from '../model/series-data';
import { SeriesType } from '../model/series-options';
import { TimePoint, TimePointIndex } from '../model/time-data';
import { SeriesDataItemTypeMap } from './data-consumer';
export declare type WhitespacePlotRow = Omit<PlotRow, 'value'>;
export declare function isSeriesPlotRow(row: SeriesPlotRow | WhitespacePlotRow): row is SeriesPlotRow;
export declare type TimedSeriesItemValueFn = (time: TimePoint, index: TimePointIndex, item: SeriesDataItemTypeMap[SeriesType]) => Mutable<SeriesPlotRow | WhitespacePlotRow>;
export declare function getSeriesPlotRowCreator(seriesType: SeriesType): TimedSeriesItemValueFn;
