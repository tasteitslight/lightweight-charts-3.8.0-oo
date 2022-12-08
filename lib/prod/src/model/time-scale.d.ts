import { ISubscription } from '../helpers/isubscription';
import { DeepPartial } from '../helpers/strict-type-checks';
import { ChartModel } from './chart-model';
import { Coordinate } from './coordinate';
import { LocalizationOptions } from './localization-options';
import { RangeImpl } from './range-impl';
import { BusinessDay, Logical, LogicalRange, SeriesItemsIndexesRange, TickMarkWeight, TimedValue, TimePoint, TimePointIndex, TimePointsRange, TimeScalePoint, UTCTimestamp } from './time-data';
export interface TimeMark {
    needAlignCoordinate: boolean;
    coord: number;
    label: string;
    weight: TickMarkWeight;
}
/**
 * Represents the type of a tick mark on the time axis.
 */
export declare const enum TickMarkType {
    /**
     * The start of the year (e.g. it's the first tick mark in a year).
     */
    Year = 0,
    /**
     * The start of the month (e.g. it's the first tick mark in a month).
     */
    Month = 1,
    /**
     * A day of the month.
     */
    DayOfMonth = 2,
    /**
     * A time without seconds.
     */
    Time = 3,
    /**
     * A time with seconds.
     */
    TimeWithSeconds = 4
}
/**
 * The `TickMarkFormatter` is used to customize tick mark labels on the time scale.
 *
 * This function should return `time` as a string formatted according to `tickMarkType` type (year, month, etc) and `locale`.
 *
 * Note that the returned string should be the shortest possible value and should have no more than 8 characters.
 * Otherwise, the tick marks will overlap each other.
 *
 * @example
 * ```js
 * const customFormatter = (time, tickMarkType, locale) => {
 *     // your code here
 * };
 * ```
 */
export declare type TickMarkFormatter = (time: UTCTimestamp | BusinessDay, tickMarkType: TickMarkType, locale: string) => string;
/**
 * Options for the time scale; the horizontal scale at the bottom of the chart that displays the time of data.
 */
