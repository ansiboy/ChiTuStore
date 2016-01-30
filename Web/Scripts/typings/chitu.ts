namespace chitu {
    var e = chitu.Errors;
    export class Utility {
        public static isType(targetType: Function, obj: any): boolean {
            for (var key in targetType.prototype) {
                if (obj[key] === undefined)
                    return false;
            }
            return true;
        }
        public static isDeferred(obj: any): boolean {
            if (obj == null)
                return false;

            if (obj.pipe != null && obj.always != null && obj.done != null)
                return true;

            return false;
        }
        public static format(source: string, arg1?: string, arg2?: string, arg3?: string, arg4?: string, arg5?: string,
            arg6?: string, arg7?: string, arg8?: string, arg9?: string, arg10?: string): string {
            var params: string[] = [arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10];
            for (var i = 0; i < params.length; i++) {
                if (params[i] == null)
                    break;

                source = source.replace(new RegExp("\\{" + i + "\\}", "g"), function () {
                    return params[i];
                });
            }

            return source;
        }
        public static fileName(url, withExt): string {
            /// <summary>获取 URL 链接中的文件名</summary>
            /// <param name="url" type="String">URL 链接</param>
            /// <param name="withExt" type="Boolean" canBeNull="true">
            /// 表示返回的文件名是否包含扩展名，true表示包含，false表示不包含。默认值为true。
            /// </param>
            /// <returns>返回 URL 链接中的文件名</returns>
            if (!url) throw e.argumentNull('url');
            withExt = withExt || true;

            url = url.replace('http://', '/');
            var filename = url.replace(/^.*[\\\/]/, '');
            if (withExt === true) {
                var arr = filename.split('.');
                filename = arr[0];
            }

            return filename;
        }
        public static log(msg, args: any[] = []) {
            if (!window.console) return;

            if (args == null) {
                console.log(msg);
                return;
            }
            var txt = this.format.apply(this, arguments);
            console.log(txt);
        }
        static loadjs(modules: string[]): JQueryPromise<any> {
            var deferred = $.Deferred();
            requirejs(modules, function () {
                //deferred.resolve(arguments);
                var args = [];
                for (var i = 0; i < arguments.length; i++)
                    args[i] = arguments[i];

                deferred.resolve.apply(deferred, args);
            });
            return deferred;
        }
    }


} 



namespace chitu {
    var u = chitu.Utility;
    export class Errors {
        public static argumentNull(paramName: string) {
            var msg = u.format('The argument "{0}" cannt be null.', paramName);

            return new Error(msg);
        }
        public static modelFileExpecteFunction(script) {
            var msg = u.format('The eval result of script file "{0}" is expected a function.', script);
            return new Error(msg);
        }
        public static paramTypeError(paramName: string, expectedType: string) {
            /// <param name="paramName" type="String"/>
            /// <param name="expectedType" type="String"/>

            var msg = u.format('The param "{0}" is expected "{1}" type.', paramName, expectedType);
            return new Error(msg);
        }
        public static viewNodeNotExists(name) {
            var msg = u.format('The view node "{0}" is not exists.', name);
            return new Error(msg);
        }
        public static pathPairRequireView(index) {
            var msg = u.format('The view value is required for path pair, but the item with index "{0}" is miss it.', index);
            return new Error(msg);
        }
        public static notImplemented(name) {
            var msg = u.format('The method "{0}" is not implemented.', name);
            return new Error(msg);
        }
        public static routeExists(name) {
            var msg = u.format('Route named "{0}" is exists.', name);
            return new Error(msg);
        }
        public static routeResultRequireController(routeName) {
            var msg = u.format('The parse result of route "{0}" does not contains controler.', routeName);
            return new Error(msg);
        }
        public static routeResultRequireAction(routeName) {
            var msg = u.format('The parse result of route "{0}" does not contains action.', routeName);
            return new Error(msg);
        }
        public static ambiguityRouteMatched(url, routeName1, routeName2) {
            var msg = u.format('Ambiguity route matched, {0} is match in {1} and {2}.', url, routeName1, routeName2);
            return new Error(msg);
        }
        public static noneRouteMatched(url): Error {
            var msg = u.format('None route matched with url "{0}".', url);
            var error = new Error(msg);
            return error;
        }
        public static emptyStack(): Error {
            return new Error('The stack is empty.');
        }
        public static canntParseUrl(url: string) {
            var msg = u.format('Can not parse the url "{0}" to route data.', url);
            return new Error(msg);
        }
        public static routeDataRequireController(): Error {
            var msg = 'The route data does not contains a "controller" file.';
            return new Error(msg);
        }
        public static routeDataRequireAction(): Error {
            var msg = 'The route data does not contains a "action" file.';
            return new Error(msg);
        }
        public static parameterRequireField(fileName, parameterName) {
            var msg = u.format('Parameter {1} does not contains field {0}.', fileName, parameterName);
            return new Error(msg);
        }
        public static viewCanntNull() {
            var msg = 'The view or viewDeferred of the page cannt null.';
            return new Error(msg);
        }
    }
} 


namespace chitu {
    var rnotwhite = (/\S+/g);

    // String to Object options format cache
    var optionsCache = {};

    // Convert String-formatted options into Object-formatted ones and store in cache
    function createOptions(options) {
        var object = optionsCache[options] = {};
        jQuery.each(options.match(rnotwhite) || [], function (_, flag) {
            object[flag] = true;
        });
        return object;
    }

    export class Callback {
        source: any
        constructor(source: any) {
            this.source = source;
        }
        add(func: Function) {
            this.source.add(func);
        }
        remove(func: Function) {
            this.source.remove(func);
        }
        has(func: Function): boolean {
            return this.source.has(func);
        }
        fireWith(context, args) {
            return this.source.fireWith(context, args);
        }
        fire(arg1?, arg2?, arg3?, arg4?) {
            return this.source.fire(arg1, arg2, arg3);
        }
    }

    export function Callbacks(options: any = null): Callback {
        // Convert options from String-formatted to Object-formatted if needed
        // (we check in cache first)
        options = typeof options === "string" ?
            (optionsCache[options] || createOptions(options)) :
            jQuery.extend({}, options);

        var // Last fire value (for non-forgettable lists)
            memory,
            // Flag to know if list was already fired
            fired,
            // Flag to know if list is currently firing
            firing,
            // First callback to fire (used internally by add and fireWith)
            firingStart,
            // End of the loop when firing
            firingLength,
            // Index of currently firing callback (modified by remove if needed)
            firingIndex,
            // Actual callback list
            list = [],
            // Stack of fire calls for repeatable lists
            stack = !options.once && [],
            // Fire callbacks
            fire = function (data) {
                memory = options.memory && data;
                fired = true;
                firingIndex = firingStart || 0;
                firingStart = 0;
                firingLength = list.length;
                firing = true;
                for (; list && firingIndex < firingLength; firingIndex++) {
                    var result = list[firingIndex].apply(data[0], data[1]);
                    //==============================================
                    // MY CODE
                    if (result != null) {
                        data[0].results.push(result);
                    }
                    //==============================================
                    if (result === false && options.stopOnFalse) {
                        memory = false; // To prevent further calls using add
                        break;
                    }
                }
                firing = false;
                if (list) {
                    if (stack) {
                        if (stack.length) {
                            fire(stack.shift());
                        }
                    } else if (memory) {
                        list = [];
                    } else {
                        self.disable();
                    }
                }
            },
            // Actual Callbacks object
            self = {
                results: [],
                // Add a callback or a collection of callbacks to the list
                add: function () {
                    if (list) {
                        // First, we save the current length
                        var start = list.length;
                        (function add(args) {
                            jQuery.each(args, function (_, arg) {
                                var type = jQuery.type(arg);
                                if (type === "function") {
                                    if (!options.unique || !self.has(arg)) {
                                        list.push(arg);
                                    }
                                } else if (arg && arg.length && type !== "string") {
                                    // Inspect recursively
                                    add(arg);
                                }
                            });
                        })(arguments);
                        // Do we need to add the callbacks to the
                        // current firing batch?
                        if (firing) {
                            firingLength = list.length;
                            // With memory, if we're not firing then
                            // we should call right away
                        } else if (memory) {
                            firingStart = start;
                            fire(memory);
                        }
                    }
                    return this;
                },
                // Remove a callback from the list
                remove: function () {
                    if (list) {
                        jQuery.each(arguments, function (_, arg) {
                            var index;
                            while ((index = jQuery.inArray(arg, list, index)) > -1) {
                                list.splice(index, 1);
                                // Handle firing indexes
                                if (firing) {
                                    if (index <= firingLength) {
                                        firingLength--;
                                    }
                                    if (index <= firingIndex) {
                                        firingIndex--;
                                    }
                                }
                            }
                        });
                    }
                    return this;
                },
                // Check if a given callback is in the list.
                // If no argument is given, return whether or not list has callbacks attached.
                has: function (fn) {
                    return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
                },
                // Remove all callbacks from the list
                empty: function () {
                    list = [];
                    firingLength = 0;
                    return this;
                },
                // Have the list do nothing anymore
                disable: function () {
                    list = stack = memory = undefined;
                    return this;
                },
                // Is it disabled?
                disabled: function () {
                    return !list;
                },
                // Lock the list in its current state
                lock: function () {
                    stack = undefined;
                    if (!memory) {
                        self.disable();
                    }
                    return this;
                },
                // Is it locked?
                locked: function () {
                    return !stack;
                },
                // Call all callbacks with the given context and arguments
                fireWith: function (context, args) {
                    context.results = [];
                    if (list && (!fired || stack)) {
                        args = args || [];
                        args = [context, args.slice ? args.slice() : args];
                        if (firing) {
                            stack.push(args);
                        } else {
                            fire(args);
                        }
                    }
                    return context.results;
                },
                // Call all the callbacks with the given arguments
                fire: function () {
                    return self.fireWith(this, arguments);
                },
                // To know if the callbacks have already been called at least once
                fired: function () {
                    return !!fired;
                },
                count: function () {
                    return list.length;
                }
            };

        return new chitu.Callback(self);
    }

