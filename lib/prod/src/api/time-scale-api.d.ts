import { TimeAxisWidget } from '../gui/time-axis-widget';
import { IDestroyable } from '../helpers/idestroyable';
import { DeepPartial } from '../helpers/strict-type-checks';
import { ChartModel } from '../model/chart-model';
import { Coordinate } from '../model/coordinate';
import { Logical, LogicalRange, Range } from '../model/time-data';
import { TimeScaleOptions } from '../model/time-scale';
import { Time } from './data-consumer';
import { ITimeScaleApi, LogicalRangeChangeEventHandler, SizeChangeEventHandler, TimeRange, TimeRangeChangeEventHandler } from './itime-scale-api';
export declare class TimeScaleApi implements ITimeScaleApi, IDestroyable {
    private _model;
    private _timeScale;
    private readonly _timeAxisWidget;
    private readonly _timeRangeChanged;
    private readonly _logicalRangeChanged;
    private readonly _sizeChanged;
    constructor(model: ChartModel, timeAxisWidget: TimeAxisWidget);
    destroy(): void;
    scrollPosition(): number;
    scrollToPosition(position: number, animated: boolean): void;
    scrollToRealTime(): void;
    getVisibleRange(): TimeRange | null;
    setVisibleRange(range: TimeRange): void;
    getVisibleLogicalRange(): LogicalRange | null;
    setVisibleLogicalRange(range: Range<number>): void;
    resetTimeScale(): void;
    fitContent(): void;
    logicalToCoordinate(logical: Logical): Coordinate | null;
    coordinateToLogical(x: number): Logical | null;
    timeToCoordinate(time: Time): Coordinate | null;
    coordinateToTime(x: number): Time | null;
    width(): number;
    height(): number;
    subscribeVisibleTimeRangeChange(handler: TimeRangeChangeEventHandler): void;
    unsubscribeVisibleTimeRangeChange(handler: TimeRangeChangeEventHandler): void;
    subscribeVisibleLogicalRangeChange(handler: LogicalRangeChangeEventHandler): void;
    unsubscribeVisibleLogicalRangeChange(handler: LogicalRangeChangeEventHandler): void;
    subscribeSizeChange(handler: SizeChangeEventHandler): void;
    unsubscribeSizeChange(handler: SizeChangeEventHandler): void;
    applyOptions(options: DeepPartial<TimeScaleOptions>): void;
    options(): Readonly<TimeScaleOptions>;
    private _onVisibleBarsChanged;
    private _onVisibleLogicalRangeChanged;
    private _onSizeChanged;
}
