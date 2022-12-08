import { LastValueDataResultWithData, Series } from '../../model/series';
import { PriceAxisViewRendererCommonData, PriceAxisViewRendererData } from '../../renderers/iprice-axis-view-renderer';
import { PriceAxisView } from './price-axis-view';
export declare class SeriesPriceAxisView extends PriceAxisView {
    private readonly _source;
    constructor(source: Series);
    protected _updateRendererData(axisRendererData: PriceAxisViewRendererData, paneRendererData: PriceAxisViewRendererData, commonRendererData: PriceAxisViewRendererCommonData): void;
    protected _paneText(lastValue: LastValueDataResultWithData, showSeriesLastValue: boolean, showSymbolLabel: boolean, showPriceAndPercentage: boolean): string;
    protected _axisText(lastValueData: LastValueDataResultWithData, showSeriesLastValue: boolean, showPriceAndPercentage: boolean): string;
}
