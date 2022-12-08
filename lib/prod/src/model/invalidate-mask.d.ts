import { LogicalRange } from '../model/time-data';
export declare const enum InvalidationLevel {
    None = 0,
    Cursor = 1,
    Light = 2,
    Full = 3
}
export interface PaneInvalidation {
    level: InvalidationLevel;
    autoScale?: boolean;
}
export declare const enum TimeScaleInvalidationType {
    FitContent = 0,
    ApplyRange = 1,
    ApplyBarSpacing = 2,
    ApplyRightOffset = 3,
    Reset = 4
}
export interface TimeScaleApplyRangeInvalidation {
    type: TimeScaleInvalidationType.ApplyRange;
    value: LogicalRange;
}
export interface TimeScaleFitContentInvalidation {
    type: TimeScaleInvalidationType.FitContent;
}
export interface TimeScaleApplyRightOffsetInvalidation {
    type: TimeScaleInvalidationType.ApplyRightOffset;
    value: number;
}
export interface TimeScaleApplyBarSpacingInvalidation {
    type: TimeScaleInvalidationType.ApplyBarSpacing;
    value: number;
}
export interface TimeScaleResetInvalidation {
    type: TimeScaleInvalidationType.Reset;
}
export declare type TimeScaleInvalidation = TimeScaleApplyRangeInvalidation | TimeScaleFitContentInvalidation | TimeScaleApplyRightOffsetInvalidation | TimeScaleApplyBarSpacingInvalidation | TimeScaleResetInvalidation;
export declare class InvalidateMask {
    private _invalidatedPanes;
    private _globalLevel;
    private _timeScaleInvalidations;
    constructor(globalLevel: InvalidationLevel);
    invalidatePane(paneIndex: number, invalidation: PaneInvalidation): void;
    fullInvalidation(): InvalidationLevel;
    invalidateForPane(paneIndex: number): PaneInvalidation;
    setFitContent(): void;
    applyRange(range: LogicalRange): void;
    resetTimeScale(): void;
    setBarSpacing(barSpacing: number): void;
    setRightOffset(offset: number): void;
    timeScaleInvalidations(): readonly TimeScaleInvalidation[];
    merge(other: InvalidateMask): void;
    private _applyTimeScaleInvalidation;
}
