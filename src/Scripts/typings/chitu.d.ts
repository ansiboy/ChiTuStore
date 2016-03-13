/// <reference path="jquery.d.ts" /> 
declare namespace chitu {
    class Action {
        private _name;
        private _handle;
        constructor(controller: any, name: any, handle: any);
        name(): any;
        execute(page: chitu.Page): any;
    }
    function createActionDeferred(routeData: chitu.RouteData): JQueryPromise<Action>;
    function createViewDeferred(routeData: RouteData): JQueryPromise<string>;
}
declare namespace chitu {
    interface ApplicationConfig {
        container?: (routeData: chitu.RouteData, prevous: PageContainer) => PageContainer;
        openSwipe?: (routeData: chitu.RouteData) => SwipeDirection;
        closeSwipe?: (route: chitu.RouteData) => SwipeDirection;
    }
    class Application {
        pageCreating: chitu.Callback;
        pageCreated: chitu.Callback;
        private _config;
        private _routes;
        private _runned;
        private zindex;
        private back_deferred;
        private start_flag_hash;
        private start_hash;
        private container_stack;
        constructor(config: ApplicationConfig);
        on_pageCreating(context: chitu.PageContext): JQueryPromise<any>;
        on_pageCreated(page: chitu.Page): JQueryPromise<any>;
        config: chitu.ApplicationConfig;
        routes(): RouteCollection;
        currentPage(): chitu.Page;
        pageContainers: Array<PageContainer>;
        private createPageContainer(routeData);
        protected hashchange(): void;
        run(): void;
        getPage(name: string): chitu.Page;
        showPage(url: string, args: any): chitu.Page;
        protected createPageNode(): HTMLElement;
        redirect(url: string, args?: {}): chitu.Page;
        back(args?: any): JQueryPromise<any>;
    }
}
declare var Application: any;
declare namespace chitu {
    enum OS {
        ios = 0,
        android = 1,
        other = 2,
    }
    class ControlFactory {
        static createControls(element: HTMLElement, page: Page): Array<Control>;
        static createControl(element: HTMLElement, page: Page): Control;
        private static transformElement(element);
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
        load: Callback;
        parent: Control;
        constructor(element: HTMLElement, page: Page);
        private createChildren(element, page);
        protected createChild(element: HTMLElement, page: Page): Control;
        visible: boolean;
        element: HTMLElement;
        children: ControlCollection;
        name: string;
        page: Page;
        protected fireEvent(callback: chitu.Callback, args: any): JQueryPromise<any>;
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
    class ScrollArguments {
        scrollTop: number;
        scrollHeight: number;
        clientHeight: number;
    }
    class ScrollView extends Control {
        private _bottomLoading;
        static scrolling: boolean;
        scroll: Callback;
        scrollEnd: Callback;
        scrollLoad: (sender, args) => JQueryPromise<any>;
        constructor(element: HTMLElement, page: Page);
        on_load(args: any): JQueryPromise<any>;
        protected on_scrollEnd(args: ScrollArguments): JQueryPromise<any>;
        protected on_scroll(args: ScrollArguments): JQueryPromise<any>;
        static createInstance(element: HTMLElement, page: Page): ScrollView;
        bottomLoading: ScrollViewStatusBar;
        private static page_scrollEnd(sender, args);
    }
    class ScrollViewStatusBar extends Control {
        constructor(element: HTMLElement, page: Page);
    }
    class IScrollView extends ScrollView {
        private iscroller;
        constructor(element: HTMLElement, page: Page);
        private init(element);
        refresh(): void;
    }
    class FormLoading extends Control {
        private loading_element;
        private _loaded_count;
        private static _on_load;
        constructor(element: HTMLElement, page: Page);
        private defaultHtml();
        private loaded_count;
        protected createChild(element: HTMLElement, page: Page): Control;
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
    }
}
declare namespace chitu {
    class Callback {
        source: any;
        constructor(source: any);
        add(func: Function): void;
        remove(func: Function): void;
        has(func: Function): boolean;
        fireWith(context: any, args: any): any;
        fire(arg1?: any, arg2?: any, arg3?: any, arg4?: any): any;
    }
    function Callbacks(options?: any): Callback;
    function fireCallback(callback: chitu.Callback, args: Array<any>): JQueryPromise<any>;
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
        private _prevous;
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
        preLoad: Callback;
        load: Callback;
        loadCompleted: Callback;
        closing: Callback;
        closed: Callback;
        showing: Callback;
        shown: Callback;
        hiding: Callback;
        hidden: Callback;
        viewChanged: Callback;
        constructor(container: PageContainer, routeData: RouteData, action: JQueryPromise<Action>, view: JQueryPromise<string>, previous?: chitu.Page);
        private createControls(element);
        view: JQueryPromise<string>;
        action: JQueryPromise<Action>;
        private enableScrollLoad;
        private viewHtml;
        static getPageName(routeData: RouteData): string;
        routeData: chitu.RouteData;
        name: string;
        element: HTMLElement;
        previous: chitu.Page;
        visible: boolean;
        container: PageContainer;
        hide(swipe?: SwipeDirection): JQueryPromise<any>;
        findControl<T extends Control>(name: string): T;
        private fireEvent(callback, args);
        on_load(args: Object): any;
        on_loadCompleted(args: Object): void;
        on_closing(args: any): JQueryPromise<any>;
        on_closed(args: any): JQueryPromise<any>;
        on_showing(args: any): JQueryPromise<any>;
        on_shown(args: any): JQueryPromise<any>;
        on_hiding(args: any): JQueryPromise<any>;
        on_hidden(args: any): JQueryPromise<any>;
        on_viewChanged(args: any): JQueryPromise<any>;
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
        pageCreated: chitu.Callback;
        constructor(app: Application, previous?: PageContainer);
        on_pageCreated(page: chitu.Page): JQueryPromise<any>;
        private _enableSwipeBack();
        protected createNode(): HTMLElement;
        protected createLoading(parent: HTMLElement): HTMLElement;
        show(swipe: SwipeDirection): JQueryPromise<any>;
        hide(swipe: SwipeDirection): JQueryPromise<any>;
        private is_closing;
        close(swipe: SwipeDirection): void;
        private showLoading();
        private hideLoading();
        visible: boolean;
        element: HTMLElement;
        currentPage: Page;
        pages: Array<Page>;
        previous: PageContainer;
        private createPage(routeData);
        showPage(routeData: RouteData, swipe: SwipeDirection): Page;
    }
    class PageContainerFactory {
        private _app;
        constructor(app: Application);
        static createInstance(app: Application, routeData: RouteData, previous: PageContainer): PageContainer;
    }
    class Pan {
        cancel: boolean;
        start: (e: PanEvent) => void;
        left: (e: PanEvent) => void;
        right: (e: PanEvent) => void;
        up: (e: PanEvent) => void;
        down: (e: PanEvent) => void;
        end: (e: PanEvent) => void;
        constructor(gesture: Gesture);
    }
    class Gesture {
        private executedCount;
        private hammersCount;
        private _prevent;
        prevent: {
            pan: (direction: number) => void;
        };
        constructor();
        private getHammer(element);
        private getPans(element);
        private clear();
        createPan(element: HTMLElement): Pan;
    }
}
declare namespace chitu {
    class PageContext {
        private _view;
        private _routeData;
        constructor(view: JQueryPromise<string>, routeData: RouteData);
        view(): JQueryPromise<string>;
        routeData(): RouteData;
    }
}
declare namespace chitu {
    class Route {
        private _name;
        private _pattern;
        private _defaults;
        viewPath: string;
        actionPath: string;
        constructor(name: string, pattern: string, defaults: Object);
        name(): string;
        defaults(): Object;
        url(): string;
    }
}
declare namespace chitu {
    class RouteCollection {
        _source: any;
        _priority: number;
        _defaultRoute: chitu.Route;
        static defaultRouteName: string;
        _defaults: {};
        constructor();
        _init(): void;
        count(): any;
        mapRoute(args: any): Route;
        getRouteData(url: string): chitu.RouteData;
    }
}
declare namespace chitu {
    class RouteData {
        private _values;
        private _viewPath;
        private _actionPath;
        private _pageName;
        private _url;
        constructor(url: string);
        values(value?: any): any;
        viewPath(value?: string): string;
        actionPath(value?: string): string;
        pageName(value?: string): string;
        url(): string;
    }
}
declare namespace chitu {
    class Utility {
        static isType(targetType: Function, obj: any): boolean;
        static isDeferred(obj: any): boolean;
        static format(source: string, arg1?: string, arg2?: string, arg3?: string, arg4?: string, arg5?: string, arg6?: string, arg7?: string, arg8?: string, arg9?: string, arg10?: string): string;
        static fileName(url: any, withExt: any): string;
        static log(msg: any, args?: any[]): void;
        static loadjs(modules: string[]): JQueryPromise<any>;
    }
}
