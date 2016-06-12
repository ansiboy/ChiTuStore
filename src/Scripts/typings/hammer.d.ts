declare module Hammer {
    const INPUT_START: number;
    const INPUT_MOVE: number;
    const INPUT_END: number;
    const INPUT_CANCEL: number;

    const STATE_POSSIBLE: number;
    const STATE_BEGAN: number;
    const STATE_CHANGED: number;
    const STATE_ENDED: number;
    const STATE_RECOGNIZED: number;
    const STATE_CANCELLED: number;
    const STATE_FAILED: number;

    const DIRECTION_NONE: number;
    const DIRECTION_LEFT: number;
    const DIRECTION_RIGHT: number;
    const DIRECTION_UP: number;
    const DIRECTION_DOWN: number;
    const DIRECTION_ALL: number;
    const DIRECTION_HORIZONTAL: number;
    const DIRECTION_VERTICAL: number;

    class Recognizer {
        'set'(options: HammerRecognizerOptions);
        state: number;
    }

    class TouchInput {
        callback: (manager, eventType, input) => void
        domHandler: (ev) => void;
        element: HTMLElement;
        evTarget: string;
    }

    class Manager {
        constructor(element: HTMLElement);//, options: Object = undefined
        constructor(element: HTMLElement, options: Object);//, options: Object = undefined

        element: HTMLElement;
        handlers: { [idnex: string]: Array<Function> };
        input: TouchInput;

        on(event: 'pan'| 'panstart' | 'panend' | 'panup' | 'pandown' | 'panleft' | 'panright' , callback: (event: any) => void);
        'get'(recognizer: 'pan' | 'pinch' | 'rotate' | 'swipe'): Recognizer;
        add(recognizer: Recognizer);
    }

    interface HammerRecognizerOptions {
        direction?: number;
        domEvents?: boolean;
        threshold?: number;
        enable?: boolean;
    }

    class Pan extends Recognizer {
        constructor(options?: HammerRecognizerOptions);
    }

    interface Point {
        x: number,
        y: number
    }

    interface PanEvent extends Event {
        angle: number
        center: Point
        changedPointers: Array<any>
        deltaTime: number
        deltaX: number
        deltaY: number
        direction: number
        distance: number
        eventType: number
        isFinal: boolean
        isFirst: boolean
        offsetDirection: number
        pointerType: string
        pointers: Array<any>
        rotation: number
        scale: number
        srcEvent: TouchEvent
        target: HTMLElement
        timeStamp: number
        type: string
        velocity: number
        velocityX: number
        velocityY: number
    }
}

declare module 'hammer' {

    export = Hammer;
}