    export function fireCallback(callback: chitu.Callback, args) {

        var results = callback.fire.apply(callback, args);
        var deferreds = [];
        for (var i = 0; i < results.length; i++) {
            if (chitu.Utility.isDeferred(results[i]))
                deferreds.push(results[i]);
        }

        if (deferreds.length == 0)
            return $.Deferred().resolve();

        return $.when.apply($, deferreds);
    }

    var crossroads = window['crossroads'];
    $.extend(crossroads, {
        _create: crossroads.create,
        create: function () {
            /// <returns type="Crossroads"/>
            var obj = this._create();
            obj.getRouteData = function (request, defaultArgs) {
                request = request || '';
                defaultArgs = defaultArgs || [];

                // should only care about different requests if ignoreState isn't true
                if (!this.ignoreState &&
                    (request === this._prevMatchedRequest ||
                        request === this._prevBypassedRequest)) {
                    return;
                }

                var routes = this._getMatchedRoutes(request),
                    i = 0,
                    n = routes.length,
                    cur;

                if (n == 0)
                    return null;

                if (n > 1) {
                    throw chitu.Errors.ambiguityRouteMatched(request, 'route1', 'route2');
                }
                return routes[0];
            }
            return obj;
        }
    });

} 
namespace chitu {

    var e = chitu.Errors;
    var crossroads = window['crossroads'];

    function interpolate(pattern: string, data): string {
        var http_prefix = 'http://'.toLowerCase();
        if (pattern.substr(0, http_prefix.length).toLowerCase() == http_prefix) {
            var link = document.createElement('a');
            link.setAttribute('href', pattern);

            pattern = decodeURI(link.pathname);
            var route = crossroads.addRoute(pattern);
            return http_prefix + link.host + route.interpolate(data);
        }

        var route = crossroads.addRoute(pattern);
        return route.interpolate(data);
    }

    export class Action {
        private _name: any
        private _handle: any

        constructor(controller, name, handle) {
            /// <param name="controller" type="chitu.Controller"/>
            /// <param name="name" type="String">Name of the action.</param>
            /// <param name="handle" type="Function"/>

            if (!controller) throw chitu.Errors.argumentNull('controller');
            if (!name) throw chitu.Errors.argumentNull('name');
            if (!handle) throw chitu.Errors.argumentNull('handle');
            if (!$.isFunction(handle)) throw chitu.Errors.paramTypeError('handle', 'Function');

            this._name = name;
            this._handle = handle;
        }

        name() {
            return this._name;
        }

        execute(page: chitu.Page) {
            if (!page) throw e.argumentNull('page');

            var result = this._handle.apply({}, [page]);
            return chitu.Utility.isDeferred(result) ? result : $.Deferred().resolve();
        }
    }

    export function createActionDeferred(routeData: chitu.RouteData): JQueryPromise<Action> {

        var actionName = routeData.values().action;
        if (!actionName)
            throw e.routeDataRequireAction();

        var url = interpolate(routeData.actionPath(), routeData.values()); //this.getLocation(actionName);
        var result = $.Deferred();
        requirejs([url],
            (obj) => {
                //加载脚本失败
                if (!obj) {
                    console.warn(chitu.Utility.format('加载活动“{1}.{0}”失败。', actionName, routeData.values().controller));
                    result.reject();
                }

                var func = obj.func || obj;

                if (!$.isFunction(func))
                    throw chitu.Errors.modelFileExpecteFunction(actionName);

                var action = new Action(self, actionName, func);

                result.resolve(action);
            },

            (err) => result.reject(err)
        );

        return result;
    }

    export function createViewDeferred(routeData: RouteData): JQueryPromise<string> {
        if (!routeData.values().controller)
            throw e.routeDataRequireController();

        if (!routeData.values().action)
            throw e.routeDataRequireAction();

        var url = interpolate(routeData.viewPath(), routeData.values());
        var self = this;
        var result = $.Deferred();
        var http = 'http://';
        if (url.substr(0, http.length).toLowerCase() == http) {
            //=======================================================
            // 说明：不使用 require text 是因为加载远的 html 文件，会作
            // 为 script 去解释而导致错误 
            $.ajax({ url: url })
                .done((html) => {
                    if (html != null)
                        result.resolve(html);
                    else
                        result.reject();
                })
                .fail((err) => result.reject(err));
            //=======================================================
        }
        else {
            requirejs(['text!' + url],
                (html) => {
                    if (html != null)
                        result.resolve(html);
                    else
                        result.reject();
                },
                (err) => result.reject(err));
        }

        return result;
    }
}


namespace chitu {


    var ns = chitu;
    var u = chitu.Utility;
    var e = chitu.Errors;

    function eventDeferred(callback: chitu.Callback, sender, args = {}): JQueryDeferred<any> {
        return chitu.fireCallback(callback, [sender, args]);
    };

    const PAGE_CLASS_NAME = 'page-node';
    const PAGE_HEADER_CLASS_NAME = 'page-header';
    const PAGE_BODY_CLASS_NAME = 'page-body';
    const PAGE_FOOTER_CLASS_NAME = 'page-footer';
    const PAGE_LOADING_CLASS_NAME = 'page-loading';
    const PAGE_CONTENT_CLASS_NAME = 'page-content';
    //var zindex: number;


    var LOAD_COMPLETE_HTML = '<span style="padding-left:10px;">数据已全部加载完毕</span>';

    export enum PageLoadType {
        open,
        scroll,
        pullDown,
        pullUp,
        custom
    }

    export interface PageLoading {
        show()
        hide()
    }

    export class PageLoadArguments {
        private _page: chitu.Page;

        constructor(page: chitu.Page, loadType?: PageLoadType, loading?: PageLoading) {
            if (page == null)
                throw chitu.Errors.argumentNull('page');

            this._page = page;
            this.loadType = loadType;
            this.loading = loading;
        }
        loadType: PageLoadType
        loading: PageLoading
        set enableScrollLoad(value: boolean) {
            (<any>this._page).enableScrollLoad = value;
        }
        get enableScrollLoad(): boolean {
            return (<any>this._page).enableScrollLoad;
        }
    }

    enum ShowTypes {
        swipeLeft,
        swipeRight,
        none
    }

    enum PageNodeParts {
        header = 1,
        body = 2,
        loading = 4,
        footer = 8
    }

    enum PageStatus {
        open,
        closed
    }

    export enum SwipeDirection {
        None,
        Left,
        Right,
        Up,
        Donw,
    }

    export enum ScrollType {
        IScroll,
        Div,
        Document,
    }

    class PageNodes {
        container: HTMLElement
        header: HTMLElement
        body: HTMLElement
        footer: HTMLElement
        loading: HTMLElement
        content: HTMLElement

