import { ensureNotNull } from '../helpers/assertions';
import { isFF, isIOS } from '../helpers/browsers';
import { preventScrollByWheelClick } from '../helpers/events';
;
;
// TODO: get rid of a lot of boolean flags, probably we should replace it with some enum
var MouseEventHandler = /** @class */ (function () {
    function MouseEventHandler(target, handler, options) {
        var _this = this;
        this._private__clickCount = 0;
        this._private__clickTimeoutId = null;
        this._private__clickPosition = { _internal_x: Number.NEGATIVE_INFINITY, _internal_y: Number.POSITIVE_INFINITY };
        this._private__tapCount = 0;
        this._private__tapTimeoutId = null;
        this._private__tapPosition = { _internal_x: Number.NEGATIVE_INFINITY, _internal_y: Number.POSITIVE_INFINITY };
        this._private__longTapTimeoutId = null;
        this._private__longTapActive = false;
        this._private__mouseMoveStartPosition = null;
        this._private__touchMoveStartPosition = null;
        this._private__touchMoveExceededManhattanDistance = false;
        this._private__cancelClick = false;
        this._private__cancelTap = false;
        this._private__unsubscribeOutsideMouseEvents = null;
        this._private__unsubscribeOutsideTouchEvents = null;
        this._private__unsubscribeMobileSafariEvents = null;
        this._private__unsubscribeMousemove = null;
        this._private__unsubscribeRootMouseEvents = null;
        this._private__unsubscribeRootTouchEvents = null;
        this._private__startPinchMiddlePoint = null;
        this._private__startPinchDistance = 0;
        this._private__pinchPrevented = false;
        this._private__preventTouchDragProcess = false;
        this._private__mousePressed = false;
        this._private__lastTouchEventTimeStamp = 0;
        // for touchstart/touchmove/touchend events we handle only first touch
        // i.e. we don't support several active touches at the same time (except pinch event)
        this._private__activeTouchId = null;
        // accept all mouse leave events if it's not an iOS device
        // see _mouseEnterHandler, _mouseMoveHandler, _mouseLeaveHandler
        this._private__acceptMouseLeave = !isIOS();
        /**
         * In Firefox mouse events dont't fire if the mouse position is outside of the browser's border.
         * To prevent the mouse from hanging while pressed we're subscribing on the mouseleave event of the document element.
         * We're subscribing on mouseleave, but this event is actually fired on mouseup outside of the browser's border.
         */
        this._private__onFirefoxOutsideMouseUp = function (mouseUpEvent) {
            _this._private__mouseUpHandler(mouseUpEvent);
        };
        /**
         * Safari doesn't fire touchstart/mousedown events on double tap since iOS 13.
         * There are two possible solutions:
         * 1) Call preventDefault in touchEnd handler. But it also prevents click event from firing.
         * 2) Add listener on dblclick event that fires with the preceding mousedown/mouseup.
         * https://developer.apple.com/forums/thread/125073
         */
        this._private__onMobileSafariDoubleClick = function (dblClickEvent) {
            if (_this._private__firesTouchEvents(dblClickEvent)) {
                var compatEvent = _this._private__makeCompatEvent(dblClickEvent);
                ++_this._private__tapCount;
                if (_this._private__tapTimeoutId && _this._private__tapCount > 1) {
                    var manhattanDistance = _this._private__touchMouseMoveWithDownInfo(getPosition(dblClickEvent), _this._private__tapPosition)._internal_manhattanDistance;
                    if (manhattanDistance < 30 /* DoubleTapManhattanDistance */ && !_this._private__cancelTap) {
                        _this._private__processTouchEvent(compatEvent, _this._private__handler._internal_doubleTapEvent);
                    }
                    _this._private__resetTapTimeout();
                }
            }
            else {
                var compatEvent = _this._private__makeCompatEvent(dblClickEvent);
                ++_this._private__clickCount;
                if (_this._private__clickTimeoutId && _this._private__clickCount > 1) {
                    var manhattanDistance = _this._private__touchMouseMoveWithDownInfo(getPosition(dblClickEvent), _this._private__clickPosition)._internal_manhattanDistance;
                    if (manhattanDistance < 5 /* DoubleClickManhattanDistance */ && !_this._private__cancelClick) {
                        _this._private__processMouseEvent(compatEvent, _this._private__handler._internal_mouseDoubleClickEvent);
                    }
                    _this._private__resetClickTimeout();
                }
            }
        };
        this._private__target = target;
        this._private__handler = handler;
        this._private__options = options;
        this._private__init();
    }
    MouseEventHandler.prototype._internal_destroy = function () {
        if (this._private__unsubscribeOutsideMouseEvents !== null) {
            this._private__unsubscribeOutsideMouseEvents();
            this._private__unsubscribeOutsideMouseEvents = null;
        }
        if (this._private__unsubscribeOutsideTouchEvents !== null) {
            this._private__unsubscribeOutsideTouchEvents();
            this._private__unsubscribeOutsideTouchEvents = null;
        }
        if (this._private__unsubscribeMousemove !== null) {
            this._private__unsubscribeMousemove();
            this._private__unsubscribeMousemove = null;
        }
        if (this._private__unsubscribeRootMouseEvents !== null) {
            this._private__unsubscribeRootMouseEvents();
            this._private__unsubscribeRootMouseEvents = null;
        }
        if (this._private__unsubscribeRootTouchEvents !== null) {
            this._private__unsubscribeRootTouchEvents();
            this._private__unsubscribeRootTouchEvents = null;
        }
        if (this._private__unsubscribeMobileSafariEvents !== null) {
            this._private__unsubscribeMobileSafariEvents();
            this._private__unsubscribeMobileSafariEvents = null;
        }
        this._private__clearLongTapTimeout();
        this._private__resetClickTimeout();
    };
    MouseEventHandler.prototype._private__mouseEnterHandler = function (enterEvent) {
        var _this = this;
        if (this._private__unsubscribeMousemove) {
            this._private__unsubscribeMousemove();
        }
        var boundMouseMoveHandler = this._private__mouseMoveHandler.bind(this);
        this._private__unsubscribeMousemove = function () {
            _this._private__target.removeEventListener('mousemove', boundMouseMoveHandler);
        };
        this._private__target.addEventListener('mousemove', boundMouseMoveHandler);
        if (this._private__firesTouchEvents(enterEvent)) {
            return;
        }
        var compatEvent = this._private__makeCompatEvent(enterEvent);
        this._private__processMouseEvent(compatEvent, this._private__handler._internal_mouseEnterEvent);
        this._private__acceptMouseLeave = true;
    };
    MouseEventHandler.prototype._private__resetClickTimeout = function () {
        if (this._private__clickTimeoutId !== null) {
            clearTimeout(this._private__clickTimeoutId);
        }
        this._private__clickCount = 0;
        this._private__clickTimeoutId = null;
        this._private__clickPosition = { _internal_x: Number.NEGATIVE_INFINITY, _internal_y: Number.POSITIVE_INFINITY };
    };
    MouseEventHandler.prototype._private__resetTapTimeout = function () {
        if (this._private__tapTimeoutId !== null) {
            clearTimeout(this._private__tapTimeoutId);
        }
        this._private__tapCount = 0;
        this._private__tapTimeoutId = null;
        this._private__tapPosition = { _internal_x: Number.NEGATIVE_INFINITY, _internal_y: Number.POSITIVE_INFINITY };
    };
    MouseEventHandler.prototype._private__mouseMoveHandler = function (moveEvent) {
        if (this._private__mousePressed || this._private__touchMoveStartPosition !== null) {
            return;
        }
        if (this._private__firesTouchEvents(moveEvent)) {
            return;
        }
        var compatEvent = this._private__makeCompatEvent(moveEvent);
        this._private__processMouseEvent(compatEvent, this._private__handler._internal_mouseMoveEvent);
        this._private__acceptMouseLeave = true;
    };
    MouseEventHandler.prototype._private__touchMoveHandler = function (moveEvent) {
        var touch = touchWithId(moveEvent.changedTouches, ensureNotNull(this._private__activeTouchId));
        if (touch === null) {
            return;
        }
        this._private__lastTouchEventTimeStamp = eventTimeStamp(moveEvent);
        if (this._private__startPinchMiddlePoint !== null) {
            return;
        }
        if (this._private__preventTouchDragProcess) {
            return;
        }
        // prevent pinch if move event comes faster than the second touch
        this._private__pinchPrevented = true;
        var moveInfo = this._private__touchMouseMoveWithDownInfo(getPosition(touch), ensureNotNull(this._private__touchMoveStartPosition));
        var xOffset = moveInfo._internal_xOffset, yOffset = moveInfo._internal_yOffset, manhattanDistance = moveInfo._internal_manhattanDistance;
        if (!this._private__touchMoveExceededManhattanDistance && manhattanDistance < 5 /* CancelTapManhattanDistance */) {
            return;
        }
        if (!this._private__touchMoveExceededManhattanDistance) {
            // first time when current position exceeded manhattan distance
            // vertical drag is more important than horizontal drag
            // because we scroll the page vertically often than horizontally
            var correctedXOffset = xOffset * 0.5;
            // a drag can be only if touch page scroll isn't allowed
            var isVertDrag = yOffset >= correctedXOffset && !this._private__options._internal_treatVertTouchDragAsPageScroll();
            var isHorzDrag = correctedXOffset > yOffset && !this._private__options._internal_treatHorzTouchDragAsPageScroll();
            // if drag event happened then we should revert preventDefault state to original one
            // and try to process the drag event
            // else we shouldn't prevent default of the event and ignore processing the drag event
            if (!isVertDrag && !isHorzDrag) {
                this._private__preventTouchDragProcess = true;
            }
            this._private__touchMoveExceededManhattanDistance = true;
            // if manhattan distance is more that 5 - we should cancel tap event
            this._private__cancelTap = true;
            this._private__clearLongTapTimeout();
            this._private__resetTapTimeout();
        }
        if (!this._private__preventTouchDragProcess) {
            var compatEvent = this._private__makeCompatEvent(moveEvent, touch);
            this._private__processTouchEvent(compatEvent, this._private__handler._internal_touchMoveEvent);
            // we should prevent default in case of touch only
            // to prevent scroll of the page
            preventDefault(moveEvent);
        }
    };
    MouseEventHandler.prototype._private__mouseMoveWithDownHandler = function (moveEvent) {
        if (moveEvent.button !== 0 /* Left */) {
            return;
        }
        var moveInfo = this._private__touchMouseMoveWithDownInfo(getPosition(moveEvent), ensureNotNull(this._private__mouseMoveStartPosition));
        var manhattanDistance = moveInfo._internal_manhattanDistance;
        if (manhattanDistance >= 5 /* CancelClickManhattanDistance */) {
            // if manhattan distance is more that 5 - we should cancel click event
            this._private__cancelClick = true;
            this._private__resetClickTimeout();
        }
        if (this._private__cancelClick) {
            // if this._cancelClick is true, that means that minimum manhattan distance is already exceeded
            var compatEvent = this._private__makeCompatEvent(moveEvent);
            this._private__processMouseEvent(compatEvent, this._private__handler._internal_pressedMouseMoveEvent);
        }
    };
    MouseEventHandler.prototype._private__touchMouseMoveWithDownInfo = function (currentPosition, startPosition) {
        var xOffset = Math.abs(startPosition._internal_x - currentPosition._internal_x);
        var yOffset = Math.abs(startPosition._internal_y - currentPosition._internal_y);
        var manhattanDistance = xOffset + yOffset;
        return {
            _internal_xOffset: xOffset,
            _internal_yOffset: yOffset,
            _internal_manhattanDistance: manhattanDistance,
        };
    };
    // eslint-disable-next-line complexity
    MouseEventHandler.prototype._private__touchEndHandler = function (touchEndEvent) {
        var touch = touchWithId(touchEndEvent.changedTouches, ensureNotNull(this._private__activeTouchId));
        if (touch === null && touchEndEvent.touches.length === 0) {
            // something went wrong, somehow we missed the required touchend event
            // probably the browser has not sent this event
            touch = touchEndEvent.changedTouches[0];
        }
        if (touch === null) {
            return;
        }
        this._private__activeTouchId = null;
        this._private__lastTouchEventTimeStamp = eventTimeStamp(touchEndEvent);
        this._private__clearLongTapTimeout();
        this._private__touchMoveStartPosition = null;
        if (this._private__unsubscribeRootTouchEvents) {
            this._private__unsubscribeRootTouchEvents();
            this._private__unsubscribeRootTouchEvents = null;
        }
        var compatEvent = this._private__makeCompatEvent(touchEndEvent, touch);
        this._private__processTouchEvent(compatEvent, this._private__handler._internal_touchEndEvent);
        ++this._private__tapCount;
        if (this._private__tapTimeoutId && this._private__tapCount > 1) {
            // check that both clicks are near enough
            var manhattanDistance = this._private__touchMouseMoveWithDownInfo(getPosition(touch), this._private__tapPosition)._internal_manhattanDistance;
            if (manhattanDistance < 30 /* DoubleTapManhattanDistance */ && !this._private__cancelTap) {
                this._private__processTouchEvent(compatEvent, this._private__handler._internal_doubleTapEvent);
            }
            this._private__resetTapTimeout();
        }
        else {
            if (!this._private__cancelTap) {
                this._private__processTouchEvent(compatEvent, this._private__handler._internal_tapEvent);
                // do not fire mouse events if tap handler was executed
                // prevent click event on new dom element (who appeared after tap)
                if (this._private__handler._internal_tapEvent) {
                    preventDefault(touchEndEvent);
                }
            }
        }
        // prevent, for example, safari's dblclick-to-zoom or fast-click after long-tap
        // we handle mouseDoubleClickEvent here ourselves
        if (this._private__tapCount === 0) {
            preventDefault(touchEndEvent);
        }
        if (touchEndEvent.touches.length === 0) {
            if (this._private__longTapActive) {
                this._private__longTapActive = false;
                // prevent native click event
                preventDefault(touchEndEvent);
            }
        }
    };
    MouseEventHandler.prototype._private__mouseUpHandler = function (mouseUpEvent) {
        if (mouseUpEvent.button !== 0 /* Left */) {
            return;
        }
        var compatEvent = this._private__makeCompatEvent(mouseUpEvent);
        this._private__mouseMoveStartPosition = null;
        this._private__mousePressed = false;
        if (this._private__unsubscribeRootMouseEvents) {
            this._private__unsubscribeRootMouseEvents();
            this._private__unsubscribeRootMouseEvents = null;
        }
        if (isFF()) {
            var rootElement = this._private__target.ownerDocument.documentElement;
            rootElement.removeEventListener('mouseleave', this._private__onFirefoxOutsideMouseUp);
        }
        if (this._private__firesTouchEvents(mouseUpEvent)) {
            return;
        }
        this._private__processMouseEvent(compatEvent, this._private__handler._internal_mouseUpEvent);
        ++this._private__clickCount;
        if (this._private__clickTimeoutId && this._private__clickCount > 1) {
            // check that both clicks are near enough
            var manhattanDistance = this._private__touchMouseMoveWithDownInfo(getPosition(mouseUpEvent), this._private__clickPosition)._internal_manhattanDistance;
            if (manhattanDistance < 5 /* DoubleClickManhattanDistance */ && !this._private__cancelClick) {
                this._private__processMouseEvent(compatEvent, this._private__handler._internal_mouseDoubleClickEvent);
            }
            this._private__resetClickTimeout();
        }
        else {
            if (!this._private__cancelClick) {
                this._private__processMouseEvent(compatEvent, this._private__handler._internal_mouseClickEvent);
            }
        }
    };
    MouseEventHandler.prototype._private__clearLongTapTimeout = function () {
        if (this._private__longTapTimeoutId === null) {
            return;
        }
        clearTimeout(this._private__longTapTimeoutId);
        this._private__longTapTimeoutId = null;
    };
    MouseEventHandler.prototype._private__touchStartHandler = function (downEvent) {
        if (this._private__activeTouchId !== null) {
            return;
        }
        var touch = downEvent.changedTouches[0];
        this._private__activeTouchId = touch.identifier;
        this._private__lastTouchEventTimeStamp = eventTimeStamp(downEvent);
        var rootElement = this._private__target.ownerDocument.documentElement;
        this._private__cancelTap = false;
        this._private__touchMoveExceededManhattanDistance = false;
        this._private__preventTouchDragProcess = false;
        this._private__touchMoveStartPosition = getPosition(touch);
        if (this._private__unsubscribeRootTouchEvents) {
            this._private__unsubscribeRootTouchEvents();
            this._private__unsubscribeRootTouchEvents = null;
        }
        {
            var boundTouchMoveWithDownHandler_1 = this._private__touchMoveHandler.bind(this);
            var boundTouchEndHandler_1 = this._private__touchEndHandler.bind(this);
            this._private__unsubscribeRootTouchEvents = function () {
                rootElement.removeEventListener('touchmove', boundTouchMoveWithDownHandler_1);
                rootElement.removeEventListener('touchend', boundTouchEndHandler_1);
            };
            rootElement.addEventListener('touchmove', boundTouchMoveWithDownHandler_1, { passive: false });
            rootElement.addEventListener('touchend', boundTouchEndHandler_1, { passive: false });
            this._private__clearLongTapTimeout();
            this._private__longTapTimeoutId = setTimeout(this._private__longTapHandler.bind(this, downEvent), 240 /* LongTap */);
        }
        var compatEvent = this._private__makeCompatEvent(downEvent, touch);
        this._private__processTouchEvent(compatEvent, this._private__handler._internal_touchStartEvent);
        if (!this._private__tapTimeoutId) {
            this._private__tapCount = 0;
            this._private__tapTimeoutId = setTimeout(this._private__resetTapTimeout.bind(this), 500 /* ResetClick */);
            this._private__tapPosition = getPosition(touch);
        }
    };
    MouseEventHandler.prototype._private__mouseDownHandler = function (downEvent) {
        if (downEvent.button !== 0 /* Left */) {
            return;
        }
        var rootElement = this._private__target.ownerDocument.documentElement;
        if (isFF()) {
            rootElement.addEventListener('mouseleave', this._private__onFirefoxOutsideMouseUp);
        }
        this._private__cancelClick = false;
        this._private__mouseMoveStartPosition = getPosition(downEvent);
        if (this._private__unsubscribeRootMouseEvents) {
            this._private__unsubscribeRootMouseEvents();
            this._private__unsubscribeRootMouseEvents = null;
        }
        {
            var boundMouseMoveWithDownHandler_1 = this._private__mouseMoveWithDownHandler.bind(this);
            var boundMouseUpHandler_1 = this._private__mouseUpHandler.bind(this);
            this._private__unsubscribeRootMouseEvents = function () {
                rootElement.removeEventListener('mousemove', boundMouseMoveWithDownHandler_1);
                rootElement.removeEventListener('mouseup', boundMouseUpHandler_1);
            };
            rootElement.addEventListener('mousemove', boundMouseMoveWithDownHandler_1);
            rootElement.addEventListener('mouseup', boundMouseUpHandler_1);
        }
        this._private__mousePressed = true;
        if (this._private__firesTouchEvents(downEvent)) {
            return;
        }
        var compatEvent = this._private__makeCompatEvent(downEvent);
        this._private__processMouseEvent(compatEvent, this._private__handler._internal_mouseDownEvent);
        if (!this._private__clickTimeoutId) {
            this._private__clickCount = 0;
            this._private__clickTimeoutId = setTimeout(this._private__resetClickTimeout.bind(this), 500 /* ResetClick */);
            this._private__clickPosition = getPosition(downEvent);
        }
    };
    MouseEventHandler.prototype._private__init = function () {
        var _this = this;
        this._private__target.addEventListener('mouseenter', this._private__mouseEnterHandler.bind(this));
        // Do not show context menu when something went wrong
        this._private__target.addEventListener('touchcancel', this._private__clearLongTapTimeout.bind(this));
        {
            var doc_1 = this._private__target.ownerDocument;
            var outsideHandler_1 = function (event) {
                if (!_this._private__handler._internal_mouseDownOutsideEvent) {
                    return;
                }
                if (event.target && _this._private__target.contains(event.target)) {
                    return;
                }
                _this._private__handler._internal_mouseDownOutsideEvent();
            };
            this._private__unsubscribeOutsideTouchEvents = function () {
                doc_1.removeEventListener('touchstart', outsideHandler_1);
            };
            this._private__unsubscribeOutsideMouseEvents = function () {
                doc_1.removeEventListener('mousedown', outsideHandler_1);
            };
            doc_1.addEventListener('mousedown', outsideHandler_1);
            doc_1.addEventListener('touchstart', outsideHandler_1, { passive: true });
        }
        if (isIOS()) {
            this._private__unsubscribeMobileSafariEvents = function () {
                _this._private__target.removeEventListener('dblclick', _this._private__onMobileSafariDoubleClick);
            };
            this._private__target.addEventListener('dblclick', this._private__onMobileSafariDoubleClick);
        }
        this._private__target.addEventListener('mouseleave', this._private__mouseLeaveHandler.bind(this));
        this._private__target.addEventListener('touchstart', this._private__touchStartHandler.bind(this), { passive: true });
        preventScrollByWheelClick(this._private__target);
        this._private__target.addEventListener('mousedown', this._private__mouseDownHandler.bind(this));
        this._private__initPinch();
        // Hey mobile Safari, what's up?
        // If mobile Safari doesn't have any touchmove handler with passive=false
        // it treats a touchstart and the following touchmove events as cancelable=false,
        // so we can't prevent them (as soon we subscribe on touchmove inside touchstart's handler).
        // And we'll get scroll of the page along with chart's one instead of only chart's scroll.
        this._private__target.addEventListener('touchmove', function () { }, { passive: false });
    };
    MouseEventHandler.prototype._private__initPinch = function () {
        var _this = this;
        if (this._private__handler._internal_pinchStartEvent === undefined &&
            this._private__handler._internal_pinchEvent === undefined &&
            this._private__handler._internal_pinchEndEvent === undefined) {
            return;
        }
        this._private__target.addEventListener('touchstart', function (event) { return _this._private__checkPinchState(event.touches); }, { passive: true });
        this._private__target.addEventListener('touchmove', function (event) {
            if (event.touches.length !== 2 || _this._private__startPinchMiddlePoint === null) {
                return;
            }
            if (_this._private__handler._internal_pinchEvent !== undefined) {
                var currentDistance = getDistance(event.touches[0], event.touches[1]);
                var scale = currentDistance / _this._private__startPinchDistance;
                _this._private__handler._internal_pinchEvent(_this._private__startPinchMiddlePoint, scale);
                preventDefault(event);
            }
        }, { passive: false });
        this._private__target.addEventListener('touchend', function (event) {
            _this._private__checkPinchState(event.touches);
        });
    };
    MouseEventHandler.prototype._private__checkPinchState = function (touches) {
        if (touches.length === 1) {
            this._private__pinchPrevented = false;
        }
        if (touches.length !== 2 || this._private__pinchPrevented || this._private__longTapActive) {
            this._private__stopPinch();
        }
        else {
            this._private__startPinch(touches);
        }
    };
    MouseEventHandler.prototype._private__startPinch = function (touches) {
        var box = getBoundingClientRect(this._private__target);
        this._private__startPinchMiddlePoint = {
            _internal_x: ((touches[0].clientX - box.left) + (touches[1].clientX - box.left)) / 2,
            _internal_y: ((touches[0].clientY - box.top) + (touches[1].clientY - box.top)) / 2,
        };
        this._private__startPinchDistance = getDistance(touches[0], touches[1]);
        if (this._private__handler._internal_pinchStartEvent !== undefined) {
            this._private__handler._internal_pinchStartEvent();
        }
        this._private__clearLongTapTimeout();
    };
    MouseEventHandler.prototype._private__stopPinch = function () {
        if (this._private__startPinchMiddlePoint === null) {
            return;
        }
        this._private__startPinchMiddlePoint = null;
        if (this._private__handler._internal_pinchEndEvent !== undefined) {
            this._private__handler._internal_pinchEndEvent();
        }
    };
    MouseEventHandler.prototype._private__mouseLeaveHandler = function (event) {
        if (this._private__unsubscribeMousemove) {
            this._private__unsubscribeMousemove();
        }
        if (this._private__firesTouchEvents(event)) {
            return;
        }
        if (!this._private__acceptMouseLeave) {
            // mobile Safari sometimes emits mouse leave event for no reason, there is no way to handle it in other way
            // just ignore this event if there was no mouse move or mouse enter events
            return;
        }
        var compatEvent = this._private__makeCompatEvent(event);
        this._private__processMouseEvent(compatEvent, this._private__handler._internal_mouseLeaveEvent);
        // accept all mouse leave events if it's not an iOS device
        this._private__acceptMouseLeave = !isIOS();
    };
    MouseEventHandler.prototype._private__longTapHandler = function (event) {
        var touch = touchWithId(event.touches, ensureNotNull(this._private__activeTouchId));
        if (touch === null) {
            return;
        }
        var compatEvent = this._private__makeCompatEvent(event, touch);
        this._private__processTouchEvent(compatEvent, this._private__handler._internal_longTapEvent);
        this._private__cancelTap = true;
        // long tap is active until touchend event with 0 touches occurred
        this._private__longTapActive = true;
    };
    MouseEventHandler.prototype._private__firesTouchEvents = function (e) {
        if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents !== undefined) {
            return e.sourceCapabilities.firesTouchEvents;
        }
        return eventTimeStamp(e) < this._private__lastTouchEventTimeStamp + 500 /* PreventFiresTouchEvents */;
    };
    MouseEventHandler.prototype._private__processTouchEvent = function (event, callback) {
        if (callback) {
            callback.call(this._private__handler, event);
        }
    };
    MouseEventHandler.prototype._private__processMouseEvent = function (event, callback) {
        if (!callback) {
            return;
        }
        callback.call(this._private__handler, event);
    };
    MouseEventHandler.prototype._private__makeCompatEvent = function (event, touch) {
        // TouchEvent has no clientX/Y coordinates:
        // We have to use the last Touch instead
        var eventLike = touch || event;
        var box = this._private__target.getBoundingClientRect() || { left: 0, top: 0 };
        return {
            _internal_clientX: eventLike.clientX,
            _internal_clientY: eventLike.clientY,
            _internal_pageX: eventLike.pageX,
            _internal_pageY: eventLike.pageY,
            _internal_screenX: eventLike.screenX,
            _internal_screenY: eventLike.screenY,
            _internal_localX: (eventLike.clientX - box.left),
            _internal_localY: (eventLike.clientY - box.top),
            _internal_ctrlKey: event.ctrlKey,
            _internal_altKey: event.altKey,
            _internal_shiftKey: event.shiftKey,
            _internal_metaKey: event.metaKey,
            _internal_isTouch: !event.type.startsWith('mouse') && event.type !== 'contextmenu' && event.type !== 'click',
            _internal_srcType: event.type,
            _internal_target: eventLike.target,
            _internal_view: event.view,
            _internal_preventDefault: function () {
                if (event.type !== 'touchstart') {
                    // touchstart is passive and cannot be prevented
                    preventDefault(event);
                }
            },
        };
    };
    return MouseEventHandler;
}());
export { MouseEventHandler };
function getBoundingClientRect(element) {
    return element.getBoundingClientRect() || { left: 0, top: 0 };
}
function getDistance(p1, p2) {
    var xDiff = p1.clientX - p2.clientX;
    var yDiff = p1.clientY - p2.clientY;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}
function preventDefault(event) {
    if (event.cancelable) {
        event.preventDefault();
    }
}
function getPosition(eventLike) {
    return {
        _internal_x: eventLike.pageX,
        _internal_y: eventLike.pageY,
    };
}
function eventTimeStamp(e) {
    // for some reason e.timestamp is always 0 on iPad with magic mouse, so we use performance.now() as a fallback
    return e.timeStamp || performance.now();
}
function touchWithId(touches, id) {
    for (var i = 0; i < touches.length; ++i) {
        if (touches[i].identifier === id) {
            return touches[i];
        }
    }
    return null;
}
