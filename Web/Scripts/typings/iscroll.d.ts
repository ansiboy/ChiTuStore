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