        constructor(node: HTMLElement) {
            node.className = PAGE_CLASS_NAME;
            this.container = node;

            this.header = document.createElement('div');
            this.header.className = PAGE_HEADER_CLASS_NAME;
            //this.headerNode.style.display = 'none';
            node.appendChild(this.header);

            this.body = document.createElement('div');
            this.body.className = PAGE_BODY_CLASS_NAME;
            //$(this.body).hide();
            node.appendChild(this.body);

            this.content = document.createElement('div');
            this.content.className = PAGE_CONTENT_CLASS_NAME;
            $(this.content).hide();
            this.body.appendChild(this.content);

            this.loading = document.createElement('div');
            this.loading.className = PAGE_LOADING_CLASS_NAME;
            this.loading.innerHTML = '<div class="spin"><i class="icon-spinner icon-spin"></i><div>';
            $(this.loading).hide();
            this.body.appendChild(this.loading);

            this.footer = document.createElement('div');
            this.footer.className = PAGE_FOOTER_CLASS_NAME;
            //this.footerNode.style.display = 'none';
            node.appendChild(this.footer);
        }
    }

    class PageBottomLoading implements PageLoading {
        private LOADDING_HTML = '<i class="icon-spinner icon-spin"></i><span style="padding-left:10px;">数据正在加载中...</span>';
        private _page: chitu.Page;
        private _scrollLoad_loading_bar: HTMLElement;

        constructor(page: chitu.Page) {
            if (!page)
                throw chitu.Errors.argumentNull('page');

            this._page = page;

            this._scrollLoad_loading_bar = document.createElement('div');
            this._scrollLoad_loading_bar.innerHTML = '<div name="scrollLoad_loading" style="padding:10px 0px 10px 0px;"><h5 class="text-center"></h5></div>';
            this._scrollLoad_loading_bar.style.display = 'none';
            $(this._scrollLoad_loading_bar).find('h5').html(this.LOADDING_HTML);
            page.nodes().content.appendChild(this._scrollLoad_loading_bar);
        }
        show() {
            if (this._scrollLoad_loading_bar.style.display == 'block')
                return;

            this._scrollLoad_loading_bar.style.display = 'block';
            this._page.refreshUI();
        }
        hide() {
            if (this._scrollLoad_loading_bar.style.display == 'none')
                return;

            this._scrollLoad_loading_bar.style.display = 'none';
            this._page.refreshUI();
        }
    }


    export class Page {
        static animationTime: number = 300
        //private _context: ControllerContext
        private _name: string
        private _viewDeferred: JQueryPromise<string>
        private _actionDeferred: JQueryPromise<Action>

        private _loadViewModelResult = null
        private _openResult: JQueryDeferred<any> = null
        private _hideResult = null;
        private _pageNode: PageNodes;
        private _showTime = Page.animationTime;
        private _hideTime = Page.animationTime
        private _prevous: chitu.Page;
        private ios_scroller: IOSScroll;
        private _routeData: chitu.RouteData;
        private _enableScrollLoad = false;
        private is_closed = false;
        private _scrollLoad_loading_bar: HTMLElement;
        private actionExecuted = $.Deferred<boolean>();
        private isActionExecuted = false;
        private _scrollType: ScrollType;
        private _formLoading: PageLoading;
        private _bottomLoading: PageLoading;

        preLoad = ns.Callbacks();
        load = ns.Callbacks();
        loadCompleted = ns.Callbacks();
        closing = ns.Callbacks();
        closed = ns.Callbacks();
        scroll = ns.Callbacks();
        showing = ns.Callbacks();
        shown = ns.Callbacks();
        hiding = ns.Callbacks();
        hidden = ns.Callbacks();
        scrollEnd = ns.Callbacks();
        viewChanged = $.Callbacks();



        constructor(element: HTMLElement, scrollType: ScrollType, previous?: chitu.Page) {
            if (!element) throw e.argumentNull('element');
            if (scrollType == null) throw e.argumentNull('scrollType');

            this._prevous = previous;
            this._pageNode = new PageNodes(element);
            this.disableHeaderFooterTouchMove();

            this._scrollType = scrollType;
            if (scrollType == ScrollType.IScroll) {
                $(this.nodes().container).addClass('ios');
                this.ios_scroller = new IOSScroll(this);
                gesture.enable_iscroll_gesture(this, null, null);
            }
            else if (scrollType == ScrollType.Div) {
                $(this.nodes().container).addClass('div');
                new DivScroll(this);
                gesture.enable_divfixed_gesture(this, null, null);
            }
            else if (scrollType == ScrollType.Document) {
                $(this.nodes().container).addClass('doc');
                new DocumentScroll(this);
            }

            this.scrollEnd.add(Page.page_scrollEnd);
            // if (previous)
            //     previous.closed.add(() => this.close());


        }
        private createPageLoadArguments(args, loadType: PageLoadType, loading: PageLoading): PageLoadArguments {
            var result: PageLoadArguments = new PageLoadArguments(this, loadType, loading);
            result = $.extend(result, args || {});

            return result;
        }
        get formLoading(): PageLoading {
            if (this._formLoading == null) {
                this._formLoading = {
                    show: () => {
                        if ($(this.nodes().loading).is(':visible'))
                            return;

                        $(this.nodes().loading).show();
                        $(this.nodes().content).hide();
                    },
                    hide: () => {
                        $(this.nodes().loading).hide();
                        $(this.nodes().content).show();
                    }
                }
            }
            return this._formLoading;
        }
        set formLoading(value: PageLoading) {
            if (!value)
                throw chitu.Errors.argumentNull('value');

            this._formLoading = value;
        }
        get bottomLoading(): PageLoading {
            if (this._bottomLoading == null)
                this._bottomLoading = new PageBottomLoading(this);

            return this._bottomLoading;
        }
        set bottomLoading(value: PageLoading) {
            if (!value)
                throw chitu.Errors.argumentNull('value');

            this._bottomLoading = value;
        }
        get view(): JQueryPromise<string> {
            return this._viewDeferred;
        }
        set view(value: JQueryPromise<string>) {
            this._viewDeferred = value;
        }
        get action(): JQueryPromise<Action> {
            return this._actionDeferred;
        }
        set action(value: JQueryPromise<Action>) {
            this._actionDeferred = value;
        }
        private get enableScrollLoad(): boolean {
            return this._enableScrollLoad;
        }
        private set enableScrollLoad(value: boolean) {
            this._enableScrollLoad = value;
        }
        private set viewHtml(value: string) {
            this.nodes().content.innerHTML = value;

            var q = this.nodes().content.querySelector('[ch-part="header"]');
            if (q) this.nodes().header.appendChild(q);

            q = this.nodes().content.querySelector('[ch-part="footer"]');
            if (q) this.nodes().footer.appendChild(q);

            this.viewChanged.fire();
        }
        private get viewHtml(): string {
            return this.nodes().container.innerHTML;
        }
        static getPageName(routeData: RouteData): string {
            var name: string;
            if (routeData.pageName()) {
                var route = window['crossroads'].addRoute(routeData.pageName());
                name = route.interpolate(routeData.values());
            }
            else {
                name = routeData.values().controller + '.' + routeData.values().action;
            }
            return name;
        }
        get routeData(): chitu.RouteData {
            return this._routeData;
        }
        set routeData(value: chitu.RouteData) {
            this._routeData = value;
        }
        get name(): string {
            if (!this._name)
                this._name = Page.getPageName(this.routeData);

            return this._name;
        }
        node(): HTMLElement {
            /// <returns type="HTMLElement"/>
            return this._pageNode.container;
        }
        nodes(): PageNodes {
            return this._pageNode;
        }
        get previous(): chitu.Page {
            return this._prevous;
        }
        get scrollType(): ScrollType {
            return this._scrollType;
        }
        hide(swipe?: SwipeDirection) {
            if (!$(this.node()).is(':visible'))
                return;

            swipe = swipe || SwipeDirection.None;
            this.hidePageNode(swipe);
        }
        show(swipe?: SwipeDirection) {
            if ($(this.node()).is(':visible'))
                return;

            swipe = swipe || SwipeDirection.None;
            this.showPageNode(swipe);
        }
        visible() {
            return this.node().style.display == 'block';
        }
        private hidePageNode(swipe: SwipeDirection): JQueryDeferred<any> {
            this.on_hiding({});

            if (!window['move']) {
                swipe = SwipeDirection.None;
                console.warn('Move is not loaded and swipe is auto disabled.');
            }

            var result = $.Deferred();
            var container_width = $(this.nodes().container).width();
            var container_height = $(this.nodes().container).height();

            var on_end = () => {
                this.node().style.display = 'none';
                result.resolve();
                this.on_hidden({});
            };

            switch (swipe) {
                case SwipeDirection.None:
                default:
                    on_end();
                    break;
                case SwipeDirection.Up:
                    move(this.nodes().container).y(container_height).end()
                        .y(0 - container_height).duration(this._hideTime).end(on_end);
                    break;
                case SwipeDirection.Donw:
                    move(this.nodes().container).y(container_height).duration(this._hideTime).end(on_end);
                    break;
                case SwipeDirection.Right:
                    move(this.node())
                        .x(container_width)
                        .duration(this._hideTime)
                        .end(on_end);
                    break;
                case SwipeDirection.Left:
                    move(this.node())
                        .x(0 - container_width)
                        .duration(this._hideTime)
                        .end(on_end);
                    break;
            }

            return result;
        }
        private showPageNode(swipe: SwipeDirection): JQueryPromise<any> {
            if (!window['move']) {
                swipe = SwipeDirection.None;
                console.warn('Move is not loaded and swipe is auto disabled.');
            }

            this.on_showing({});
            var result = $.Deferred();

            this.node().style.display = 'block';
            //if ($(this.nodes().loading).is(':visible'))
            //    $(this.nodes().loading).hide();

            var container_width = $(this.nodes().container).width();
            var container_height = $(this.nodes().container).height();
            var on_end = () => {
                result.resolve();
            };

            switch (swipe) {
                case SwipeDirection.None:
                default:
                    on_end();
                    break;
                case SwipeDirection.Donw:
                    move(this.node()).y(0 - container_height).duration(0).end(on_end);
                    move(this.node()).y(0).duration(0).end(on_end);
                    break;
                case SwipeDirection.Up:
                    move(this.node()).y(container_height).duration(0).end();
                    move(this.node()).y(0).duration(this._showTime).end(on_end);
                    break;
                case SwipeDirection.Right:
                    move(this.node()).x(0 - container_width).duration(0).end()
                    move(this.node()).x(0).duration(this._showTime).end(on_end);
                    break;
                case SwipeDirection.Left:
                    move(this.node()).x(container_width).duration(0).end();
                    move(this.node()).x(0).duration(this._showTime).end(on_end);
                    break;
            }

            result.done(() => {
                //if (this._prevous != null)
                //    this._prevous.hide();
                
                this.on_shown({});
            });

            return result;
        }

