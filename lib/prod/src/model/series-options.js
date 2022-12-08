export function fillUpDownCandlesticksColors(options) {
    if (options.borderColor !== undefined) {
        options.borderUpColor = options.borderColor;
        options.borderDownColor = options.borderColor;
    }
    if (options.wickColor !== undefined) {
        options.wickUpColor = options.wickColor;
        options.wickDownColor = options.wickColor;
    }
}
/**
 * Represents the type of the last price animation for series such as area or line.
 */
export var LastPriceAnimationMode;
(function (LastPriceAnimationMode) {
    /**
     * Animation is always disabled
     */
    LastPriceAnimationMode[LastPriceAnimationMode["Disabled"] = 0] = "Disabled";
    /**
     * Animation is always enabled.
     */
    LastPriceAnimationMode[LastPriceAnimationMode["Continuous"] = 1] = "Continuous";
    /**
     * Animation is active after new data.
     */
    LastPriceAnimationMode[LastPriceAnimationMode["OnDataUpdate"] = 2] = "OnDataUpdate";
})(LastPriceAnimationMode || (LastPriceAnimationMode = {}));
// we cannot create re-export of const enum because of TypeScript bug https://github.com/microsoft/TypeScript/issues/45850
/** @deprecated It doesn't really matter what we write here, because it doesn't work properly, but just to mark the thing we have to delete in the next major update */
export { LastPriceAnimationMode as LasPriceAnimationMode };
export function precisionByMinMove(minMove) {
    if (minMove >= 1) {
        return 0;
    }
    var i = 0;
    for (; i < 8; i++) {
        var intPart = Math.round(minMove);
        var fractPart = Math.abs(intPart - minMove);
        if (fractPart < 1e-8) {
            return i;
        }
        minMove = minMove * 10;
    }
    return i;
}
;
/**
 * Represents the source of data to be used for the horizontal price line.
 */
export var PriceLineSource;
(function (PriceLineSource) {
    /**
     * Use the last bar data.
     */
    PriceLineSource[PriceLineSource["LastBar"] = 0] = "LastBar";
    /**
     * Use the last visible data of the chart viewport.
     */
    PriceLineSource[PriceLineSource["LastVisible"] = 1] = "LastVisible";
})(PriceLineSource || (PriceLineSource = {}));
