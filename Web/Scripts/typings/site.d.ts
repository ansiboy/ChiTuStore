declare module 'text!Module/Home/ProductList/ProductsFilter.html' {
}

//declare module "ui/ScrollLoad" {
//    //namespace chitu {
//    function scrollLoad(page: chitu.Page);
//    function scrollLoad(page: chitu.Page, config: Object);
//    function scrollLoad(page: chitu.Page, config: Object, loadData: Function);
//    function scrollLoad(page: chitu.Page, loadData: Function);
//    //}
//}

declare class IScroll {
    constructor(node: HTMLElement | string)
    constructor(node: HTMLElement | string, config: any)
    destroy()
    disable()
    directionX: number
    directionY: number
    enable()
    on(event: string, fn: Function)
    y: number
    refresh()
    scrollerHeight: number
    scrollTo: (x: number, y: number, time: number, easing: any) => {}
    scrollToElement: (el: any, time?: number, offsetX?: number, offsetY?: number, easing?) => void
    startY: number
    wrapperHeight: number
    handleEvent(e: any)
    enabled: boolean

    static utils: {
        ease: {
            quadratic: {
                style: string
                fn: (k: number) => {}
            }
            circular: {
                style: string
                fn: (k: number) => {}
            }
            back: {
                style: string
                fn: (k: number) => {}
            }
            bounce: {
                style: string
                fn: (k: number) => {}
            }
            elastic: {
                style: string
                fn: (k: number) => {}
            }
        }
    }

}

declare module "iscroll" {
    interface MyTouchEvent extends TouchEvent {
        altKey: boolean
        clientX: number
        clientY: number
        offsetX: number
        offsetY: number
        originalEvent: MouseEvent
    }


    interface Utils {
        quadratic: {
            style: string
            fn: (k: number) => {}
        }
        circular: {
            style: string
            fn: (k: number) => {}
        }
        back: {
            style: string
            fn: (k: number) => {}
        }
        bounce: {
            style: string
            fn: (k: number) => {}
        }
        elastic: {
            style: string
            fn: (k: number) => {}
        }
    }

    interface Easing {
        style: string
        fn: (k: number) => {}
    }
    export =  IScroll;
}




declare module "jweixin" {
    function config(value);
    function ready(callback: Function)
    function error(callback: Function)
    function onMenuShareTimeline(value)
    function onMenuShareAppMessage(value)
}

declare module 'md5' {
    interface WordArray {
        toString(): string
    }
    function MD5(value: string): WordArray;
}

interface HammerRecognizerOptions {
    direction: number,
    domEvents?: boolean
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

interface LoadListPromise<T> extends JQueryPromise<Array<T>> {
    loadCompleted: boolean
}

//declare module "sc/Home/Index" { }