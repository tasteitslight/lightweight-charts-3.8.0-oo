import { SeriesBarColorer } from '../../model/series-bar-colorer';
import { SeriesPlotRow } from '../../model/series-data';
import { TimePointIndex } from '../../model/time-data';
import { BarItem } from '../../renderers/bars-renderer';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { BarsPaneViewBase } from './bars-pane-view-base';
export declare class SeriesBarsPaneView extends BarsPaneViewBase<'Bar', BarItem> {
    private readonly _renderer;
    renderer(height: number, width: number): IPaneRenderer | null;
    protected _updateOptions(): void;
    protected _createRawItem(time: TimePointIndex, bar: SeriesPlotRow, colorer: SeriesBarColorer): BarItem;
}
