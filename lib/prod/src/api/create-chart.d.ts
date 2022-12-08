import { DeepPartial } from '../helpers/strict-type-checks';
import { ChartOptions } from '../model/chart-model';
import { IChartApi } from './ichart-api';
/**
 * This function is the main entry point of the Lightweight Charting Library.
 *
 * @param container - ID of HTML element or element itself
 * @param options - Any subset of options to be applied at start.
 * @returns An interface to the created chart
 */
export declare function createChart(container: string | HTMLElement, options?: DeepPartial<ChartOptions>): IChartApi;