        //private ensureScrollLoadingBar() {
        //    if (this.scrollLoad_loading_bar == null) {
        //        this.scrollLoad_loading_bar = document.createElement('div');
        //        this.scrollLoad_loading_bar.innerHTML = '<div name="scrollLoad_loading" style="padding:10px 0px 10px 0px;"><h5 class="text-center"></h5></div>';
        //        this.scrollLoad_loading_bar.style.display = 'none';
        //        $(this.scrollLoad_loading_bar).find('h5').html(LOADDING_HTML);
        //        this.nodes().content.appendChild(this.scrollLoad_loading_bar);
        //    }
        //}
        //private get scrollLoad_loading_bar(): HTMLElement {
        //    if (this._scrollLoad_loading_bar == null) {
        //        this._scrollLoad_loading_bar = document.createElement('div');
        //        this._scrollLoad_loading_bar.innerHTML = '<div name="scrollLoad_loading" style="padding:10px 0px 10px 0px;"><h5 class="text-center"></h5></div>';
        //        this._scrollLoad_loading_bar.style.visibility = 'hidden';
        //        $(this._scrollLoad_loading_bar).find('h5').html(LOADDING_HTML);
        //        this.nodes().content.appendChild(this._scrollLoad_loading_bar);
        //        this.refreshUI();
        //    }
        //    return this._scrollLoad_loading_bar;
        //}
        //private showScrollLoadingBar() {
        //    //this.ensureScrollLoadingBar();
        //    if (this.scrollLoad_loading_bar.style.visibility == 'hidden') {
        //        this.scrollLoad_loading_bar.style.visibility = 'visible';
        //        //this.refreshUI();
        //    }
        //}
        //private hideScrollLoadingBar() {
        //    //this.ensureScrollLoadingBar();
        //    if (this.scrollLoad_loading_bar.style.visibility == 'visible') {
        //        this.scrollLoad_loading_bar.style.visibility = 'hidden';
        //        //this.refreshUI();
        //    }
        //}
        private fireEvent(callback: chitu.Callback, args) {
            if (this.actionExecuted.state() == 'resolved')
                return eventDeferred(callback, this, args);

            return this.actionExecuted.pipe(() => eventDeferred(callback, this, args));
        }
        private disableHeaderFooterTouchMove() {
            $([this.nodes().footer, this.nodes().header]).on('touchmove', function(e) {
                e.preventDefault();
            })
        }
        on_load(args: PageLoadArguments | { loadType: PageLoadType, loading?: PageLoading }) {

            var load_args: PageLoadArguments = args instanceof PageLoadArguments ?
                args : new PageLoadArguments(this, args.loadType, args.loading);

            if (load_args.loading == null) {
                load_args.loading = load_args.loadType == chitu.PageLoadType.scroll ? this.bottomLoading : this.formLoading;
            }

            load_args.loading.show();
            var result = this.fireEvent(this.load, load_args);
            result.done(() => load_args.loading.hide());

            //===============================================================
            // 必须是 view 加载完成，并且 on_load 完成后，才触发 on_loadCompleted 事件
            if (this.view == null) {
                result.done(() => this.on_loadCompleted(load_args));
            }
            else {
                if (this.view.state() == 'resolved') {
                    result.done(() => this.on_loadCompleted(load_args));
                }
                else {
                    $.when(this.view, result).done(() => this.on_loadCompleted(load_args));
                }
            }
            //===============================================================

            return result;
        }
        on_loadCompleted(args) {
            return this.fireEvent(this.loadCompleted, args).done(() => {
                window.setTimeout(() => this.refreshUI(), 100);
            });
        }
        on_closing(args) {
            return this.fireEvent(this.closing, args);
        }
        on_closed(args) {
            return this.fireEvent(this.closed, args);
        }
        on_scroll(args) {
            return this.fireEvent(this.scroll, args);
        }
        on_showing(args) {
            return this.fireEvent(this.showing, args);
        }
        on_shown(args) {
            return this.fireEvent(this.shown, args);
        }
        on_hiding(args) {
            return this.fireEvent(this.hiding, args);
        }
        on_hidden(args) {
            return this.fireEvent(this.hidden, args);
        }
        on_scrollEnd(args) {
            return this.fireEvent(this.scrollEnd, args);
        }
        open(args?: Object, swipe?: SwipeDirection): JQueryPromise<any> {
            /// <summary>
            /// Show the page.
            /// </summary>
            /// <param name="args" type="Object">
            /// The value passed to the show event functions.
            /// </param>
            if (this._openResult)
                return this._openResult;

            //不能多次打开？？？

            swipe = swipe || SwipeDirection.None;
            var result = this.showPageNode(swipe);

            var load_args = this.createPageLoadArguments(args, chitu.PageLoadType.open, this.formLoading);
            load_args.loading.show();

            if (this.view == null && this.viewHtml == null) {
                throw chitu.Errors.viewCanntNull();
            }

            if (this.action) {
                this.action.done((action) => {
                    action.execute(this);
                    this.actionExecuted.resolve();

                    if (this.view) {
                        this.view.done((html) => this.viewHtml = html);
                    }

                    this.on_load(load_args);
                });
            }

            return result;
        }
        close(args?: Object, swipe?: SwipeDirection) {
            /// <summary>
            /// Colse the page.
            /// </summary>
            /// <param name="args" type="Object" canBeNull="true">
            /// The value passed to the hide event functions.
            /// </param>

            if (this.is_closed)
                return;

            this.on_closing(args);

            if (this.visible()) {
                this.hidePageNode(swipe).done(() => {
                    //$(this.node()).remove();
                    this.node().parentNode.removeChild(this.node());
                });
            }
            else {
                //$(this.node()).remove();
                this.node().parentNode.removeChild(this.node());
            }

            args = args || {};
            this.on_closed(args);
            this.is_closed = true;
        }

