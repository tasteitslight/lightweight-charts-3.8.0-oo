import { Series } from '../../model/series';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { IUpdatablePaneView } from './iupdatable-pane-view';
export declare class SeriesLastPriceAnimationPaneView implements IUpdatablePaneView {
    private readonly _series;
    private readonly _renderer;
    private _invalidated;
    private _stageInvalidated;
    private _startTime;
    private _endTime;
    constructor(series: Series<'Area'> | Series<'Line'> | Series<'Baseline'>);
    onDataCleared(): void;
    onNewRealtimeDataReceived(): void;
    update(): void;
    invalidateStage(): void;
    visible(): boolean;
    animationActive(): boolean;
    renderer(height: number, width: number): IPaneRenderer | null;
    private _updateImpl;
    private _updateRendererDataStage;
    private _duration;
}
