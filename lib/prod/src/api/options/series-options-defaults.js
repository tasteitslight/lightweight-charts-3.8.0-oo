export var candlestickStyleDefaults = {
    upColor: '#26a69a',
    downColor: '#ef5350',
    wickVisible: true,
    borderVisible: true,
    borderColor: '#378658',
    borderUpColor: '#26a69a',
    borderDownColor: '#ef5350',
    wickColor: '#737375',
    wickUpColor: '#26a69a',
    wickDownColor: '#ef5350',
};
export var barStyleDefaults = {
    upColor: '#26a69a',
    downColor: '#ef5350',
    openVisible: true,
    thinBars: true,
};
export var lineStyleDefaults = {
    color: '#2196f3',
    lineStyle: 0 /* Solid */,
    lineWidth: 3,
    lineType: 0 /* Simple */,
    crosshairMarkerVisible: true,
    crosshairMarkerRadius: 4,
    crosshairMarkerBorderColor: '',
    crosshairMarkerBackgroundColor: '',
    lastPriceAnimation: 0 /* Disabled */,
};
export var areaStyleDefaults = {
    topColor: 'rgba( 46, 220, 135, 0.4)',
    bottomColor: 'rgba( 40, 221, 100, 0)',
    lineColor: '#33D778',
    lineStyle: 0 /* Solid */,
    lineWidth: 3,
    lineType: 0 /* Simple */,
    crosshairMarkerVisible: true,
    crosshairMarkerRadius: 4,
    crosshairMarkerBorderColor: '',
    crosshairMarkerBackgroundColor: '',
    lastPriceAnimation: 0 /* Disabled */,
};
export var baselineStyleDefaults = {
    baseValue: {
        type: 'price',
        price: 0,
    },
    topFillColor1: 'rgba(38, 166, 154, 0.28)',
    topFillColor2: 'rgba(38, 166, 154, 0.05)',
    topLineColor: 'rgba(38, 166, 154, 1)',
    bottomFillColor1: 'rgba(239, 83, 80, 0.05)',
    bottomFillColor2: 'rgba(239, 83, 80, 0.28)',
    bottomLineColor: 'rgba(239, 83, 80, 1)',
    lineWidth: 3,
    lineStyle: 0 /* Solid */,
    crosshairMarkerVisible: true,
    crosshairMarkerRadius: 4,
    crosshairMarkerBorderColor: '',
    crosshairMarkerBackgroundColor: '',
    lastPriceAnimation: 0 /* Disabled */,
};
export var histogramStyleDefaults = {
    color: '#26a69a',
    base: 0,
};
export var seriesOptionsDefaults = {
    title: '',
    visible: true,
    lastValueVisible: true,
    priceLineVisible: true,
    priceLineSource: 0 /* LastBar */,
    priceLineWidth: 1,
    priceLineColor: '',
    priceLineStyle: 2 /* Dashed */,
    baseLineVisible: true,
    baseLineWidth: 1,
    baseLineColor: '#B2B5BE',
    baseLineStyle: 0 /* Solid */,
    priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
    },
};