        private static page_scrollEnd(sender: chitu.Page, args) {
            //scrollStatus = ScrollStatus.ScrollEnd;

            var scrollTop = args.scrollTop;
            var scrollHeight = args.scrollHeight;
            var clientHeight = args.clientHeight;
        
            //====================================================================

            var marginBottom = clientHeight / 3;
            if (clientHeight + scrollTop < scrollHeight - marginBottom)
                return;

            if (!sender.enableScrollLoad)
                return;

            var scroll_arg = $.extend(sender.routeData.values(), <PageLoadArguments>{
                loadType: PageLoadType.scroll,
                loading: sender.bottomLoading,
            });
            var result = sender.on_load(scroll_arg);
        }

        refreshUI() {
            if (this.ios_scroller) {    //仅 IOS 需要刷新
                this.ios_scroller.refresh();
            }
        }
    }
};

namespace chitu {
    export class PageContext {
        private _view: JQueryPromise<string>;
        private _routeData: RouteData;
        constructor(view: JQueryPromise<string>, routeData: RouteData) {
            this._view = view;
            this._routeData = routeData;
        }
        public view(): JQueryPromise<string> {
            return this._view;
        }
        public routeData(): RouteData {
            return this._routeData;
        }
    }
}

namespace chitu {
    export class Route {
        private _name: string;
        private _pattern: string;
        private _defaults: Object;

        viewPath: string;
        actionPath: string;

        constructor(name: string, pattern: string, defaults: Object) {
            this._name = name
            this._pattern = pattern;
            this._defaults = defaults;
        }
        public name(): string {
            return this._name;
        }
        public defaults(): Object {
            return this._defaults;
        }
        public url(): string {
            return this._pattern;
        }
    }


}

namespace chitu {
    var ns = chitu;
    var e = chitu.Errors;

    export class RouteCollection {
        _source: any
        _priority: number
        _defaultRoute: chitu.Route
        static defaultRouteName: string = 'default';

        _defaults: {}

        constructor() {
            this._init();
        }

        _init() {
            var crossroads = window['crossroads']
            this._source = crossroads.create();
            this._source.ignoreCase = true;
            this._source.normalizeFn = crossroads.NORM_AS_OBJECT;
            this._priority = 0;
        }
        count() {
            return this._source.getNumRoutes();
        }

        mapRoute(args) {//name, url, defaults
            /// <param name="args" type="Objecct"/>
            args = args || {};

            var name = args.name;
            var url = args.url;
            var defaults = args.defaults;
            var rules = args.rules || {};

            if (!name) throw e.argumentNull('name');
            if (!url) throw e.argumentNull('url');

            this._priority = this._priority + 1;

            var route = new chitu.Route(name, url, defaults);
            route.viewPath = args.viewPath;
            route.actionPath = args.actionPath;

            var originalRoute = this._source.addRoute(url, function (args) {
                //var values = $.extend(defaults, args);
                //self.routeMatched.fire([name, values]);
            }, this._priority);

            originalRoute.rules = rules;
            originalRoute.newRoute = route;

            if (this._defaultRoute == null) {
                this._defaultRoute = route;
                if (this._defaultRoute.viewPath == null)
                    throw new Error('default route require view path.');

                if (this._defaultRoute.actionPath == null)
                    throw new Error('default route require action path.');
            }

            route.viewPath = route.viewPath || this._defaultRoute.viewPath;
            route.actionPath = route.actionPath || this._defaultRoute.actionPath;

            return route;
        }

        getRouteData(url): chitu.RouteData {
            /// <returns type="Object"/>
            var data = this._source.getRouteData(url);
            if (data == null)
                throw e.canntParseUrl(url);

            var values: any = {};
            var paramNames = data.route._paramsIds || [];
            for (var i = 0; i < paramNames.length; i++) {
                var key = paramNames[i];
                values[key] = data.params[0][key];
            }

            var routeData = new chitu.RouteData(url);
            routeData.values(values);
            routeData.actionPath(data.route.newRoute.actionPath);
            routeData.viewPath(data.route.newRoute.viewPath);

            return routeData;
        }
    }
}
namespace chitu {
    export class RouteData {
        private _values: any;
        private _viewPath: string;
        private _actionPath: string;
        private _pageName: string;
        private _url: string;

        constructor(url: string) {
            this._url = url;
        }

        public values(value: any = undefined): any {
            if (value !== undefined)
                this._values = value;

            return this._values;
        }

        public viewPath(value: string = undefined): string {
            if (value !== undefined)
                this._viewPath = value;

            return this._viewPath;
        }

        public actionPath(value: string = undefined): string {
            if (value !== undefined)
                this._actionPath = value;

            return this._actionPath;
        }

        public pageName(value: string = undefined): string {
            if (value !== undefined)
                this._pageName = value;

            return this._pageName;
        }

        public url(): string {
            return this._url;
        }
    }
}

namespace chitu {

    var ns = chitu;
    var u = chitu.Utility;
    var e = chitu.Errors;
    //var zindex = 500;
    var PAGE_STACK_MAX_SIZE = 10;
    var ACTION_LOCATION_FORMATER = '{controller}/{action}';
    var VIEW_LOCATION_FORMATER = '{controller}/{action}';

    export interface ApplicationConfig {
        container: () => HTMLElement | HTMLElement,
        openSwipe?: (page: chitu.RouteData) => SwipeDirection,
        scrollType?: (page: chitu.RouteData) => ScrollType,
        closeSwipe?: (page: chitu.RouteData) => SwipeDirection,
    }

    export class Application {
        pageCreating: chitu.Callback = ns.Callbacks();
        pageCreated: chitu.Callback = ns.Callbacks();

        private page_stack: chitu.Page[] = [];
        private _config: ApplicationConfig;
        private _routes: chitu.RouteCollection = new RouteCollection();
        private _runned: boolean = false;
        private zindex: number;
        private back_deferred: JQueryDeferred<any>;
        private start_flag_hash: string;
        private start_hash: string;

        constructor(config: ApplicationConfig) {
            if (config == null)
                throw e.argumentNull('container');

            if (!config.container) {
                throw new Error('The config has not a container property.');
            }

            if (!$.isFunction(config.container) && !config.container['tagName'])
                throw new Error('Parameter container is not a function or html element.');

            //this._container = config['container'];
            this._config = config;
            this._config.openSwipe = config.openSwipe || function(routeData: chitu.RouteData) { return SwipeDirection.None; };
            this._config.closeSwipe = config.closeSwipe || function(routeData: chitu.RouteData) { return SwipeDirection.None; };
            this._config.scrollType = config.scrollType || function(routeData: chitu.RouteData) { return ScrollType.Document };
        }

        get config(): chitu.ApplicationConfig {
            return this._config;
        }

        on_pageCreating(context: chitu.PageContext) {
            return chitu.fireCallback(this.pageCreating, [this, context]);
        }
        on_pageCreated(page: chitu.Page, context: chitu.PageContext) {
            //this.pageCreated.fire(this, page);
            return chitu.fireCallback(this.pageCreated, [this, page]);
        }
        public routes(): RouteCollection {
            return this._routes;
        }
        public currentPage(): chitu.Page {
            if (this.page_stack.length > 0)
                return this.page_stack[this.page_stack.length - 1];

            return null;
        }
        private previousPage(): chitu.Page {
            if (this.page_stack.length > 1)
                return this.page_stack[this.page_stack.length - 2];

            return null;
        }
        protected hashchange() {
            if (window.location['skip'] == true) {
                window.location['skip'] = false;
                return;
            }

            var back_deferred: JQueryDeferred<any>
            if (this.back_deferred && this.back_deferred['processed'] == null) {
                back_deferred = this.back_deferred;
                back_deferred['processed'] = true;
            }

            var hash = window.location.hash;
            if (!hash || hash == this.start_flag_hash) {
                if (!hash)
                    console.log('The url is not contains hash.url is ' + window.location.href);

                if (hash == this.start_flag_hash) {
                    window.history.pushState({}, '', this.start_hash);
                    console.log('The hash is start url, the hash is ' + hash);
                }

                if (back_deferred)
                    back_deferred.reject();

                return;
            }

            if (!this.start_flag_hash) {
                //TODO:生成随机字符串
                this.start_flag_hash = '#AABBCCDDEEFF';
                this.start_hash = hash;
                window.history.replaceState({}, '', this.start_flag_hash);
                window.history.pushState({}, '', hash);
            }

            var current_page_url: string = '';
            if (this.previousPage() != null)
                current_page_url = this.previousPage().routeData.url();

            if (current_page_url.toLowerCase() == hash.substr(1).toLowerCase()) {
                this.closeCurrentPage();
            }
            else {
                var args = window.location['arguments'] || {};
                window.location['arguments'] = null;
                this.showPage(hash.substr(1), args);
            }

            if (back_deferred)
                back_deferred.resolve();
        }

