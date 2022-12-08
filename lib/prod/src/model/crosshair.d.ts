import { LineStyle, LineWidth } from '../renderers/draw-line';
import { IPaneView } from '../views/pane/ipane-view';
import { IPriceAxisView } from '../views/price-axis/iprice-axis-view';
import { ITimeAxisView } from '../views/time-axis/itime-axis-view';
import { ChartModel } from './chart-model';
import { Coordinate } from './coordinate';
import { DataSource } from './data-source';
import { Pane } from './pane';
import { PriceScale } from './price-scale';
import { TimePoint, TimePointIndex } from './time-data';
export interface CrosshairPriceAndCoordinate {
    price: number;
    coordinate: number;
}
export interface CrosshairTimeAndCoordinate {
    time: TimePoint | null;
    coordinate: number;
}
export declare type PriceAndCoordinateProvider = (priceScale: PriceScale) => CrosshairPriceAndCoordinate;
export declare type TimeAndCoordinateProvider = () => CrosshairTimeAndCoordinate;
/**
 * Represents the crosshair mode.
 */
export declare const enum CrosshairMode {
    /**
     * This mode allows crosshair to move freely on the chart.
     */
    Normal = 0,
    /**
     * This mode sticks crosshair's horizontal line to the price value of a single-value series or to the close price of OHLC-based series.
     */
    Magnet = 1
}
/** Structure describing a crosshair line (vertical or horizontal) */
export interface CrosshairLineOptions {
    /**
     * Crosshair line color.
     *
     * @defaultValue `'#758696'`
     */
    color: string;
    /**
     * Crosshair line width.
     *
     * @defaultValue `1`
     */
    width: LineWidth;
    /**
     * Crosshair line style.
     *
     * @defaultValue {@link LineStyle.LargeDashed}
     */
    style: LineStyle;
    /**
     * Display the crosshair line.
     *
     * Note that disabling crosshair lines does not disable crosshair marker on Line and Area series.
     * It can be disabled by using `crosshairMarkerVisible` option of a relevant series.
     *
     * @see {@link LineStyleOptions.crosshairMarkerVisible}
     * @see {@link AreaStyleOptions.crosshairMarkerVisible}
     * @see {@link BaselineStyleOptions.crosshairMarkerVisible}
     * @defaultValue `true`
     */
    visible: boolean;
    /**
     * Display the crosshair label on the relevant scale.
     *
     * @defaultValue `true`
     */
    labelVisible: boolean;
    /**
     * Crosshair label background color.
     *
     * @defaultValue `'#4c525e'`
     */
    labelBackgroundColor: string;
}
/** Structure describing crosshair options  */
export interface CrosshairOptions {
    /**
     * Crosshair mode
     *
     * @defaultValue {@link CrosshairMode.Magnet}
     */
    mode: CrosshairMode;
    /**
     * Vertical line options.
     */
    vertLine: CrosshairLineOptions;
    /**
     * Horizontal line options.
     */
    horzLine: CrosshairLineOptions;
}
export declare class Crosshair extends DataSource {
    private _pane;
    private _price;
    private _index;
    private _visible;
    private readonly _model;
    private _priceAxisViews;
    private readonly _timeAxisView;
    private readonly _markersPaneView;
    private _subscribed;
    private readonly _currentPosPriceProvider;
    private readonly _options;
    private readonly _paneView;
    private _x;
    private _y;
    private _originX;
    private _originY;
    constructor(model: ChartModel, options: CrosshairOptions);
    options(): Readonly<CrosshairOptions>;
    saveOriginCoord(x: Coordinate, y: Coordinate): void;
    clearOriginCoord(): void;
    originCoordX(): Coordinate;
    originCoordY(): Coordinate;
    setPosition(index: TimePointIndex, price: number, pane: Pane): void;
    appliedIndex(): TimePointIndex;
    appliedX(): Coordinate;
    appliedY(): Coordinate;
    visible(): boolean;
    clearPosition(): void;
    paneViews(pane: Pane): readonly IPaneView[];
    horzLineVisible(pane: Pane): boolean;
    vertLineVisible(): boolean;
    priceAxisViews(pane: Pane, priceScale: PriceScale): IPriceAxisView[];
    timeAxisViews(): readonly ITimeAxisView[];
    pane(): Pane | null;
    updateAllViews(): void;
    private _priceScaleByPane;
    private _tryToUpdateViews;
    private _tryToUpdateData;
    private _setIndexToLastSeriesBarIndex;
    private _createPriceAxisViewOnDemand;
}
