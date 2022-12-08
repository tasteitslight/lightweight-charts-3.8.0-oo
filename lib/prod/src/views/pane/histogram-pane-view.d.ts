import { ChartModel } from '../../model/chart-model';
import { PriceScale } from '../../model/price-scale';
import { Series } from '../../model/series';
import { TimedValue } from '../../model/time-data';
import { TimeScale } from '../../model/time-scale';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { SeriesPaneViewBase } from './series-pane-view-base';
export declare class SeriesHistogramPaneView extends SeriesPaneViewBase<'Histogram', TimedValue> {
    private _compositeRenderer;
    private _histogramData;
    private _renderer;
    constructor(series: Series<'Histogram'>, model: ChartModel);
    renderer(height: number, width: number): IPaneRenderer | null;
    protected _fillRawPoints(): void;
    protected _updateOptions(): void;
    protected _clearVisibleRange(): void;
    protected _convertToCoordinates(priceScale: PriceScale, timeScale: TimeScale, firstValue: number): void;
}