        public run() {
            if (this._runned) return;

            var app = this;

            $.proxy(this.hashchange, this)();
            $(window).bind('hashchange', $.proxy(this.hashchange, this));

            this._runned = true;
        }
        public getCachePage(name: string): chitu.Page {
            for (var i = this.page_stack.length - 1; i >= 0; i--) {
                if (this.page_stack[i].name == name)
                    return this.page_stack[i];
            }
            return null;
        }
        public showPage(url: string, args): chitu.Page {

            args = args || {};

            if (!url) throw e.argumentNull('url');

            var routeData = this.routes().getRouteData(url);
            if (routeData == null) {
                throw e.noneRouteMatched(url);
            }

            var container: HTMLElement;
            if ($.isFunction(this.config.container)) {
                container = (<Function>this.config.container)(routeData.values());
                if (container == null)
                    throw new Error('The result of continer function cannt be null');
            }
            else {
                container = <any>this.config.container;
            }

            var previous = this.currentPage();

            var page_node = document.createElement('div');
            container.appendChild(page_node);
            var page = this.createPage(url, page_node, previous);
            this.page_stack.push(page);
            console.log('page_stack lenght:' + this.page_stack.length);
            if (this.page_stack.length > PAGE_STACK_MAX_SIZE) {
                var p = this.page_stack.shift();
                p.close({});
            }

            var swipe = this.config.openSwipe(routeData);
            $.extend(args, routeData.values());

            page.open(args, swipe).done(() => {
                if (previous)
                    previous.hide();
            });

            return page;
        }
        protected createPageNode(): HTMLElement {
            var element = document.createElement('div');
            return element;
        }
        private closeCurrentPage() {
            var current = this.currentPage();
            var previous = this.previousPage();

            if (current != null) {
                var swipe = this.config.closeSwipe(current.routeData);
                current.close({}, swipe);

                if (previous != null)
                    previous.show();

                this.page_stack.pop();
                console.log('page_stack lenght:' + this.page_stack.length);
            }
        }
        private createPage(url: string, container: HTMLElement, previousPage?: chitu.Page) {
            if (!url)
                throw e.argumentNull('url');

            if (!container)
                throw e.argumentNull('element');

            var routeData = this.routes().getRouteData(url);
            if (routeData == null) {
                throw e.noneRouteMatched(url);
            }

            var controllerName = routeData.values().controller;
            var actionName = routeData.values().action;
            var view_deferred = createViewDeferred(routeData);
            var action_deferred = createActionDeferred(routeData);
            var context = new ns.PageContext(view_deferred, routeData);

            this.on_pageCreating(context);
            var scrollType = this.config.scrollType(routeData);
            var page = new ns.Page(container, scrollType, previousPage);
            page.routeData = routeData;
            page.view = view_deferred;
            page.action = action_deferred;

            this.on_pageCreated(page, context);

            return page;
        }
        public redirect(url: string, args = {}): chitu.Page {
            window.location['skip'] = true;
            window.location.hash = url;
            return this.showPage(url, args);
        }
        public back(args = undefined): JQueryPromise<any> {
            this.back_deferred = $.Deferred();
            if (window.history.length == 0) {
                this.back_deferred.reject();
                return this.back_deferred;
            }

            window.history.back();
            return this.back_deferred;
        }
    }
} 
namespace chitu {
    export class ScrollArguments {
        scrollTop: number
        scrollHeight: number
        clientHeight: number
    }

    export class DivScroll {
        constructor(page: chitu.Page) {
            //============================================================
            // 说明：实现滚动结束检测
            var cur_scroll_args: ScrollArguments = new ScrollArguments();
            var pre_scroll_top: number;
            var checking_num: number;
            var CHECK_INTERVAL = 300;
            var scrollEndCheck = (page: chitu.Page) => {
                if (checking_num != null) return;
                //======================
                // 锁定，不让滚动期内创建二次，因setInterval有一定的时间。
                checking_num = 0;
                //======================
                checking_num = window.setInterval(() => {
                    if (pre_scroll_top == cur_scroll_args.scrollTop) {
                        window.clearInterval(checking_num);
                        checking_num = null;
                        pre_scroll_top = null;

                        //page['on_scrollEnd'](cur_scroll_args);
                        page.on_scrollEnd(cur_scroll_args);

                        return;
                    }
                    pre_scroll_top = cur_scroll_args.scrollTop;

                }, CHECK_INTERVAL);
            }
            //========================================================
            var wrapper_node = page.nodes().body;
            wrapper_node.onscroll = () => {
                var args = {
                    scrollTop: wrapper_node.scrollTop,
                    scrollHeight: wrapper_node.scrollHeight,
                    clientHeight: wrapper_node.clientHeight
                };

                page.on_scroll(args);

                cur_scroll_args.clientHeight = args.clientHeight;
                cur_scroll_args.scrollHeight = args.scrollHeight;
                cur_scroll_args.scrollTop = args.scrollTop;
                scrollEndCheck(page);
            };

        }
    }
}


namespace chitu {
    var cur_scroll_args: ScrollArguments = new ScrollArguments();
    var pre_scroll_top: number;
    var checking_num: number;
    var CHECK_INTERVAL = 300;

    function scrollEndCheck(page: chitu.Page) {
        if (checking_num != null) return;
        //======================
        // 锁定，不让滚动期内创建二次，因setInterval有一定的时间。
        checking_num = 0;
        //======================
        checking_num = window.setInterval(() => {
            if (pre_scroll_top == cur_scroll_args.scrollTop) {
                window.clearInterval(checking_num);
                checking_num = null;
                pre_scroll_top = null;

                page.on_scrollEnd(cur_scroll_args);

                return;
            }
            pre_scroll_top = cur_scroll_args.scrollTop;

        }, CHECK_INTERVAL);
    }


    export class DocumentScroll {
        constructor(page: chitu.Page) {
            $(document).scroll(function(event) {
                if (!page.visible())
                    return;

                var args = {
                    scrollTop: $(document).scrollTop(),
                    scrollHeight: document.body.scrollHeight,
                    clientHeight: $(window).height()
                };

                cur_scroll_args.clientHeight = args.clientHeight;
                cur_scroll_args.scrollHeight = args.scrollHeight;
                cur_scroll_args.scrollTop = args.scrollTop;

                $(page.node()).data(page.name + '_scroll_top', args.scrollTop);
                scrollEndCheck(page);
            });

            page.shown.add((sender: chitu.Page) => {
                var value = $(page.node()).data(page.name + '_scroll_top');
                if (value != null)
                    $(document).scrollTop(new Number(value).valueOf());
            });

            //page.shown.add(function (sender) {
            //    // 说明：显示页面，scrollTop 定位
            //    sender.scrollTop($(sender.node()).data(scroll_top_data_name) || '0px');
            //});

            //page.scroll.add(function (sender, args) {
            //    $(sender.node()).data(scroll_top_data_name, sender.scrollTop());
            //});

        }
    }
}
namespace chitu {
    export class IOSScroll {

        private iscroller: IScroll;

        constructor(page: chitu.Page) {
            requirejs(['iscroll'], () => this.init(page));
        }

        private init(page: chitu.Page) {
            var options = {
                tap: true,
                useTransition: false,
                HWCompositing: false,
                preventDefault: true,   // 必须设置为 True，否是在微信环境下，页面位置在上拉，或下拉时，会移动。
                probeType: 1,
                //bounce: true,
                //bounceTime: 600
            }

            var iscroller = this.iscroller = page['iscroller'] = new IScroll(page.nodes().body, options);

            //window.setTimeout(() => iscroller.refresh(), 1000);

            iscroller.on('scrollEnd', function() {
                var scroller = <IScroll>this;
                var args = {
                    scrollTop: 0 - scroller.y,
                    scrollHeight: scroller.scrollerHeight,
                    clientHeight: scroller.wrapperHeight
                };

                console.log('directionY:' + scroller.directionY);
                console.log('startY:' + scroller.startY);
                console.log('scroller.y:' + scroller.y);
                page.on_scrollEnd(args);
            });

            iscroller.on('scroll', function() {
                var scroller = <IScroll>this;
                var args = {
                    scrollTop: 0 - scroller.y,
                    scrollHeight: scroller.scrollerHeight,
                    clientHeight: scroller.wrapperHeight
                };

                console.log('directionY:' + scroller.directionY);
                console.log('startY:' + scroller.startY);
                console.log('scroller.y:' + scroller.y);
                page.on_scroll(args);
            });

            (function(scroller: IScroll, wrapperNode: HTMLElement) {

                $(wrapperNode).on('tap', (event) => {
                    if (page['iscroller'].enabled == false)
                        return;

                    var MAX_DEEPH = 4;
                    var deeph = 1;
                    var node = <HTMLElement>event.target;
                    while (node != null) {
                        if (node.tagName == 'A')
                            return window.open($(node).attr('href'), '_self');

                        node = <HTMLElement>node.parentNode;
                        deeph = deeph + 1;
                        if (deeph > MAX_DEEPH)
                            return;
                    }
                })

            })(iscroller, page.nodes().body);

            page.closing.add(() => iscroller.destroy());

            $(window).on('resize', () => {
                window.setTimeout(() => iscroller.refresh(), 500);
            });
        }

