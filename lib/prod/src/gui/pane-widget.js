import { ensureNotNull } from '../helpers/assertions';
import { clearRect, clearRectWithGradient, drawScaled } from '../helpers/canvas-helpers';
import { Delegate } from '../helpers/delegate';
import { createBoundCanvas, getContext2D, Size } from './canvas-utils';
import { KineticAnimation } from './kinetic-animation';
import { MouseEventHandler } from './mouse-event-handler';
import { PriceAxisWidget } from './price-axis-widget';
;
function drawBackground(renderer, ctx, pixelRatio, isHovered, hitTestData) {
    if (renderer._internal_drawBackground) {
        renderer._internal_drawBackground(ctx, pixelRatio, isHovered, hitTestData);
    }
}
function drawForeground(renderer, ctx, pixelRatio, isHovered, hitTestData) {
    renderer._internal_draw(ctx, pixelRatio, isHovered, hitTestData);
}
function sourcePaneViews(source, pane) {
    return source._internal_paneViews(pane);
}
function sourceTopPaneViews(source, pane) {
    return source._internal_topPaneViews !== undefined ? source._internal_topPaneViews(pane) : [];
}
var PaneWidget = /** @class */ (function () {
    function PaneWidget(chart, state) {
        var _this = this;
        this._private__size = new Size(0, 0);
        this._private__leftPriceAxisWidget = null;
        this._private__rightPriceAxisWidget = null;
        this._private__startScrollingPos = null;
        this._private__isScrolling = false;
        this._private__clicked = new Delegate();
        this._private__prevPinchScale = 0;
        this._private__longTap = false;
        this._private__startTrackPoint = null;
        this._private__exitTrackingModeOnNextTry = false;
        this._private__initCrosshairPosition = null;
        this._private__scrollXAnimation = null;
        this._private__isSettingSize = false;
        this._private__canvasConfiguredHandler = function () {
            if (_this._private__isSettingSize || _this._private__state === null) {
                return;
            }
            _this._private__model()._internal_lightUpdate();
        };
        this._private__topCanvasConfiguredHandler = function () {
            if (_this._private__isSettingSize || _this._private__state === null) {
                return;
            }
            _this._private__model()._internal_lightUpdate();
        };
        this._private__chart = chart;
        this._private__state = state;
        this._private__state._internal_onDestroyed()._internal_subscribe(this._private__onStateDestroyed.bind(this), this, true);
        this._private__paneCell = document.createElement('td');
        this._private__paneCell.style.padding = '0';
        this._private__paneCell.style.position = 'relative';
        var paneWrapper = document.createElement('div');
        paneWrapper.style.width = '100%';
        paneWrapper.style.height = '100%';
        paneWrapper.style.position = 'relative';
        paneWrapper.style.overflow = 'hidden';
        this._private__leftAxisCell = document.createElement('td');
        this._private__leftAxisCell.style.padding = '0';
        this._private__rightAxisCell = document.createElement('td');
        this._private__rightAxisCell.style.padding = '0';
        this._private__paneCell.appendChild(paneWrapper);
        this._private__canvasBinding = createBoundCanvas(paneWrapper, new Size(16, 16));
        this._private__canvasBinding.subscribeCanvasConfigured(this._private__canvasConfiguredHandler);
        var canvas = this._private__canvasBinding.canvas;
        canvas.style.position = 'absolute';
        canvas.style.zIndex = '1';
        canvas.style.left = '0';
        canvas.style.top = '0';
        this._private__topCanvasBinding = createBoundCanvas(paneWrapper, new Size(16, 16));
        this._private__topCanvasBinding.subscribeCanvasConfigured(this._private__topCanvasConfiguredHandler);
        var topCanvas = this._private__topCanvasBinding.canvas;
        topCanvas.style.position = 'absolute';
        topCanvas.style.zIndex = '2';
        topCanvas.style.left = '0';
        topCanvas.style.top = '0';
        this._private__rowElement = document.createElement('tr');
        this._private__rowElement.appendChild(this._private__leftAxisCell);
        this._private__rowElement.appendChild(this._private__paneCell);
        this._private__rowElement.appendChild(this._private__rightAxisCell);
        this._internal_updatePriceAxisWidgetsStates();
        this._private__mouseEventHandler = new MouseEventHandler(this._private__topCanvasBinding.canvas, this, {
            _internal_treatVertTouchDragAsPageScroll: function () { return _this._private__startTrackPoint === null && !_this._private__chart._internal_options().handleScroll.vertTouchDrag; },
            _internal_treatHorzTouchDragAsPageScroll: function () { return _this._private__startTrackPoint === null && !_this._private__chart._internal_options().handleScroll.horzTouchDrag; },
        });
    }
    PaneWidget.prototype._internal_destroy = function () {
        if (this._private__leftPriceAxisWidget !== null) {
            this._private__leftPriceAxisWidget._internal_destroy();
        }
        if (this._private__rightPriceAxisWidget !== null) {
            this._private__rightPriceAxisWidget._internal_destroy();
        }
        this._private__topCanvasBinding.unsubscribeCanvasConfigured(this._private__topCanvasConfiguredHandler);
        this._private__topCanvasBinding.destroy();
        this._private__canvasBinding.unsubscribeCanvasConfigured(this._private__canvasConfiguredHandler);
        this._private__canvasBinding.destroy();
        if (this._private__state !== null) {
            this._private__state._internal_onDestroyed()._internal_unsubscribeAll(this);
        }
        this._private__mouseEventHandler._internal_destroy();
    };
    PaneWidget.prototype._internal_state = function () {
        return ensureNotNull(this._private__state);
    };
    PaneWidget.prototype._internal_setState = function (pane) {
        if (this._private__state !== null) {
            this._private__state._internal_onDestroyed()._internal_unsubscribeAll(this);
        }
        this._private__state = pane;
        if (this._private__state !== null) {
            this._private__state._internal_onDestroyed()._internal_subscribe(PaneWidget.prototype._private__onStateDestroyed.bind(this), this, true);
        }
        this._internal_updatePriceAxisWidgetsStates();
    };
    PaneWidget.prototype._internal_chart = function () {
        return this._private__chart;
    };
    PaneWidget.prototype._internal_getElement = function () {
        return this._private__rowElement;
    };
    PaneWidget.prototype._internal_updatePriceAxisWidgetsStates = function () {
        if (this._private__state === null) {
            return;
        }
        this._private__recreatePriceAxisWidgets();
        if (this._private__model()._internal_serieses().length === 0) {
            return;
        }
        if (this._private__leftPriceAxisWidget !== null) {
            var leftPriceScale = this._private__state._internal_leftPriceScale();
            this._private__leftPriceAxisWidget._internal_setPriceScale(ensureNotNull(leftPriceScale));
        }
        if (this._private__rightPriceAxisWidget !== null) {
            var rightPriceScale = this._private__state._internal_rightPriceScale();
            this._private__rightPriceAxisWidget._internal_setPriceScale(ensureNotNull(rightPriceScale));
        }
    };
    PaneWidget.prototype._internal_updatePriceAxisWidgets = function () {
        if (this._private__leftPriceAxisWidget !== null) {
            this._private__leftPriceAxisWidget._internal_update();
        }
        if (this._private__rightPriceAxisWidget !== null) {
            this._private__rightPriceAxisWidget._internal_update();
        }
    };
    PaneWidget.prototype._internal_stretchFactor = function () {
        return this._private__state !== null ? this._private__state._internal_stretchFactor() : 0;
    };
    PaneWidget.prototype._internal_setStretchFactor = function (stretchFactor) {
        if (this._private__state) {
            this._private__state._internal_setStretchFactor(stretchFactor);
        }
    };
    PaneWidget.prototype._internal_mouseEnterEvent = function (event) {
        if (!this._private__state) {
            return;
        }
        this._private__onMouseEvent();
        var x = event._internal_localX;
        var y = event._internal_localY;
        this._private__setCrosshairPosition(x, y);
    };
    PaneWidget.prototype._internal_mouseDownEvent = function (event) {
        this._private__onMouseEvent();
        this._private__mouseTouchDownEvent();
        this._private__setCrosshairPosition(event._internal_localX, event._internal_localY);
    };
    PaneWidget.prototype._internal_mouseMoveEvent = function (event) {
        if (!this._private__state) {
            return;
        }
        this._private__onMouseEvent();
        var x = event._internal_localX;
        var y = event._internal_localY;
        this._private__setCrosshairPosition(x, y);
        var hitTest = this._internal_hitTest(x, y);
        this._private__model()._internal_setHoveredSource(hitTest && { _internal_source: hitTest._internal_source, _internal_object: hitTest._internal_object });
    };
    PaneWidget.prototype._internal_mouseClickEvent = function (event) {
        if (this._private__state === null) {
            return;
        }
        this._private__onMouseEvent();
        var x = event._internal_localX;
        var y = event._internal_localY;
        if (this._private__clicked._internal_hasListeners()) {
            var currentTime = this._private__model()._internal_crosshairSource()._internal_appliedIndex();
            this._private__clicked._internal_fire(currentTime, { x: x, y: y });
        }
    };
    PaneWidget.prototype._internal_pressedMouseMoveEvent = function (event) {
        this._private__onMouseEvent();
        this._private__pressedMouseTouchMoveEvent(event);
        this._private__setCrosshairPosition(event._internal_localX, event._internal_localY);
    };
    PaneWidget.prototype._internal_mouseUpEvent = function (event) {
        if (this._private__state === null) {
            return;
        }
        this._private__onMouseEvent();
        this._private__longTap = false;
        this._private__endScroll(event);
    };
    PaneWidget.prototype._internal_longTapEvent = function (event) {
        this._private__longTap = true;
        if (this._private__startTrackPoint === null) {
            var point = { x: event._internal_localX, y: event._internal_localY };
            this._private__startTrackingMode(point, point);
        }
    };
    PaneWidget.prototype._internal_mouseLeaveEvent = function (event) {
        if (this._private__state === null) {
            return;
        }
        this._private__onMouseEvent();
        this._private__state._internal_model()._internal_setHoveredSource(null);
        this._private__clearCrosshairPosition();
    };
    PaneWidget.prototype._internal_clicked = function () {
        return this._private__clicked;
    };
    PaneWidget.prototype._internal_pinchStartEvent = function () {
        this._private__prevPinchScale = 1;
        this._private__terminateKineticAnimation();
    };
    PaneWidget.prototype._internal_pinchEvent = function (middlePoint, scale) {
        if (!this._private__chart._internal_options().handleScale.pinch) {
            return;
        }
        var zoomScale = (scale - this._private__prevPinchScale) * 5;
        this._private__prevPinchScale = scale;
        this._private__model()._internal_zoomTime(middlePoint._internal_x, zoomScale);
    };
    PaneWidget.prototype._internal_touchStartEvent = function (event) {
        this._private__longTap = false;
        this._private__exitTrackingModeOnNextTry = this._private__startTrackPoint !== null;
        this._private__mouseTouchDownEvent();
        if (this._private__startTrackPoint !== null) {
            var crosshair = this._private__model()._internal_crosshairSource();
            this._private__initCrosshairPosition = { x: crosshair._internal_appliedX(), y: crosshair._internal_appliedY() };
            this._private__startTrackPoint = { x: event._internal_localX, y: event._internal_localY };
        }
    };
    PaneWidget.prototype._internal_touchMoveEvent = function (event) {
        if (this._private__state === null) {
            return;
        }
        var x = event._internal_localX;
        var y = event._internal_localY;
        if (this._private__startTrackPoint !== null) {
            // tracking mode: move crosshair
            this._private__exitTrackingModeOnNextTry = false;
            var origPoint = ensureNotNull(this._private__initCrosshairPosition);
            var newX = origPoint.x + (x - this._private__startTrackPoint.x);
            var newY = origPoint.y + (y - this._private__startTrackPoint.y);
            this._private__setCrosshairPosition(newX, newY);
            return;
        }
        this._private__pressedMouseTouchMoveEvent(event);
    };
    PaneWidget.prototype._internal_touchEndEvent = function (event) {
        if (this._internal_chart()._internal_options().trackingMode.exitMode === 0 /* OnTouchEnd */) {
            this._private__exitTrackingModeOnNextTry = true;
        }
        this._private__tryExitTrackingMode();
        this._private__endScroll(event);
    };
    PaneWidget.prototype._internal_hitTest = function (x, y) {
        var state = this._private__state;
        if (state === null) {
            return null;
        }
        var sources = state._internal_orderedSources();
        for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
            var source = sources_1[_i];
            var sourceResult = this._private__hitTestPaneView(source._internal_paneViews(state), x, y);
            if (sourceResult !== null) {
                return {
                    _internal_source: source,
                    _internal_view: sourceResult._internal_view,
                    _internal_object: sourceResult._internal_object,
                };
            }
        }
        return null;
    };
    PaneWidget.prototype._internal_setPriceAxisSize = function (width, position) {
        var priceAxisWidget = position === 'left' ? this._private__leftPriceAxisWidget : this._private__rightPriceAxisWidget;
        ensureNotNull(priceAxisWidget)._internal_setSize(new Size(width, this._private__size._internal_h));
    };
    PaneWidget.prototype._internal_getSize = function () {
        return this._private__size;
    };
    PaneWidget.prototype._internal_setSize = function (size) {
        if (size._internal_w < 0 || size._internal_h < 0) {
            throw new Error('Try to set invalid size to PaneWidget ' + JSON.stringify(size));
        }
        if (this._private__size._internal_equals(size)) {
            return;
        }
        this._private__size = size;
        this._private__isSettingSize = true;
        this._private__canvasBinding.resizeCanvas({ width: size._internal_w, height: size._internal_h });
        this._private__topCanvasBinding.resizeCanvas({ width: size._internal_w, height: size._internal_h });
        this._private__isSettingSize = false;
        this._private__paneCell.style.width = size._internal_w + 'px';
        this._private__paneCell.style.height = size._internal_h + 'px';
    };
    PaneWidget.prototype._internal_recalculatePriceScales = function () {
        var pane = ensureNotNull(this._private__state);
        pane._internal_recalculatePriceScale(pane._internal_leftPriceScale());
        pane._internal_recalculatePriceScale(pane._internal_rightPriceScale());
        for (var _i = 0, _a = pane._internal_dataSources(); _i < _a.length; _i++) {
            var source = _a[_i];
            if (pane._internal_isOverlay(source)) {
                var priceScale = source._internal_priceScale();
                if (priceScale !== null) {
                    pane._internal_recalculatePriceScale(priceScale);
                }
                // for overlay drawings price scale is owner's price scale
                // however owner's price scale could not contain ds
                source._internal_updateAllViews();
            }
        }
    };
    PaneWidget.prototype._internal_getImage = function () {
        return this._private__canvasBinding.canvas;
    };
    PaneWidget.prototype._internal_paint = function (type) {
        if (type === 0 /* None */) {
            return;
        }
        if (this._private__state === null) {
            return;
        }
        if (type > 1 /* Cursor */) {
            this._internal_recalculatePriceScales();
        }
        if (this._private__leftPriceAxisWidget !== null) {
            this._private__leftPriceAxisWidget._internal_paint(type);
        }
        if (this._private__rightPriceAxisWidget !== null) {
            this._private__rightPriceAxisWidget._internal_paint(type);
        }
        if (type !== 1 /* Cursor */) {
            var ctx = getContext2D(this._private__canvasBinding.canvas);
            ctx.save();
            this._private__drawBackground(ctx, this._private__canvasBinding.pixelRatio);
            if (this._private__state) {
                this._private__drawGrid(ctx, this._private__canvasBinding.pixelRatio);
                this._private__drawWatermark(ctx, this._private__canvasBinding.pixelRatio);
                this._private__drawSources(ctx, this._private__canvasBinding.pixelRatio, sourcePaneViews);
            }
            ctx.restore();
        }
        var topCtx = getContext2D(this._private__topCanvasBinding.canvas);
        topCtx.clearRect(0, 0, Math.ceil(this._private__size._internal_w * this._private__topCanvasBinding.pixelRatio), Math.ceil(this._private__size._internal_h * this._private__topCanvasBinding.pixelRatio));
        this._private__drawSources(topCtx, this._private__canvasBinding.pixelRatio, sourceTopPaneViews);
        this._private__drawCrosshair(topCtx, this._private__topCanvasBinding.pixelRatio);
    };
    PaneWidget.prototype._internal_leftPriceAxisWidget = function () {
        return this._private__leftPriceAxisWidget;
    };
    PaneWidget.prototype._internal_rightPriceAxisWidget = function () {
        return this._private__rightPriceAxisWidget;
    };
    PaneWidget.prototype._private__onStateDestroyed = function () {
        if (this._private__state !== null) {
            this._private__state._internal_onDestroyed()._internal_unsubscribeAll(this);
        }
        this._private__state = null;
    };
    PaneWidget.prototype._private__drawBackground = function (ctx, pixelRatio) {
        var _this = this;
        drawScaled(ctx, pixelRatio, function () {
            var model = _this._private__model();
            var topColor = model._internal_backgroundTopColor();
            var bottomColor = model._internal_backgroundBottomColor();
            if (topColor === bottomColor) {
                clearRect(ctx, 0, 0, _this._private__size._internal_w, _this._private__size._internal_h, bottomColor);
            }
            else {
                clearRectWithGradient(ctx, 0, 0, _this._private__size._internal_w, _this._private__size._internal_h, topColor, bottomColor);
            }
        });
    };
    PaneWidget.prototype._private__drawGrid = function (ctx, pixelRatio) {
        var state = ensureNotNull(this._private__state);
        var paneView = state._internal_grid()._internal_paneView();
        var renderer = paneView._internal_renderer(state._internal_height(), state._internal_width());
        if (renderer !== null) {
            ctx.save();
            renderer._internal_draw(ctx, pixelRatio, false);
            ctx.restore();
        }
    };
    PaneWidget.prototype._private__drawWatermark = function (ctx, pixelRatio) {
        var source = this._private__model()._internal_watermarkSource();
        this._private__drawSourceImpl(ctx, pixelRatio, sourcePaneViews, drawBackground, source);
        this._private__drawSourceImpl(ctx, pixelRatio, sourcePaneViews, drawForeground, source);
    };
    PaneWidget.prototype._private__drawCrosshair = function (ctx, pixelRatio) {
        this._private__drawSourceImpl(ctx, pixelRatio, sourcePaneViews, drawForeground, this._private__model()._internal_crosshairSource());
    };
    PaneWidget.prototype._private__drawSources = function (ctx, pixelRatio, paneViewsGetter) {
        var state = ensureNotNull(this._private__state);
        var sources = state._internal_orderedSources();
        for (var _i = 0, sources_2 = sources; _i < sources_2.length; _i++) {
            var source = sources_2[_i];
            this._private__drawSourceImpl(ctx, pixelRatio, paneViewsGetter, drawBackground, source);
        }
        for (var _a = 0, sources_3 = sources; _a < sources_3.length; _a++) {
            var source = sources_3[_a];
            this._private__drawSourceImpl(ctx, pixelRatio, paneViewsGetter, drawForeground, source);
        }
    };
    PaneWidget.prototype._private__drawSourceImpl = function (ctx, pixelRatio, paneViewsGetter, drawFn, source) {
        var state = ensureNotNull(this._private__state);
        var paneViews = paneViewsGetter(source, state);
        var height = state._internal_height();
        var width = state._internal_width();
        var hoveredSource = state._internal_model()._internal_hoveredSource();
        var isHovered = hoveredSource !== null && hoveredSource._internal_source === source;
        var objecId = hoveredSource !== null && isHovered && hoveredSource._internal_object !== undefined
            ? hoveredSource._internal_object._internal_hitTestData
            : undefined;
        for (var _i = 0, paneViews_1 = paneViews; _i < paneViews_1.length; _i++) {
            var paneView = paneViews_1[_i];
            var renderer = paneView._internal_renderer(height, width);
            if (renderer !== null) {
                ctx.save();
                drawFn(renderer, ctx, pixelRatio, isHovered, objecId);
                ctx.restore();
            }
        }
    };
    PaneWidget.prototype._private__hitTestPaneView = function (paneViews, x, y) {
        for (var _i = 0, paneViews_2 = paneViews; _i < paneViews_2.length; _i++) {
            var paneView = paneViews_2[_i];
            var renderer = paneView._internal_renderer(this._private__size._internal_h, this._private__size._internal_w);
            if (renderer !== null && renderer._internal_hitTest) {
                var result = renderer._internal_hitTest(x, y);
                if (result !== null) {
                    return {
                        _internal_view: paneView,
                        _internal_object: result,
                    };
                }
            }
        }
        return null;
    };
    PaneWidget.prototype._private__recreatePriceAxisWidgets = function () {
        if (this._private__state === null) {
            return;
        }
        var chart = this._private__chart;
        var leftAxisVisible = this._private__state._internal_leftPriceScale()._internal_options().visible;
        var rightAxisVisible = this._private__state._internal_rightPriceScale()._internal_options().visible;
        if (!leftAxisVisible && this._private__leftPriceAxisWidget !== null) {
            this._private__leftAxisCell.removeChild(this._private__leftPriceAxisWidget._internal_getElement());
            this._private__leftPriceAxisWidget._internal_destroy();
            this._private__leftPriceAxisWidget = null;
        }
        if (!rightAxisVisible && this._private__rightPriceAxisWidget !== null) {
            this._private__rightAxisCell.removeChild(this._private__rightPriceAxisWidget._internal_getElement());
            this._private__rightPriceAxisWidget._internal_destroy();
            this._private__rightPriceAxisWidget = null;
        }
        var rendererOptionsProvider = chart._internal_model()._internal_rendererOptionsProvider();
        if (leftAxisVisible && this._private__leftPriceAxisWidget === null) {
            this._private__leftPriceAxisWidget = new PriceAxisWidget(this, chart._internal_options().layout, rendererOptionsProvider, 'left');
            this._private__leftAxisCell.appendChild(this._private__leftPriceAxisWidget._internal_getElement());
        }
        if (rightAxisVisible && this._private__rightPriceAxisWidget === null) {
            this._private__rightPriceAxisWidget = new PriceAxisWidget(this, chart._internal_options().layout, rendererOptionsProvider, 'right');
            this._private__rightAxisCell.appendChild(this._private__rightPriceAxisWidget._internal_getElement());
        }
    };
    PaneWidget.prototype._private__preventScroll = function (event) {
        return event._internal_isTouch && this._private__longTap || this._private__startTrackPoint !== null;
    };
    PaneWidget.prototype._private__correctXCoord = function (x) {
        return Math.max(0, Math.min(x, this._private__size._internal_w - 1));
    };
    PaneWidget.prototype._private__correctYCoord = function (y) {
        return Math.max(0, Math.min(y, this._private__size._internal_h - 1));
    };
    PaneWidget.prototype._private__setCrosshairPosition = function (x, y) {
        this._private__model()._internal_setAndSaveCurrentPosition(this._private__correctXCoord(x), this._private__correctYCoord(y), ensureNotNull(this._private__state));
    };
    PaneWidget.prototype._private__clearCrosshairPosition = function () {
        this._private__model()._internal_clearCurrentPosition();
    };
    PaneWidget.prototype._private__tryExitTrackingMode = function () {
        if (this._private__exitTrackingModeOnNextTry) {
            this._private__startTrackPoint = null;
            this._private__clearCrosshairPosition();
        }
    };
    PaneWidget.prototype._private__startTrackingMode = function (startTrackPoint, crossHairPosition) {
        this._private__startTrackPoint = startTrackPoint;
        this._private__exitTrackingModeOnNextTry = false;
        this._private__setCrosshairPosition(crossHairPosition.x, crossHairPosition.y);
        var crosshair = this._private__model()._internal_crosshairSource();
        this._private__initCrosshairPosition = { x: crosshair._internal_appliedX(), y: crosshair._internal_appliedY() };
    };
    PaneWidget.prototype._private__model = function () {
        return this._private__chart._internal_model();
    };
    PaneWidget.prototype._private__finishScroll = function () {
        var model = this._private__model();
        var state = this._internal_state();
        var priceScale = state._internal_defaultPriceScale();
        model._internal_endScrollPrice(state, priceScale);
        model._internal_endScrollTime();
        this._private__startScrollingPos = null;
        this._private__isScrolling = false;
    };
    PaneWidget.prototype._private__endScroll = function (event) {
        var _this = this;
        if (!this._private__isScrolling) {
            return;
        }
        var startAnimationTime = performance.now();
        if (this._private__scrollXAnimation !== null) {
            this._private__scrollXAnimation._internal_start(event._internal_localX, startAnimationTime);
        }
        if ((this._private__scrollXAnimation === null || this._private__scrollXAnimation._internal_finished(startAnimationTime))) {
            // animation is not needed
            this._private__finishScroll();
            return;
        }
        var model = this._private__model();
        var timeScale = model._internal_timeScale();
        var scrollXAnimation = this._private__scrollXAnimation;
        var animationFn = function () {
            if ((scrollXAnimation._internal_terminated())) {
                // animation terminated, see _terminateKineticAnimation
                return;
            }
            var now = performance.now();
            var xAnimationFinished = scrollXAnimation._internal_finished(now);
            if (!scrollXAnimation._internal_terminated()) {
                var prevRightOffset = timeScale._internal_rightOffset();
                model._internal_scrollTimeTo(scrollXAnimation._internal_getPosition(now));
                if (prevRightOffset === timeScale._internal_rightOffset()) {
                    xAnimationFinished = true;
                    _this._private__scrollXAnimation = null;
                }
            }
            if (xAnimationFinished) {
                _this._private__finishScroll();
                return;
            }
            requestAnimationFrame(animationFn);
        };
        requestAnimationFrame(animationFn);
    };
    PaneWidget.prototype._private__onMouseEvent = function () {
        this._private__startTrackPoint = null;
    };
    PaneWidget.prototype._private__mouseTouchDownEvent = function () {
        if (!this._private__state) {
            return;
        }
        this._private__terminateKineticAnimation();
        if (document.activeElement !== document.body && document.activeElement !== document.documentElement) {
            // If any focusable element except the page itself is focused, remove the focus
            ensureNotNull(document.activeElement).blur();
        }
        else {
            // Clear selection
            var selection = document.getSelection();
            if (selection !== null) {
                selection.removeAllRanges();
            }
        }
        var priceScale = this._private__state._internal_defaultPriceScale();
        if (priceScale._internal_isEmpty() || this._private__model()._internal_timeScale()._internal_isEmpty()) {
            return;
        }
    };
    // eslint-disable-next-line complexity
    PaneWidget.prototype._private__pressedMouseTouchMoveEvent = function (event) {
        if (this._private__state === null) {
            return;
        }
        var model = this._private__model();
        if (model._internal_timeScale()._internal_isEmpty()) {
            return;
        }
        var chartOptions = this._private__chart._internal_options();
        var scrollOptions = chartOptions.handleScroll;
        var kineticScrollOptions = chartOptions.kineticScroll;
        if ((!scrollOptions.pressedMouseMove || event._internal_isTouch) &&
            (!scrollOptions.horzTouchDrag && !scrollOptions.vertTouchDrag || !event._internal_isTouch)) {
            return;
        }
        var priceScale = this._private__state._internal_defaultPriceScale();
        var now = performance.now();
        if (this._private__startScrollingPos === null && !this._private__preventScroll(event)) {
            this._private__startScrollingPos = {
                x: event._internal_clientX,
                y: event._internal_clientY,
                _internal_timestamp: now,
                _internal_localX: event._internal_localX,
                _internal_localY: event._internal_localY,
            };
        }
        if (this._private__scrollXAnimation !== null) {
            this._private__scrollXAnimation._internal_addPosition(event._internal_localX, now);
        }
        if (this._private__startScrollingPos !== null &&
            !this._private__isScrolling &&
            (this._private__startScrollingPos.x !== event._internal_clientX || this._private__startScrollingPos.y !== event._internal_clientY)) {
            if (this._private__scrollXAnimation === null && (event._internal_isTouch && kineticScrollOptions.touch ||
                !event._internal_isTouch && kineticScrollOptions.mouse)) {
                this._private__scrollXAnimation = new KineticAnimation(0.2 /* MinScrollSpeed */, 7 /* MaxScrollSpeed */, 0.997 /* DumpingCoeff */, 15 /* ScrollMinMove */);
                this._private__scrollXAnimation._internal_addPosition(this._private__startScrollingPos._internal_localX, this._private__startScrollingPos._internal_timestamp);
                this._private__scrollXAnimation._internal_addPosition(event._internal_localX, now);
            }
            if (!priceScale._internal_isEmpty()) {
                model._internal_startScrollPrice(this._private__state, priceScale, event._internal_localY);
            }
            model._internal_startScrollTime(event._internal_localX);
            this._private__isScrolling = true;
        }
        if (this._private__isScrolling) {
            // this allows scrolling not default price scales
            if (!priceScale._internal_isEmpty()) {
                model._internal_scrollPriceTo(this._private__state, priceScale, event._internal_localY);
            }
            model._internal_scrollTimeTo(event._internal_localX);
        }
    };
    PaneWidget.prototype._private__terminateKineticAnimation = function () {
        var now = performance.now();
        var xAnimationFinished = this._private__scrollXAnimation === null || this._private__scrollXAnimation._internal_finished(now);
        if (this._private__scrollXAnimation !== null) {
            if (!xAnimationFinished) {
                this._private__finishScroll();
            }
        }
        if (this._private__scrollXAnimation !== null) {
            this._private__scrollXAnimation._internal_terminate();
            this._private__scrollXAnimation = null;
        }
    };
    return PaneWidget;
}());
export { PaneWidget };
