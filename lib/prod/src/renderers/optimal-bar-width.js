export function optimalBarWidth(barSpacing, pixelRatio) {
    return Math.floor(barSpacing * 0.3 * pixelRatio);
}
export function optimalCandlestickWidth(barSpacing, pixelRatio) {
    var barSpacingSpecialCaseFrom = 2.5;
    var barSpacingSpecialCaseTo = 4;
    var barSpacingSpecialCaseCoeff = 3;
    if (barSpacing >= barSpacingSpecialCaseFrom && barSpacing <= barSpacingSpecialCaseTo) {
        return Math.floor(barSpacingSpecialCaseCoeff * pixelRatio);
    }
    // coeff should be 1 on small barspacing and go to 0.8 while groing bar spacing
    var barSpacingReducingCoeff = 0.2;
    var coeff = 1 - barSpacingReducingCoeff * Math.atan(Math.max(barSpacingSpecialCaseTo, barSpacing) - barSpacingSpecialCaseTo) / (Math.PI * 0.5);
    var res = Math.floor(barSpacing * coeff * pixelRatio);
    var scaledBarSpacing = Math.floor(barSpacing * pixelRatio);
    var optimal = Math.min(res, scaledBarSpacing);
    return Math.max(Math.floor(pixelRatio), optimal);
}
