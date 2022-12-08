import { isNumber, isString } from '../helpers/strict-type-checks';

import { Series } from '../model/series';
import { SeriesType } from '../model/series-options';
import { BusinessDay, UTCTimestamp } from '../model/time-data';

/**
 * The Time type is used to represent the time of data items.
 *
 * Values can be a {@link UTCTimestamp}, a {@link BusinessDay}, or a business day string in ISO format.
 *
 * @example
 * ```js
 * const timestamp = 1529899200; // Literal timestamp representing 2018-06-25T04:00:00.000Z
 * const businessDay = { year: 2019, month: 6, day: 1 }; // June 1, 2019
 * const businessDayString = '2021-02-03'; // Business day string literal
 * ```
 */
export type Time = UTCTimestamp | BusinessDay | string;

/**
 * Check if a time value is a business day object.
 *
 * @param time - The time to check.
 * @returns `true` if `time` is a {@link BusinessDay} object, false otherwise.
 */
export function isBusinessDay(time: Time): time is BusinessDay {
	return !isNumber(time) && !isString(time);
}

/**
 * Check if a time value is a UTC timestamp number.
 *
 * @param time - The time to check.
 * @returns `true` if `time` is a {@link UTCTimestamp} number, false otherwise.
 */
export function isUTCTimestamp(time: Time): time is UTCTimestamp {
	return isNumber(time);
}

/**
 * Represents a whitespace data item, which is a data point without a value.
 *
 * @example
 * ```js
 * const data = [
 *     { time: '2018-12-03', value: 27.02 },
 *     { time: '2018-12-04' }, // whitespace
 *     { time: '2018-12-05' }, // whitespace
 *     { time: '2018-12-06' }, // whitespace
 *     { time: '2018-12-07' }, // whitespace
 *     { time: '2018-12-08', value: 23.92 },
 *     { time: '2018-12-13', value: 30.74 },
 * ];
 * ```
 */
export interface WhitespaceData {
	/**
	 * The time of the data.
	 */
	time: Time;
}

/**
 * A base interface for a data point of single-value series.
 */
export interface SingleValueData {
	/**
	 * The time of the data.
	 */
	time: Time;

	/**
	 * Price value of the data.
	 */
	value: number;
}

/**
 * Structure describing a single item of data for line series
 */
export interface LineData extends SingleValueData {
	/**
	 * Optional color value for certain data item. If missed, color from options is used
	 */
	color?: string;
}

/**
 * Structure describing a single item of data for histogram series
 */
export interface HistogramData extends SingleValueData {
	/**
	 * Optional color value for certain data item. If missed, color from options is used
	 */
	color?: string;
}

/**
 * Represents a bar with a {@link Time} and open, high, low, and close prices.
 */
export interface OhlcData {
	/**
	 * The bar time.
	 */
	time: Time;

	/**
	 * The open price.
	 */
	open: number;
	/**
	 * The high price.
	 */
	high: number;
	/**
	 * The low price.
	 */
	low: number;
	/**
	 * The close price.
	 */
	close: number;
}

/**
 * Structure describing a single item of data for bar series
 */
export interface BarData extends OhlcData {
	/**
	 * Optional color value for certain data item. If missed, color from options is used
	 */
	color?: string;
}

/**
 * Structure describing a single item of data for candlestick series
 */
export interface CandlestickData extends OhlcData {
	/**
	 * Optional color value for certain data item. If missed, color from options is used
	 */
	color?: string;
	/**
	 * Optional border color value for certain data item. If missed, color from options is used
	 */
	borderColor?: string;
	/**
	 * Optional wick color value for certain data item. If missed, color from options is used
	 */
	wickColor?: string;
}

export function isWhitespaceData(data: SeriesDataItemTypeMap[SeriesType]): data is WhitespaceData {
	return (data as Partial<BarData>).open === undefined && (data as Partial<LineData>).value === undefined;
}

export function isFulfilledData(data: SeriesDataItemTypeMap[SeriesType]): data is (BarData | LineData | HistogramData) {
	return (data as Partial<BarData>).open !== undefined || (data as Partial<LineData>).value !== undefined;
}

/**
 * Represents the type of data that a series contains.
 *
 * For example a bar series contains {@link BarData} or {@link WhitespaceData}.
 */
export interface SeriesDataItemTypeMap {
	/**
	 * The types of bar series data.
	 */
	Bar: BarData | WhitespaceData;
	/**
	 * The types of candlestick series data.
	 */
	Candlestick: CandlestickData | WhitespaceData;
	/**
	 * The types of area series data.
	 */
	Area: SingleValueData | WhitespaceData;
	/**
	 * The types of baseline series data.
	 */
	Baseline: SingleValueData | WhitespaceData;
	/**
	 * The types of line series data.
	 */
	Line: LineData | WhitespaceData;
	/**
	 * The types of histogram series data.
	 */
	Histogram: HistogramData | WhitespaceData;
}

export interface DataUpdatesConsumer<TSeriesType extends SeriesType> {
	applyNewData(series: Series<TSeriesType>, data: SeriesDataItemTypeMap[TSeriesType][]): void;
	updateData(series: Series<TSeriesType>, data: SeriesDataItemTypeMap[TSeriesType]): void;
}