        refresh() {
            if (this.iscroller)
                this.iscroller.refresh();
        }
    }

    (<any>chitu).scroll = (page: chitu.Page, config) => {


        $(page.nodes().body).addClass('wrapper');
        $(page.nodes().content).addClass('scroller');

        var wrapperNode = page['_wrapperNode'] = page.nodes().body;
        page['_scrollerNode'] = page.nodes().content;

        //$.extend(page, {
        //    scrollEnd: chitu.Callbacks(),
        //    on_scrollEnd: function (args) {
        //        return chitu.fireCallback(this.scrollEnd, [this, args]);
        //    },
        //    scrollTop: $.proxy((value: number | string) => {
        //        if (value === undefined)
        //            return (0 - page['iscroller'].y) + 'px';

        //        if (typeof value === 'string')
        //            value = new Number((<string>value).substr(0, (<string>value).length - 2)).valueOf();

        //        var scroller = this['iscroller'];
        //        if (scroller) {
        //            scroller.scrollTo(0, value);
        //        }
        //    }, page)
        //})

        //var page_shown = (sender: chitu.Page) => {
        //    window.setTimeout(() => {
        //        sender['iscroller'].refresh();
        //    }, 500);
        //}

        //page.shown.add(page_shown);
        //if (page.visible())
        //    page_shown(page);



    }
}
namespace chitu.gesture {
    export function createPullDownBar(page: chitu.Page, config): PullDownBar {
        config = config || {};
        config = $.extend({
            text: function (status) {
                (<HTMLElement>this.element).innerHTML = PullDownStateText[status];
            }
        }, config);

        var node = <HTMLElement>config.element;
        var status: string;
        if (node == null) {
            node = document.createElement('div');
            node.className = 'page-pulldown';
            node.innerHTML = PullUpStateText.init;

            var cn = page.nodes().content;
            if (cn.childNodes.length == 0) {
                cn.appendChild(node);
            }
            else {
                cn.insertBefore(node, cn.childNodes[0]);
            }

            config.element = node;
        }

        var bar = new PullDownBar(config);
        return bar;
    }
    //export function createMove(page: chitu.Page): Move {
    //    var m: Move;
    //    m = move(page.nodes().content);
    //    return m;
    //}
    export class config {
        static PULLDOWN_EXECUTE_CRITICAL_HEIGHT = 60;   //刷新临界高度值，大于这个高度则进行刷新
        static PULLUP_EXECUTE_CRITICAL_HEIGHT = 60;
        static PULL_DOWN_MAX_HEIGHT = 150;
        static PULL_UP_MAX_HEIGHT = 150;
        static MINI_MOVE_DISTANCE = 3;
    }
    export class RefreshState {
        static init = 'init'
        static ready = 'ready'
        static doing = 'doing'
        static done = 'done'
    }
    export class PullDownStateText {
        static init = '<div style="padding-top:10px;">下拉可以刷新</div>'
        static ready = '<div style="padding-top:10px;">松开后刷新</div>'
        static doing = '<div style=""><i class="icon-spinner icon-spin"></i><span>&nbsp;正在更新中</span></div>'
        static done = '<div style="padding-top:10px;">更新完毕</div>'
    }
    export class PullUpStateText {
        static init = '上拉可以刷新'
        static ready = '松开后刷新'
        static doing = '<div><i class="icon-spinner icon-spin"></i><span>&nbsp;正在更新中</span></div>'
        static done = '更新完毕'
    }
    export class PullDownBar {
        private _status: string;
        private _config: any;

        constructor(config) {
            this._config = config;
            this.status(RefreshState.init);
        }
        status(value: string = undefined): string {
            if (value === undefined)
                return this._status;

            this._status = value;
            this._config.text(value);

        }
        execute(): JQueryPromise<any> {
            //TODO:现在这里啥也没有处理，之后是要读取数据的
            var result = $.Deferred();
            window.setTimeout(() => result.resolve(), 2000);
            //this.status(RefreshState.init);
            result.done(() => this.status(RefreshState.init));
            return result;
        }

        static createPullDownBar(page: chitu.Page, config): PullDownBar {
            config = config || {};
            config = $.extend({
                text: function (status) {
                    (<HTMLElement>this.element).innerHTML = PullDownStateText[status];
                }
            }, config);

            var node = <HTMLElement>config.element;
            var status: string;
            if (node == null) {
                node = document.createElement('div');
                node.className = 'page-pulldown';
                node.innerHTML = PullUpStateText.init;

                var cn = page.nodes().content;
                if (cn.childNodes.length == 0) {
                    cn.appendChild(node);
                }
                else {
                    cn.insertBefore(node, cn.childNodes[0]);
                }

                config.element = node;
            }

            var bar = new PullDownBar(config);
            return bar;
        }
    }

    export class PullUpBar {
        private _status: string;
        private _config: any;

        constructor(config: any) {
            this._config = config;
            this.status(RefreshState.init);
        }

        status(value: string = undefined): string {
            if (value === undefined)
                return this._status;

            this._status = value;
            this._config.text(value);
        }

        execute() {
            var result: JQueryPromise<any> = this._config.execute();
            if (result != null && $.isFunction(result.done)) {
                result.done(() => this.status(RefreshState.init));
            }

            return result;
        }

        static createPullUpBar(page: chitu.Page, config): PullUpBar {
            config = config || {};
            config = $.extend({
                execute: function () { },
                text: function (status) {
                    (<HTMLElement>this.element).innerHTML = PullUpStateText[status];
                }
            }, config);

            var node = <HTMLElement>page.nodes()['pullup'];
            var status: string;
            if (node == null) {
                node = document.createElement('div');
                node.className = 'page-pullup';
                //node.style.height = PULLUP_BAR_HEIGHT + 'px';
                node.style.textAlign = 'center';

                var cn = page.nodes().content;
                cn.appendChild(node);

            }

            config.element = node;
            return new PullUpBar(config);
        }
    }




} 

