import { ChartModel } from '../../model/chart-model';
import { PriceScale } from '../../model/price-scale';
import { Series } from '../../model/series';
import { SeriesBarColorer } from '../../model/series-bar-colorer';
import { SeriesPlotRow } from '../../model/series-data';
import { TimePointIndex } from '../../model/time-data';
import { TimeScale } from '../../model/time-scale';
import { BarCandlestickItemBase } from '../../renderers/bars-renderer';
import { SeriesPaneViewBase } from './series-pane-view-base';
export declare abstract class BarsPaneViewBase<TSeriesType extends 'Bar' | 'Candlestick', ItemType extends BarCandlestickItemBase> extends SeriesPaneViewBase<TSeriesType, ItemType> {
    constructor(series: Series<TSeriesType>, model: ChartModel);
    protected _convertToCoordinates(priceScale: PriceScale, timeScale: TimeScale, firstValue: number): void;
    protected abstract _createRawItem(time: TimePointIndex, bar: SeriesPlotRow, colorer: SeriesBarColorer): ItemType;
    protected _createDefaultItem(time: TimePointIndex, bar: SeriesPlotRow, colorer: SeriesBarColorer): BarCandlestickItemBase;
    protected _fillRawPoints(): void;
}
