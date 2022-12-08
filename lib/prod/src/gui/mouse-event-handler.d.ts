import { IDestroyable } from '../helpers/idestroyable';
import { Coordinate } from '../model/coordinate';
export declare type HandlerMouseEventCallback = (event: MouseEventHandlerMouseEvent) => void;
export declare type HandlerTouchEventCallback = (event: MouseEventHandlerTouchEvent) => void;
export declare type EmptyCallback = () => void;
export declare type PinchEventCallback = (middlePoint: Position, scale: number) => void;
export interface MouseEventHandlers {
    pinchStartEvent?: EmptyCallback;
    pinchEvent?: PinchEventCallback;
    pinchEndEvent?: EmptyCallback;
    mouseClickEvent?: HandlerMouseEventCallback;
    tapEvent?: HandlerTouchEventCallback;
    mouseDoubleClickEvent?: HandlerMouseEventCallback;
    doubleTapEvent?: HandlerTouchEventCallback;
    mouseDownEvent?: HandlerMouseEventCallback;
    touchStartEvent?: HandlerTouchEventCallback;
    mouseUpEvent?: HandlerMouseEventCallback;
    touchEndEvent?: HandlerTouchEventCallback;
    mouseDownOutsideEvent?: EmptyCallback;
    mouseEnterEvent?: HandlerMouseEventCallback;
    mouseLeaveEvent?: HandlerMouseEventCallback;
    mouseMoveEvent?: HandlerMouseEventCallback;
    pressedMouseMoveEvent?: HandlerMouseEventCallback;
    touchMoveEvent?: HandlerTouchEventCallback;
    longTapEvent?: HandlerTouchEventCallback;
}
export interface MouseEventHandlerEventBase {
    readonly clientX: Coordinate;
    readonly clientY: Coordinate;
    readonly pageX: Coordinate;
    readonly pageY: Coordinate;
    readonly screenX: Coordinate;
    readonly screenY: Coordinate;
    readonly localX: Coordinate;
    readonly localY: Coordinate;
    readonly ctrlKey: boolean;
    readonly altKey: boolean;
    readonly shiftKey: boolean;
    readonly metaKey: boolean;
    readonly srcType: string;
    target: MouseEvent['target'];
    view: MouseEvent['view'];
    preventDefault(): void;
}
export interface MouseEventHandlerMouseEvent extends MouseEventHandlerEventBase {
    isTouch: false;
}
export interface MouseEventHandlerTouchEvent extends MouseEventHandlerEventBase {
    isTouch: true;
}
export declare type TouchMouseEvent = MouseEventHandlerMouseEvent | MouseEventHandlerTouchEvent;
export interface Position {
    x: number;
    y: number;
}
export interface MouseEventHandlerOptions {
    treatVertTouchDragAsPageScroll: () => boolean;
    treatHorzTouchDragAsPageScroll: () => boolean;
}
export declare class MouseEventHandler implements IDestroyable {
    private readonly _target;
    private readonly _handler;
    private readonly _options;
    private _clickCount;
    private _clickTimeoutId;
    private _clickPosition;
    private _tapCount;
    private _tapTimeoutId;
    private _tapPosition;
    private _longTapTimeoutId;
    private _longTapActive;
    private _mouseMoveStartPosition;
    private _touchMoveStartPosition;
    private _touchMoveExceededManhattanDistance;
    private _cancelClick;
    private _cancelTap;
    private _unsubscribeOutsideMouseEvents;
    private _unsubscribeOutsideTouchEvents;
    private _unsubscribeMobileSafariEvents;
    private _unsubscribeMousemove;
    private _unsubscribeRootMouseEvents;
    private _unsubscribeRootTouchEvents;
    private _startPinchMiddlePoint;
    private _startPinchDistance;
    private _pinchPrevented;
    private _preventTouchDragProcess;
    private _mousePressed;
    private _lastTouchEventTimeStamp;
    private _activeTouchId;
    private _acceptMouseLeave;
    constructor(target: HTMLElement, handler: MouseEventHandlers, options: MouseEventHandlerOptions);
    destroy(): void;
    private _mouseEnterHandler;
    private _resetClickTimeout;
    private _resetTapTimeout;
    private _mouseMoveHandler;
    private _touchMoveHandler;
    private _mouseMoveWithDownHandler;
    private _touchMouseMoveWithDownInfo;
    /**
     * In Firefox mouse events dont't fire if the mouse position is outside of the browser's border.
     * To prevent the mouse from hanging while pressed we're subscribing on the mouseleave event of the document element.
     * We're subscribing on mouseleave, but this event is actually fired on mouseup outside of the browser's border.
     */
    private _onFirefoxOutsideMouseUp;
    /**
     * Safari doesn't fire touchstart/mousedown events on double tap since iOS 13.
     * There are two possible solutions:
     * 1) Call preventDefault in touchEnd handler. But it also prevents click event from firing.
     * 2) Add listener on dblclick event that fires with the preceding mousedown/mouseup.
     * https://developer.apple.com/forums/thread/125073
     */
    private _onMobileSafariDoubleClick;
    private _touchEndHandler;
    private _mouseUpHandler;
    private _clearLongTapTimeout;
    private _touchStartHandler;
    private _mouseDownHandler;
    private _init;
    private _initPinch;
    private _checkPinchState;
    private _startPinch;
    private _stopPinch;
    private _mouseLeaveHandler;
    private _longTapHandler;
    private _firesTouchEvents;
    private _processTouchEvent;
    private _processMouseEvent;
    private _makeCompatEvent;
}
