import { SeriesBarColorer } from '../../model/series-bar-colorer';
import { SeriesPlotRow } from '../../model/series-data';
import { TimePointIndex } from '../../model/time-data';
import { CandlestickItem } from '../../renderers/candlesticks-renderer';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { BarsPaneViewBase } from './bars-pane-view-base';
export declare class SeriesCandlesticksPaneView extends BarsPaneViewBase<'Candlestick', CandlestickItem> {
    private readonly _renderer;
    renderer(height: number, width: number): IPaneRenderer | null;
    protected _updateOptions(): void;
    protected _createRawItem(time: TimePointIndex, bar: SeriesPlotRow, colorer: SeriesBarColorer): CandlestickItem;
}
