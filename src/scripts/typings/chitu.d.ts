declare namespace chitu {
    interface RouteData {
        actionPath: string;
        viewPath: string;
        values: any;
        pageName: string;
        resource?: string[];
    }
    interface ApplicationConfig {
        container?: (routeData: RouteData, prevous: PageContainer) => PageContainer;
        openSwipe?: (routeData: RouteData) => SwipeDirection;
        closeSwipe?: (route: RouteData) => SwipeDirection;
        pathBase?: string;
    }
    class Application {
        pageCreated: Callback<Application, Page>;
        private _config;
        private _runned;
        private zindex;
        private back_deferred;
        private start_flag_hash;
        private start_hash;
        private container_stack;
        parseUrl: (url: string) => RouteData;
        constructor(config?: ApplicationConfig);
        private on_pageCreated(page);
        config: chitu.ApplicationConfig;
        currentPage(): chitu.Page;
        pageContainers: Array<PageContainer>;
        private createPageContainer(routeData);
        protected hashchange(): void;
        run(): void;
        getPage(name: string): chitu.Page;
        showPage<T extends Page>(url: string, args?: any): JQueryPromise<T>;
        protected createPageNode(): HTMLElement;
        redirect<T extends Page>(url: string, args?: any): JQueryPromise<T>;
        back(args?: any): JQueryPromise<any>;
    }
}
declare namespace chitu {
    class ControlFactory {
        static createControls(element: HTMLElement, page: Page): Array<Control>;
        static createControl(element: HTMLElement, page: Page): Control;
    }
    class ControlCollection {
        private parent;
        private items;
        constructor(parent: Control);
        add(control: Control): void;
        length: number;
        item(indexOrName: number | string): any;
    }
    class Control {
        private _element;
        private _children;
        private _page;
        private static ControlTags;
        protected _name: string;
        load: Callback<Control, any>;
        parent: Control;
        constructor(element: HTMLElement, page: Page);
        private createChildren(element, page);
        protected createChild(element: HTMLElement, page: Page): Control;
        visible: boolean;
        element: HTMLElement;
        children: ControlCollection;
        name: string;
        page: Page;
        on_load(args: Object): JQueryPromise<any>;
        static register(tagName: string, createControlMethod: (new (element: HTMLElement, page: Page) => Control) | ((element: HTMLElement, page: Page) => Control)): void;
        static createControl(element: HTMLElement, page: Page): Control;
    }
    class PageHeader extends Control {
        constructor(element: HTMLElement, page: Page);
    }
    class PageFooter extends Control {
        constructor(element: HTMLElement, page: Page);
    }
    interface ScrollArguments {
        scrollTop?: number;
        scrollHeight?: number;
        clientHeight?: number;
    }
    class ScrollView extends Control {
        scroll: Callback<ScrollView, ScrollArguments>;
        scrollEnd: Callback<ScrollView, ScrollArguments>;
        constructor(element: HTMLElement, page: Page);
        on_load(args: any): JQueryPromise<any>;
        protected on_scrollEnd(args: ScrollArguments): JQueryPromise<any>;
        protected on_scroll(args: ScrollArguments): JQueryPromise<any>;
        static createInstance(element: HTMLElement, page: Page): ScrollView;
        disabled: boolean;
    }
    class ScrollViewStatusBar extends Control {
        constructor(element: HTMLElement, page: Page);
    }
    class IScrollView extends ScrollView {
        private static SCROLLER_TAG_NAME;
        private iscroller;
        constructor(element: HTMLElement, page: Page);
        private init(element);
        refresh(): void;
        disabled: boolean;
    }
}
declare namespace chitu {
    class Errors {
        static argumentNull(paramName: string): Error;
        static modelFileExpecteFunction(script: any): Error;
        static paramTypeError(paramName: string, expectedType: string): Error;
        static paramError(msg: string): Error;
        static viewNodeNotExists(name: any): Error;
        static pathPairRequireView(index: any): Error;
        static notImplemented(name: any): Error;
        static routeExists(name: any): Error;
        static routeResultRequireController(routeName: any): Error;
        static routeResultRequireAction(routeName: any): Error;
        static ambiguityRouteMatched(url: any, routeName1: any, routeName2: any): Error;
        static noneRouteMatched(url: any): Error;
        static emptyStack(): Error;
        static canntParseUrl(url: string): Error;
        static routeDataRequireController(): Error;
        static routeDataRequireAction(): Error;
        static parameterRequireField(fileName: any, parameterName: any): Error;
        static viewCanntNull(): Error;
        static createPageFail(pageName: string): Error;
        static actionTypeError(pageName: string): Error;
        static scrollerElementNotExists(): Error;
    }
}
declare namespace chitu {
    interface EventCallback<S, A> {
        (sender: S, args: A): JQueryPromise<any> | void;
    }
    class Callback<S, A> {
        source: any;
        constructor(source: any);
        add(func: EventCallback<S, A>): void;
        remove(func: Function): void;
        has(func: Function): boolean;
        fireWith(context: any, args: any): any;
        fire(arg1?: any, arg2?: any, arg3?: any, arg4?: any): any;
    }
    function Callbacks<S, A>(options?: any): Callback<S, A>;
    function fireCallback<S, A>(callback: chitu.Callback<S, A>, sender: S, args: A): JQueryPromise<any>;
}
declare namespace chitu {
    enum PageLoadType {
        init = 0,
        scroll = 1,
        pullDown = 2,
        pullUp = 3,
        custom = 4,
    }
    interface PageLoading {
        show(): any;
        hide(): any;
    }
    enum SwipeDirection {
        None = 0,
        Left = 1,
        Right = 2,
        Up = 3,
        Down = 4,
    }
    enum ScrollType {
        IScroll = 0,
        Div = 1,
        Document = 2,
    }
    type PageArguemnts = {
        container: PageContainer;
        routeData: RouteData;
        view: string;
    };
    interface PageConstructor {
        new (args: PageArguemnts): Page;
    }
    class Page {
        static animationTime: number;
        private _name;
        private _viewDeferred;
        private _actionDeferred;
        private _loadViewModelResult;
        private _openResult;
        private _hideResult;
        private _showTime;
        private _hideTime;
        private _routeData;
        private _enableScrollLoad;
        private is_closed;
        private _scrollLoad_loading_bar;
        private isActionExecuted;
        private _formLoading;
        private _bottomLoading;
        private _pageContainer;
        private _node;
        private _viewHtml;
        private _loading;
        private _controls;
        preLoad: Callback<Page, any>;
        load: Callback<Page, any>;
        closing: Callback<Page, any>;
        closed: Callback<Page, any>;
        showing: Callback<Page, any>;
        shown: Callback<Page, any>;
        hiding: Callback<Page, any>;
        hidden: Callback<Page, any>;
        constructor(args: PageArguemnts);
        private initialize(container, pageInfo);
        private createControls(element);
        routeData: RouteData;
        name: string;
        element: HTMLElement;
        visible: boolean;
        container: PageContainer;
        hide(swipe?: SwipeDirection): JQueryPromise<any>;
        findControl<T extends Control>(name: string): T;
        private fireEvent<A>(callback, args);
        on_load(args: Object): JQueryPromise<any>;
        on_closing(args: any): JQueryPromise<any>;
        on_closed(args: any): JQueryPromise<any>;
        on_showing(args: any): JQueryPromise<any>;
        on_shown(args: any): JQueryPromise<any>;
        on_hiding(args: any): JQueryPromise<any>;
        on_hidden(args: any): JQueryPromise<any>;
    }
}
declare namespace chitu {
    class PageContainer {
        private animationTime;
        private num;
        private _node;
        private _loading;
        private _pages;
        private _currentPage;
        private _previous;
        private _app;
        private _previousOffsetRate;
        private open_swipe;
        enableSwipeClose: boolean;
        gesture: Gesture;
        pageCreated: chitu.Callback<PageContainer, Page>;
        constructor(app: Application, previous?: PageContainer);
        on_pageCreated(page: chitu.Page): JQueryPromise<any>;
        private _enableSwipeBack();
        protected createNode(): HTMLElement;
        protected createLoading(parent: HTMLElement): HTMLElement;
        show(swipe: SwipeDirection): JQueryPromise<any>;
        hide(swipe: SwipeDirection): JQueryPromise<any>;
        private is_closing;
        close(swipe?: SwipeDirection): void;
        private showLoading();
        private hideLoading();
        visible: boolean;
        element: HTMLElement;
        currentPage: Page;
        pages: Array<Page>;
        previous: PageContainer;
        private createActionDeferred(routeData);
        private createViewDeferred(url);
        private createPage(routeData);
        showPage<T extends Page>(routeData: RouteData, swipe: SwipeDirection): JQueryPromise<T>;
    }
    class PageContainerFactory {
        private _app;
        constructor(app: Application);
        static createInstance(app: Application, routeData: RouteData, previous: PageContainer): PageContainer;
    }
    class Pan {
        cancel: boolean;
        start: (e: Hammer.PanEvent) => void;
        left: (e: Hammer.PanEvent) => void;
        right: (e: Hammer.PanEvent) => void;
        up: (e: Hammer.PanEvent) => void;
        down: (e: Hammer.PanEvent) => void;
        end: (e: Hammer.PanEvent) => void;
        constructor(gesture: Gesture);
    }
    class Gesture {
        private executedCount;
        private hammersCount;
        private hammer;
        private _pans;
        private _prevent;
        prevent: {
            pan: (direction: number) => void;
        };
        constructor(element: HTMLElement);
        private on_pan(e);
        private pans;
        createPan(): Pan;
    }
}
declare namespace chitu {
    class Utility {
        static isType(targetType: Function, obj: any): boolean;
        static isDeferred(obj: any): boolean;
        static format(source: string, ...params: string[]): string;
        static fileName(url: any, withExt: any): string;
        static log(msg: any, args?: any[]): void;
        static loadjs(...modules: string[]): JQueryPromise<any>;
    }
}
declare module "chitu" { 
    export = chitu; 
}
