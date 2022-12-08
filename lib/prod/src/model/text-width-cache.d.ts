export declare type CanvasCtxLike = Pick<CanvasRenderingContext2D, 'measureText'>;
export declare class TextWidthCache {
    private _cache;
    /** A "cyclic buffer" of cache keys */
    private _keys;
    /** Current index in the "cyclic buffer" */
    private _keysIndex;
    constructor(size?: number);
    reset(): void;
    measureText(ctx: CanvasCtxLike, text: string, optimizationReplacementRe?: RegExp): number;
}