namespace chitu.gesture {
    function start(move: (selector: string | HTMLElement) => Move, page: chitu.Page, pullDownBar: PullDownBar, pullUpBar: PullUpBar) {
        var pre_deltaY = 0;
        var cur_scroll_args: ScrollArguments = page['cur_scroll_args'];
        var content_move = move(page.nodes().content);//createMove(page);
        var body_move: Move;
        //========================================================
        // 说明：判断页面是否已经滚动底部（可以向上拉动刷新的依据之一）。
        var enablePullUp = false;
        //==================================================================
        // 说明：以下代码是实现下拉更新，但注意在 ISO 中，估计是由于使用了 IScroll，
        // 不能使用 transform，只能设置 top 来进行位移。
        var start_pos: number;
        var delta_height: number;
        var enablePullDown: boolean = false;// pullDownBar != null;
        var hammer = new Hammer(page.nodes().content);
        hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN });

        //$(page.nodes().body).mousedown(() => {
        //    var rect = page.nodes().content.getBoundingClientRect();
        //    if (start_pos == null)
        //        start_pos = rect.top;

        //});

        hammer.on('panstart', function (e: PanEvent) {
            var rect = page.nodes().content.getBoundingClientRect();
            var parent_rect = page.nodes().body.getBoundingClientRect();

            if (start_pos == null) {
                start_pos = rect.top;
            }

            if (delta_height == null) {
                delta_height = rect.height - $(page.nodes().body).height();
            }

            pre_deltaY = e['deltaY'];

            //====================================================================
            // 如果已经滚动到底部，则允许上拉
            enablePullUp = pullUpBar != null && Math.abs(parent_rect.bottom - rect.bottom) <= 20 && e['direction'] == Hammer.DIRECTION_UP;
            if (enablePullUp)
                body_move = move(page.nodes().body);
            //====================================================================
            // 如果页面处内容处理顶部 <= 20（不应该使用 0，允许误差），并且向下拉，则开始下拉事件
            enablePullDown = pullDownBar != null && Math.abs(rect.top - start_pos) <= 20 && e['direction'] == Hammer.DIRECTION_DOWN;
            //====================================================================
            if (enablePullDown === true) {
                hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN, domEvents: false });
            }

        })

        hammer.on('pan', function (e: Event) {
            var delta

            var event: any = e;
            if (event.distance > config.PULL_DOWN_MAX_HEIGHT)
                return;

            if (enablePullDown === true) {
                content_move.set('top', event.deltaY + 'px').duration(0).end();
                if (Math.abs(event.deltaY) > config.PULLDOWN_EXECUTE_CRITICAL_HEIGHT) {
                    pullDownBar.status(RefreshState.ready);
                }
                else {
                    pullDownBar.status(RefreshState.init);
                }

                //pre_deltaY = event.deltaY;
                //======================================
                // 说明：如果已经处理该事件处理，就可以阻止了。
                event.preventDefault();
                //======================================
            }
            else if (enablePullUp) {
                body_move.y(event.deltaY - pre_deltaY).duration(0).end();
                if (Math.abs(event.deltaY) > config.PULLUP_EXECUTE_CRITICAL_HEIGHT) {
                    pullUpBar.status(RefreshState.ready);
                }
                else {
                    pullUpBar.status(RefreshState.init);
                }
            }

            pre_deltaY = e['deltaY']
        });

        hammer.on('panend', function (e: Event) {
            var scroll_deferred = $.Deferred();
            if (enablePullDown === true) {
                if (pullDownBar.status() == RefreshState.ready) {
                    // 位置复原到为更新状态位置
                    content_move
                        .set('top', config.PULLDOWN_EXECUTE_CRITICAL_HEIGHT + 'px')
                        .duration(200)
                        .end();
                    //content_move.x()
                    pullDownBar.status(RefreshState.doing);
                    pullDownBar.execute().done(() => {
                        pullDownBar.status(RefreshState.done)
                        content_move.set('top', '0px').duration(500).end(() => {
                            console.log('scrollTop');
                            scroll_deferred.resolve()
                        });
                    });


                }
                else {
                    content_move.set('top', '0px').duration(200).end(() => scroll_deferred.resolve());
                }
            }
            else if (enablePullUp) {
                if (pullUpBar.status() == RefreshState.ready) {
                    pullUpBar.execute();
                }
                var m = move(page.nodes().body);
                m.y(0).duration(200).end();
            }
        });
    }
    export function enable_divfixed_gesture(page: chitu.Page, pullDownBar: PullDownBar, pullUpBar: PullUpBar) {
        requirejs(['move', 'hammer'], (move: (selector: string | HTMLElement) => Move, hammer) => {
            window['Hammer'] = hammer;
            start(move, page, pullDownBar, pullUpBar)
        });
    }
}

namespace chitu.gesture {
    function start(move: (selector: string | HTMLElement) => Move, page: chitu.Page, pullDownBar: PullDownBar, pullUpBar: PullUpBar) {
        console.log('enable_ios_gesture');

        var pre_deltaY = 0;
        var cur_scroll_args: ScrollArguments = page['cur_scroll_args'];
        var content_move = move(page.nodes().content);// createMove(page);
        var body_move: Move;
        var disable_iscroll: boolean;
   
        //==================================================================
        // 允许向下刷新


        //========================================================
        // 说明：判断页面是否已经滚动底部（可以向上拉动刷新的依据之一）。
        var enablePullUp = false;
        //==================================================================
        // 说明：以下代码是实现下拉更新，但注意在 ISO 中，估计是由于使用了 IScroll，
        // 不能使用 transform，只能设置 top 来进行位移。
        var enablePullDown: boolean = false;// pullDownBar != null;
        var hammer = new Hammer(page.nodes().content);
        hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN });

        hammer.on('panstart', function (e: Event) {
            pre_deltaY = e['deltaY']
   
            //====================================================================
            // 如果已经滚动到底部，则允许上拉
            enablePullUp = pullUpBar != null && Math.abs(page['iscroller'].startY - page['iscroller'].maxScrollY) <= 20 && e['direction'] == Hammer.DIRECTION_UP;
            if (enablePullUp)
                body_move = move(page.nodes().body);

            //====================================================================
            // 如果页面处内容处理顶部 <= 20（不应该使用 0，允许误差），并且向下拉，则开始下拉事件
            enablePullDown = pullDownBar != null && Math.abs(page['iscroller'].startY) <= 20 && e['direction'] == Hammer.DIRECTION_DOWN;
            //====================================================================
            if (enablePullDown === true || enablePullUp === true) {
                if (page['iscroller'].enabled) {
                    page['iscroller'].disable();
                    console.log('iscrol disable');
                    disable_iscroll = true;
                }

                hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN, domEvents: false });
            }
        })

        hammer.on('pan', function (e: PanEvent) {

            var event: any = e;
            if (event.distance > config.PULL_DOWN_MAX_HEIGHT)
                return;

            if (enablePullDown === true) {
                content_move.set('top', event.deltaY + 'px').duration(0).end();

                if (event.deltaY > config.PULLDOWN_EXECUTE_CRITICAL_HEIGHT) {
                    pullDownBar.status(RefreshState.ready);
                }
                else {
                    pullDownBar.status(RefreshState.init);
                }
            }
            else if (enablePullUp) {
                body_move.y(event.deltaY - pre_deltaY).duration(0).end();
                if (Math.abs(event.deltaY) > config.PULLUP_EXECUTE_CRITICAL_HEIGHT) {
                    pullUpBar.status(RefreshState.ready);
                }
                else {
                    pullUpBar.status(RefreshState.init);
                }
            }

            //======================================
            // 说明：如果已经处理该事件处理，就可以阻止了。
            event.preventDefault();
            //======================================
            pre_deltaY = e['deltaY']
        });

        hammer.on('panend', function (e: Event) {
            var scroll_deferred = $.Deferred();
            if (enablePullDown === true) {
                if (pullDownBar.status() == RefreshState.ready) {
                    // 位置复原到为更新状态位置
                    content_move
                        .set('top', config.PULLDOWN_EXECUTE_CRITICAL_HEIGHT + 'px')
                        .duration(200)
                        .end();

                    pullDownBar.status(RefreshState.doing);
                    pullDownBar.execute().done(() => {
                        pullDownBar.status(RefreshState.done)
                        content_move.set('top', '0px').duration(500).end(() => {
                            console.log('scrollTop');
                            scroll_deferred.resolve()
                        });
                    });


                }
                else {
                    content_move.set('top', '0px').duration(200).end(() => scroll_deferred.resolve());
                }
            }
            else if (enablePullUp) {
                if (pullUpBar.status() == RefreshState.ready) {
                    pullUpBar.execute();
                }

                var m = move(page.nodes().body);
                m.y(0).duration(200).end();
            }

            var rect = page.nodes().content.getBoundingClientRect();
            //====================================================================
            // 如果已经滚动到底部，则允许上拉
            enablePullUp = pullUpBar != null && Math.abs(page['iscroller'].startY - page['iscroller'].maxScrollY) <= 20 && e['direction'] == Hammer.DIRECTION_UP;
            console.log(pullUpBar);
            console.log(page['iscroller']);
            console.log('enablePullUp:' + enablePullUp);
            //====================================================================
            enablePullDown = pullDownBar != null && rect.top <= 0 && e['direction'] == Hammer.DIRECTION_DOWN;
            //=============================================================
            // 一定要延时，否则会触发 tap 事件
            window.setTimeout(() => {
                if (disable_iscroll)
                    page['iscroller'].enable();

            }, 100);
            //=============================================================

        });
    }
    export function enable_iscroll_gesture(page: chitu.Page, pullDownBar: PullDownBar, pullUpBar: PullUpBar) {
        requirejs(['move', 'hammer'], (move: (selector: string | HTMLElement) => Move, hammer) => {
            window['Hammer'] = hammer;
            start(move, page, pullDownBar, pullUpBar);
        });
    }
} 