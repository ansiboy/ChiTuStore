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
        container?: (routeData: chitu.RouteData, previous?: Page | PageContainer) => PageContainer;
        openSwipe?: (routeData: chitu.RouteData) => SwipeDirection;
        closeSwipe?: (route: chitu.RouteData) => SwipeDirection;
    }
    class Application {
        pageCreating: chitu.Callback;
        pageCreated: chitu.Callback;
        private page_stack;
        private _config;
        private _routes;
        private _runned;
        private zindex;
        private back_deferred;
        private start_flag_hash;
        private start_hash;
        constructor(config: ApplicationConfig);
        private page_closed;
        private page_shown;
        config: chitu.ApplicationConfig;
        pages: Array<chitu.Page>;
        on_pageCreating(context: chitu.PageContext): JQueryPromise<any>;
        on_pageCreated(page: chitu.Page, context: chitu.PageContext): JQueryPromise<any>;
        routes(): RouteCollection;
        private setCurrentPage(value);
        currentPage(): chitu.Page;
        private previousPage();
        protected hashchange(): void;
        run(): void;
        getPage(name: string): chitu.Page;
        showPage(url: string, args: any): chitu.Page;
        protected createPageNode(): HTMLElement;
        closeCurrentPage(): void;
        private createPage(url, previousPage?);
        redirect(url: string, args?: {}): chitu.Page;
        back(args?: any): JQueryPromise<any>;
    }
}
declare namespace chitu {
    class ScrollArguments {
        scrollTop: number;
        scrollHeight: number;
        clientHeight: number;
    }
    abstract class WebPageContainer implements PageContainer {
        private animationTime;
        private num;
        private _topBar;
        private _bottomBar;
        private _node;
        nodes: PageNodes;
        protected previous: PageContainer;
        scrollEnd: JQueryCallback;
        constructor(prevous: PageContainer);
        show(swipe: SwipeDirection): JQueryPromise<any>;
        private translateDuration(duration);
        private translateX(x, duration?);
        private translateY(y, duration?);
        private disableHeaderFooterTouchMove();
        private wrapPageNode();
        hide(swipe: SwipeDirection): JQueryPromise<any>;
        private is_dispose;
        dispose(): void;
        topBar: HTMLElement;
        bottomBar: HTMLElement;
        loading: HTMLElement;
        visible: boolean;
    }
}
declare namespace chitu {
    class DivPageContainer extends WebPageContainer {
        private cur_scroll_args;
        private pre_scroll_top;
        private checking_num;
        private CHECK_INTERVAL;
        constructor(previous: DivPageContainer);
        private on_scrollEnd(args);
        private scrollEndCheck();
    }
}
declare namespace chitu {
    class DocumentPageContainer extends WebPageContainer {
        private cur_scroll_args;
        private checking_num;
        private pre_scroll_top;
        private CHECK_INTERVAL;
        constructor(previous: DocumentPageContainer);
        private on_scrollEnd(args);
        private scrollEndCheck();
        show(swipe: SwipeDirection): JQueryPromise<any>;
        hide(swipe: SwipeDirection): JQueryPromise<any>;
    }
}
declare namespace chitu {
    class IScrollPageContainer extends WebPageContainer {
        private iscroller;
        scroll: JQueryCallback;
        constructor(previous: IScrollPageContainer);
        private on_scroll(args);
        private on_scrollEnd(args);
        private init(nodes);
        private _is_dispose;
        dispose(): void;
        refresh(): void;
    }
}
declare namespace chitu {
    class PageContainerFactory {
        static createPageContainer(routeData: RouteData, previous: Page | PageContainer): PageContainer;
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
    function fireCallback(callback: chitu.Callback, args: any): JQueryPromise<any>;
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
    class PageLoadArguments {
        private _page;
        constructor(page: chitu.Page, loadType?: PageLoadType, loading?: PageLoading);
        loadType: PageLoadType;
        loading: PageLoading;
        enableScrollLoad: boolean;
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
    class PageNodes {
        container: HTMLElement;
        header: HTMLElement;
        body: HTMLElement;
        footer: HTMLElement;
        loading: HTMLElement;
        content: HTMLElement;
        constructor(node: HTMLElement);
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
        preLoad: Callback;
        load: Callback;
        loadCompleted: Callback;
        closing: Callback;
        closed: Callback;
        scroll: Callback;
        showing: Callback;
        shown: Callback;
        hiding: Callback;
        hidden: Callback;
        scrollEnd: Callback;
        viewChanged: Callback;
        constructor(container: PageContainer, routeData: RouteData, action: JQueryPromise<Action>, view: JQueryPromise<string>, previous?: chitu.Page);
        private createPageLoadArguments(args, loadType, loading);
        formLoading: PageLoading;
        bottomLoading: PageLoading;
        view: JQueryPromise<string>;
        action: JQueryPromise<Action>;
        private enableScrollLoad;
        private viewHtml;
        static getPageName(routeData: RouteData): string;
        routeData: chitu.RouteData;
        name: string;
        node: HTMLElement;
        conatiner: PageContainer;
        previous: chitu.Page;
        hide(swipe?: SwipeDirection): JQueryPromise<any>;
        show(swipe?: SwipeDirection): JQueryPromise<any>;
        visible(): boolean;
        private fireEvent(callback, args);
        on_load(args: PageLoadArguments | {
            loadType: PageLoadType;
            loading?: PageLoading;
        }): JQueryPromise<any>;
        on_loadCompleted(args: any): JQueryPromise<any>;
        on_closing(args: any): JQueryPromise<any>;
        on_closed(args: any): JQueryPromise<any>;
        on_scroll(args: any): JQueryPromise<any>;
        on_showing(args: any): JQueryPromise<any>;
        on_shown(args: any): JQueryPromise<any>;
        on_hiding(args: any): JQueryPromise<any>;
        on_hidden(args: any): JQueryPromise<any>;
        on_scrollEnd(args: any): JQueryPromise<any>;
        close(args?: Object, swipe?: SwipeDirection): void;
        private static page_scrollEnd(sender, args);
        refreshUI(): void;
    }
}
declare namespace chitu {
    interface PageContainer {
        show(swipe: SwipeDirection): JQueryPromise<any>;
        hide(swipe: SwipeDirection): JQueryPromise<any>;
        dispose(): any;
        nodes: PageNodes;
        loading: HTMLElement;
        visible: boolean;
        scrollEnd: JQueryCallback;
    }
    abstract class BasePageContainer implements PageContainer {
        private animationTime;
        private num;
        private _nodes;
        protected previous: PageContainer;
        scrollEnd: JQueryCallback;
        constructor(node: HTMLElement, prevous: PageContainer);
        show(swipe: SwipeDirection): JQueryPromise<any>;
        private translateDuration(duration);
        private translateX(x, duration?);
        private translateY(y, duration?);
        private disableHeaderFooterTouchMove();
        hide(swipe: SwipeDirection): JQueryPromise<any>;
        private is_dispose;
        dispose(): void;
        header: HTMLElement;
        nodes: PageNodes;
        footer: HTMLElement;
        loading: HTMLElement;
        visible: boolean;
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
        getRouteData(url: any): chitu.RouteData;
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
