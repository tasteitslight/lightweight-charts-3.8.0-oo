import { BarPrice } from '../../model/bar';
import { ChartModel } from '../../model/chart-model';
import { Series } from '../../model/series';
import { TimePointIndex } from '../../model/time-data';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { LineItem } from '../../renderers/line-renderer';
import { LinePaneViewBase } from './line-pane-view-base';
export declare class SeriesBaselinePaneView extends LinePaneViewBase<'Baseline', LineItem> {
    private readonly _baselineAreaRenderer;
    private readonly _baselineLineRenderer;
    private readonly _compositeRenderer;
    constructor(series: Series<'Baseline'>, model: ChartModel);
    renderer(height: number, width: number): IPaneRenderer | null;
    protected _createRawItem(time: TimePointIndex, price: BarPrice): LineItem;
}