export interface TimeScaleOptions {
    /**
     * The margin space in bars from the right side of the chart.
     *
     * @defaultValue `0`
     */
    rightOffset: number;
    /**
     * The space between bars in pixels.
     *
     * @defaultValue `6`
     */
    barSpacing: number;
    /**
     * The minimum space between bars in pixels.
     *
     * @defaultValue `0.5`
     */
    minBarSpacing: number;
    /**
     * Prevent scrolling to the left of the first bar.
     *
     * @defaultValue `false`
     */
    fixLeftEdge: boolean;
    /**
     * Prevent scrolling to the right of the most recent bar.
     *
     * @defaultValue `false`
     */
    fixRightEdge: boolean;
    /**
     * Prevent changing the visible time range during chart resizing.
     *
     * @defaultValue `false`
     */
    lockVisibleTimeRangeOnResize: boolean;
    /**
     * Prevent the hovered bar from moving when scrolling.
     *
     * @defaultValue `false`
     */
    rightBarStaysOnScroll: boolean;
    /**
     * Show the time scale border.
     *
     * @defaultValue `true`
     */
    borderVisible: boolean;
    /**
     * The time scale border color.
     *
     * @defaultValue `'#2B2B43'`
     */
    borderColor: string;
    /**
     * Show the time scale.
     *
     * @defaultValue `true`
     */
    visible: boolean;
    /**
     * Show the time, not just the date, in the time scale and vertical crosshair label.
     *
     * @defaultValue `false`
     */
    timeVisible: boolean;
    /**
     * Show seconds in the time scale and vertical crosshair label in `hh:mm:ss` format for intraday data.
     *
     * @defaultValue `true`
     */
    secondsVisible: boolean;
    /**
     * Shift the visible range to the right (into the future) by the number of new bars when new data is added.
     *
     * Note that this only applies when the last bar is visible.
     *
     * @defaultValue `true`
     */
    shiftVisibleRangeOnNewBar: boolean;
    /**
     * Tick marks formatter can be used to customize tick marks labels on the time axis.
     *
     * @defaultValue `undefined`
     */
    tickMarkFormatter?: TickMarkFormatter;
}
export declare class TimeScale {
    private readonly _options;
    private readonly _model;
    private readonly _localizationOptions;
    private _dateTimeFormatter;
    private _width;
    private _baseIndexOrNull;
    private _rightOffset;
    private _points;
    private _barSpacing;
    private _scrollStartPoint;
    private _scaleStartPoint;
    private readonly _tickMarks;
    private _formattedByWeight;
    private _visibleRange;
    private _visibleRangeInvalidated;
    private readonly _visibleBarsChanged;
    private readonly _logicalRangeChanged;
    private readonly _optionsApplied;
    private _commonTransitionStartState;
    private _timeMarksCache;
    private _labels;
    constructor(model: ChartModel, options: TimeScaleOptions, localizationOptions: LocalizationOptions);
    options(): Readonly<TimeScaleOptions>;
    applyLocalizationOptions(localizationOptions: DeepPartial<LocalizationOptions>): void;
    applyOptions(options: DeepPartial<TimeScaleOptions>, localizationOptions?: DeepPartial<LocalizationOptions>): void;
    indexToTime(index: TimePointIndex): TimePoint | null;
    timeToIndex(time: TimePoint, findNearest: boolean): TimePointIndex | null;
    isEmpty(): boolean;
    visibleStrictRange(): RangeImpl<TimePointIndex> | null;
    visibleLogicalRange(): RangeImpl<Logical> | null;
    visibleTimeRange(): TimePointsRange | null;
    timeRangeForLogicalRange(range: LogicalRange): TimePointsRange;
    logicalRangeForTimeRange(range: TimePointsRange): LogicalRange;
    width(): number;
    setWidth(width: number): void;
    indexToCoordinate(index: TimePointIndex): Coordinate;
    indexesToCoordinates<T extends TimedValue>(points: T[], visibleRange?: SeriesItemsIndexesRange): void;
    coordinateToIndex(x: Coordinate): TimePointIndex;
    setRightOffset(offset: number): void;
    barSpacing(): number;
    setBarSpacing(newBarSpacing: number): void;
    rightOffset(): number;
    marks(): TimeMark[] | null;
    restoreDefault(): void;
    setBaseIndex(baseIndex: TimePointIndex | null): void;
    /**
     * Zoom in/out the scale around a `zoomPoint` on `scale` value.
     *
     * @param zoomPoint - X coordinate of the point to apply the zoom.
     * If `rightBarStaysOnScroll` option is disabled, then will be used to restore right offset.
     * @param scale - Zoom value (in 1/10 parts of current bar spacing).
     * Negative value means zoom out, positive - zoom in.
     */
    zoom(zoomPoint: Coordinate, scale: number): void;
    startScale(x: Coordinate): void;
    scaleTo(x: Coordinate): void;
    endScale(): void;
    startScroll(x: Coordinate): void;
    scrollTo(x: Coordinate): void;
    endScroll(): void;
    scrollToRealTime(): void;
    scrollToOffsetAnimated(offset: number, animationDuration?: number): void;
    update(newPoints: readonly TimeScalePoint[], firstChangedPointIndex: number): void;
    visibleBarsChanged(): ISubscription;
    logicalRangeChanged(): ISubscription;
    optionsApplied(): ISubscription;
    baseIndex(): TimePointIndex;
    setVisibleRange(range: RangeImpl<TimePointIndex>): void;
    fitContent(): void;
    setLogicalRange(range: LogicalRange): void;
    formatDateTime(time: TimePoint): string;
    private _isAllScalingAndScrollingDisabled;
    private _firstIndex;
    private _lastIndex;
    private _rightOffsetForCoordinate;
    private _coordinateToFloatIndex;
    private _setBarSpacing;
    private _updateVisibleRange;
    private _correctBarSpacing;
    private _minBarSpacing;
    private _correctOffset;
    private _minRightOffset;
    private _maxRightOffset;
    private _saveCommonTransitionsStartState;
    private _clearCommonTransitionsStartState;
    private _formatLabel;
    private _formatLabelImpl;
    private _setVisibleRange;
    private _resetTimeMarksCache;
    private _invalidateTickMarks;
    private _updateDateTimeFormatter;
    private _doFixLeftEdge;
    private _doFixRightEdge;
}
