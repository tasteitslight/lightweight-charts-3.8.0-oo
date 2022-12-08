import { TickMarkWeight, TimePoint, TimePointIndex, TimeScalePoint } from './time-data';
export interface TickMark {
    index: TimePointIndex;
    time: TimePoint;
    weight: TickMarkWeight;
}
export declare class TickMarks {
    private _marksByWeight;
    private _cache;
    setTimeScalePoints(newPoints: readonly TimeScalePoint[], firstChangedPointIndex: number): void;
    build(spacing: number, maxWidth: number): readonly TickMark[];
    private _removeMarksSinceIndex;
    private _buildMarksImpl;
}
