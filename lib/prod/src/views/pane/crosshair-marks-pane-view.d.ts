import { ChartModel } from '../../model/chart-model';
import { Crosshair } from '../../model/crosshair';
import { IPaneRenderer } from '../../renderers/ipane-renderer';
import { IUpdatablePaneView, UpdateType } from './iupdatable-pane-view';
export declare class CrosshairMarksPaneView implements IUpdatablePaneView {
    private readonly _chartModel;
    private readonly _crosshair;
    private readonly _compositeRenderer;
    private _markersRenderers;
    private _markersData;
    private _invalidated;
    constructor(chartModel: ChartModel, crosshair: Crosshair);
    update(updateType?: UpdateType): void;
    renderer(height: number, width: number, addAnchors?: boolean): IPaneRenderer | null;
    private _updateImpl;
}
