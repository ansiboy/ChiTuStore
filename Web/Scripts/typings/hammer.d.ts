interface HammerRecognizerOptions {
    direction?: number,
    domEvents?: boolean,
    threshold?: number
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

declare class Recognizer {
    'set'(options: HammerRecognizerOptions);
}
declare class Hammer {
    static DIRECTION_NONE: number;
    static DIRECTION_LEFT: number;
    static DIRECTION_RIGHT: number;
    static DIRECTION_UP: number;
    static DIRECTION_DOWN: number;
    static DIRECTION_ALL: number;
    static DIRECTION_HORIZONTAL: number;
    static DIRECTION_VERTICAL: number;

    constructor(element: HTMLElement);//, options: Object = undefined
    constructor(element: HTMLElement, options: Object);//, options: Object = undefined
    on(event: string, callback: (event: any) => void);
    'get'(recognizer: string): Recognizer
}

declare module 'hammer' {

    //mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    export = Hammer;
}