var chitu;
(function (chitu) {
    var e = chitu.Errors;
    var crossroads = window['crossroads'];
    function interpolate(pattern, data) {
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
    var Action = (function () {
        function Action(controller, name, handle) {
            /// <param name="controller" type="chitu.Controller"/>
            /// <param name="name" type="String">Name of the action.</param>
            /// <param name="handle" type="Function"/>
            if (!controller)
                throw chitu.Errors.argumentNull('controller');
            if (!name)
                throw chitu.Errors.argumentNull('name');
            if (!handle)
                throw chitu.Errors.argumentNull('handle');
            if (!$.isFunction(handle))
                throw chitu.Errors.paramTypeError('handle', 'Function');
            this._name = name;
            this._handle = handle;
        }
        Action.prototype.name = function () {
            return this._name;
        };
        Action.prototype.execute = function (page) {
            if (!page)
                throw e.argumentNull('page');
            var result = this._handle.apply({}, [page]);
            return chitu.Utility.isDeferred(result) ? result : $.Deferred().resolve();
        };
        return Action;
    })();
    chitu.Action = Action;
    function createActionDeferred(routeData) {
        var actionName = routeData.values().action;
        if (!actionName)
            throw e.routeDataRequireAction();
        var url = interpolate(routeData.actionPath(), routeData.values());
        var result = $.Deferred();
        requirejs([url], function (obj) {
            if (!obj) {
                console.warn(chitu.Utility.format('加载活动“{1}.{0}”失败。', actionName, routeData.values().controller));
                result.reject();
            }
            var func = obj.func || obj;
            if (!$.isFunction(func))
                throw chitu.Errors.modelFileExpecteFunction(actionName);
            var action = new Action(self, actionName, func);
            result.resolve(action);
        }, function (err) { return result.reject(err); });
        return result;
    }
    chitu.createActionDeferred = createActionDeferred;
    function createViewDeferred(routeData) {
        if (!routeData.values().controller)
            throw e.routeDataRequireController();
        if (!routeData.values().action)
            throw e.routeDataRequireAction();
        var url = interpolate(routeData.viewPath(), routeData.values());
        var self = this;
        var result = $.Deferred();
        var http = 'http://';
        if (url.substr(0, http.length).toLowerCase() == http) {
            $.ajax({ url: url })
                .done(function (html) {
                if (html != null)
                    result.resolve(html);
                else
                    result.reject();
            })
                .fail(function (err) { return result.reject(err); });
        }
        else {
            requirejs(['text!' + url], function (html) {
                if (html != null)
                    result.resolve(html);
                else
                    result.reject();
            }, function (err) { return result.reject(err); });
        }
        return result;
    }
    chitu.createViewDeferred = createViewDeferred;
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    var ns = chitu;
    var u = chitu.Utility;
    var e = chitu.Errors;
    var PAGE_STACK_MAX_SIZE = 10;
    var ACTION_LOCATION_FORMATER = '{controller}/{action}';
    var VIEW_LOCATION_FORMATER = '{controller}/{action}';
    var Application = (function () {
        function Application(config) {
            this.pageCreating = ns.Callbacks();
            this.pageCreated = ns.Callbacks();
            this.page_stack = [];
            this._routes = new chitu.RouteCollection();
            this._runned = false;
            if (config == null)
                throw e.argumentNull('container');
            if (!config.container) {
                throw new Error('The config has not a container property.');
            }
            if (!$.isFunction(config.container) && !config.container['tagName'])
                throw new Error('Parameter container is not a function or html element.');
            config.openSwipe = config.openSwipe || function (routeData) { return chitu.SwipeDirection.None; };
            config.closeSwipe = config.closeSwipe || function (routeData) { return chitu.SwipeDirection.None; };
            config.scrollType = config.scrollType || function (routeData) { return chitu.ScrollType.Document; };
            this.config = config;
        }
        Application.prototype.on_pageCreating = function (context) {
            return chitu.fireCallback(this.pageCreating, [this, context]);
        };
        Application.prototype.on_pageCreated = function (page, context) {
            return chitu.fireCallback(this.pageCreated, [this, page]);
        };
        Application.prototype.routes = function () {
            return this._routes;
        };
        Application.prototype.currentPage = function () {
            if (this.page_stack.length > 0)
                return this.page_stack[this.page_stack.length - 1];
            return null;
        };
        Application.prototype.previousPage = function () {
            if (this.page_stack.length > 1)
                return this.page_stack[this.page_stack.length - 2];
            return null;
        };
        Application.prototype.hashchange = function () {
            if (window.location['skip'] == true) {
                window.location['skip'] = false;
                return;
            }
            var back_deferred;
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
                this.start_flag_hash = '#AABBCCDDEEFF';
                this.start_hash = hash;
                window.history.replaceState({}, '', this.start_flag_hash);
                window.history.pushState({}, '', hash);
            }
            var current_page_url = '';
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
        };
        Application.prototype.run = function () {
            if (this._runned)
                return;
            var app = this;
            $.proxy(this.hashchange, this)();
            $(window).bind('hashchange', $.proxy(this.hashchange, this));
            this._runned = true;
        };
        Application.prototype.getCachePage = function (name) {
            for (var i = this.page_stack.length - 1; i >= 0; i--) {
                if (this.page_stack[i].name == name)
                    return this.page_stack[i];
            }
            return null;
        };
        Application.prototype.showPage = function (url, args) {
            args = args || {};
            if (!url)
                throw e.argumentNull('url');
            var routeData = this.routes().getRouteData(url);
            if (routeData == null) {
                throw e.noneRouteMatched(url);
            }
            var container;
            if ($.isFunction(this.config.container)) {
                container = this.config.container(routeData.values());
                if (container == null)
                    throw new Error('The result of continer function cannt be null');
            }
            else {
                container = this.config.container;
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
            page.open(args, swipe).done(function () {
                if (previous)
                    previous.hide();
            });
            return page;
        };
        Application.prototype.createPageNode = function () {
            var element = document.createElement('div');
            return element;
        };
        Application.prototype.closeCurrentPage = function () {
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
        };
        Application.prototype.createPage = function (url, container, previousPage) {
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
            var view_deferred = chitu.createViewDeferred(routeData);
            var action_deferred = chitu.createActionDeferred(routeData);
            var context = new ns.PageContext(view_deferred, routeData);
            this.on_pageCreating(context);
            var scrollType = this.config.scrollType(routeData);
            var page = new ns.Page(container, scrollType, previousPage);
            page.routeData = routeData;
            page.view = view_deferred;
            page.action = action_deferred;
            this.on_pageCreated(page, context);
            return page;
        };
        Application.prototype.redirect = function (url, args) {
            if (args === void 0) { args = {}; }
            window.location['skip'] = true;
            window.location.hash = url;
            return this.showPage(url, args);
        };
        Application.prototype.back = function (args) {
            if (args === void 0) { args = undefined; }
            this.back_deferred = $.Deferred();
            if (window.history.length == 0) {
                this.back_deferred.reject();
                return this.back_deferred;
            }
            window.history.back();
            return this.back_deferred;
        };
        return Application;
    })();
    chitu.Application = Application;
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    var u = chitu.Utility;
    var Errors = (function () {
        function Errors() {
        }
        Errors.argumentNull = function (paramName) {
            var msg = u.format('The argument "{0}" cannt be null.', paramName);
            return new Error(msg);
        };
        Errors.modelFileExpecteFunction = function (script) {
            var msg = u.format('The eval result of script file "{0}" is expected a function.', script);
            return new Error(msg);
        };
        Errors.paramTypeError = function (paramName, expectedType) {
            /// <param name="paramName" type="String"/>
            /// <param name="expectedType" type="String"/>
            var msg = u.format('The param "{0}" is expected "{1}" type.', paramName, expectedType);
            return new Error(msg);
        };
        Errors.viewNodeNotExists = function (name) {
            var msg = u.format('The view node "{0}" is not exists.', name);
            return new Error(msg);
        };
        Errors.pathPairRequireView = function (index) {
            var msg = u.format('The view value is required for path pair, but the item with index "{0}" is miss it.', index);
            return new Error(msg);
        };
        Errors.notImplemented = function (name) {
            var msg = u.format('The method "{0}" is not implemented.', name);
            return new Error(msg);
        };
        Errors.routeExists = function (name) {
            var msg = u.format('Route named "{0}" is exists.', name);
            return new Error(msg);
        };
        Errors.routeResultRequireController = function (routeName) {
            var msg = u.format('The parse result of route "{0}" does not contains controler.', routeName);
            return new Error(msg);
        };
        Errors.routeResultRequireAction = function (routeName) {
            var msg = u.format('The parse result of route "{0}" does not contains action.', routeName);
            return new Error(msg);
        };
        Errors.ambiguityRouteMatched = function (url, routeName1, routeName2) {
            var msg = u.format('Ambiguity route matched, {0} is match in {1} and {2}.', url, routeName1, routeName2);
            return new Error(msg);
        };
        Errors.noneRouteMatched = function (url) {
            var msg = u.format('None route matched with url "{0}".', url);
            var error = new Error(msg);
            return error;
        };
        Errors.emptyStack = function () {
            return new Error('The stack is empty.');
        };
        Errors.canntParseUrl = function (url) {
            var msg = u.format('Can not parse the url "{0}" to route data.', url);
            return new Error(msg);
        };
        Errors.routeDataRequireController = function () {
            var msg = 'The route data does not contains a "controller" file.';
            return new Error(msg);
        };
        Errors.routeDataRequireAction = function () {
            var msg = 'The route data does not contains a "action" file.';
            return new Error(msg);
        };
        Errors.parameterRequireField = function (fileName, parameterName) {
            var msg = u.format('Parameter {1} does not contains field {0}.', fileName, parameterName);
            return new Error(msg);
        };
        Errors.viewCanntNull = function () {
            var msg = 'The view or viewDeferred of the page cannt null.';
            return new Error(msg);
        };
        return Errors;
    })();
    chitu.Errors = Errors;
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    var rnotwhite = (/\S+/g);
    var optionsCache = {};
    function createOptions(options) {
        var object = optionsCache[options] = {};
        jQuery.each(options.match(rnotwhite) || [], function (_, flag) {
            object[flag] = true;
        });
        return object;
    }
    var Callback = (function () {
        function Callback(source) {
            this.source = source;
        }
        Callback.prototype.add = function (func) {
            this.source.add(func);
        };
        Callback.prototype.remove = function (func) {
            this.source.remove(func);
        };
        Callback.prototype.has = function (func) {
            return this.source.has(func);
        };
        Callback.prototype.fireWith = function (context, args) {
            return this.source.fireWith(context, args);
        };
        Callback.prototype.fire = function (arg1, arg2, arg3, arg4) {
            return this.source.fire(arg1, arg2, arg3);
        };
        return Callback;
    })();
    chitu.Callback = Callback;
    function Callbacks(options) {
        if (options === void 0) { options = null; }
        options = typeof options === "string" ?
            (optionsCache[options] || createOptions(options)) :
            jQuery.extend({}, options);
        var memory, fired, firing, firingStart, firingLength, firingIndex, list = [], stack = !options.once && [], fire = function (data) {
            memory = options.memory && data;
            fired = true;
            firingIndex = firingStart || 0;
            firingStart = 0;
            firingLength = list.length;
            firing = true;
            for (; list && firingIndex < firingLength; firingIndex++) {
                var result = list[firingIndex].apply(data[0], data[1]);
                if (result != null) {
                    data[0].results.push(result);
                }
                if (result === false && options.stopOnFalse) {
                    memory = false;
                    break;
                }
            }
            firing = false;
            if (list) {
                if (stack) {
                    if (stack.length) {
                        fire(stack.shift());
                    }
                }
                else if (memory) {
                    list = [];
                }
                else {
                    self.disable();
                }
            }
        }, self = {
            results: [],
            add: function () {
                if (list) {
                    var start = list.length;
                    (function add(args) {
                        jQuery.each(args, function (_, arg) {
                            var type = jQuery.type(arg);
                            if (type === "function") {
                                if (!options.unique || !self.has(arg)) {
                                    list.push(arg);
                                }
                            }
                            else if (arg && arg.length && type !== "string") {
                                add(arg);
                            }
                        });
                    })(arguments);
                    if (firing) {
                        firingLength = list.length;
                    }
                    else if (memory) {
                        firingStart = start;
                        fire(memory);
                    }
                }
                return this;
            },
            remove: function () {
                if (list) {
                    jQuery.each(arguments, function (_, arg) {
                        var index;
                        while ((index = jQuery.inArray(arg, list, index)) > -1) {
                            list.splice(index, 1);
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
            has: function (fn) {
                return fn ? jQuery.inArray(fn, list) > -1 : !!(list && list.length);
            },
            empty: function () {
                list = [];
                firingLength = 0;
                return this;
            },
            disable: function () {
                list = stack = memory = undefined;
                return this;
            },
            disabled: function () {
                return !list;
            },
            lock: function () {
                stack = undefined;
                if (!memory) {
                    self.disable();
                }
                return this;
            },
            locked: function () {
                return !stack;
            },
            fireWith: function (context, args) {
                context.results = [];
                if (list && (!fired || stack)) {
                    args = args || [];
                    args = [context, args.slice ? args.slice() : args];
                    if (firing) {
                        stack.push(args);
                    }
                    else {
                        fire(args);
                    }
                }
                return context.results;
            },
            fire: function () {
                return self.fireWith(this, arguments);
            },
            fired: function () {
                return !!fired;
            },
            count: function () {
                return list.length;
            }
        };
        return new chitu.Callback(self);
    }
    chitu.Callbacks = Callbacks;
    function fireCallback(callback, args) {
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
    chitu.fireCallback = fireCallback;
    var crossroads = window['crossroads'];
    $.extend(crossroads, {
        _create: crossroads.create,
        create: function () {
            var obj = this._create();
            obj.getRouteData = function (request, defaultArgs) {
                request = request || '';
                defaultArgs = defaultArgs || [];
                if (!this.ignoreState &&
                    (request === this._prevMatchedRequest ||
                        request === this._prevBypassedRequest)) {
                    return;
                }
                var routes = this._getMatchedRoutes(request), i = 0, n = routes.length, cur;
                if (n == 0)
                    return null;
                if (n > 1) {
                    throw chitu.Errors.ambiguityRouteMatched(request, 'route1', 'route2');
                }
                return routes[0];
            };
            return obj;
        }
    });
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    var gesture;
    (function (gesture) {
        function createPullDownBar(page, config) {
            config = config || {};
            config = $.extend({
                text: function (status) {
                    this.element.innerHTML = PullDownStateText[status];
                }
            }, config);
            var node = config.element;
            var status;
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
        gesture.createPullDownBar = createPullDownBar;
        var config = (function () {
            function config() {
            }
            config.PULLDOWN_EXECUTE_CRITICAL_HEIGHT = 60;
            config.PULLUP_EXECUTE_CRITICAL_HEIGHT = 60;
            config.PULL_DOWN_MAX_HEIGHT = 150;
            config.PULL_UP_MAX_HEIGHT = 150;
            config.MINI_MOVE_DISTANCE = 3;
            return config;
        })();
        gesture.config = config;
        var RefreshState = (function () {
            function RefreshState() {
            }
            RefreshState.init = 'init';
            RefreshState.ready = 'ready';
            RefreshState.doing = 'doing';
            RefreshState.done = 'done';
            return RefreshState;
        })();
        gesture.RefreshState = RefreshState;
        var PullDownStateText = (function () {
            function PullDownStateText() {
            }
            PullDownStateText.init = '<div style="padding-top:10px;">下拉可以刷新</div>';
            PullDownStateText.ready = '<div style="padding-top:10px;">松开后刷新</div>';
            PullDownStateText.doing = '<div style=""><i class="icon-spinner icon-spin"></i><span>&nbsp;正在更新中</span></div>';
            PullDownStateText.done = '<div style="padding-top:10px;">更新完毕</div>';
            return PullDownStateText;
        })();
        gesture.PullDownStateText = PullDownStateText;
        var PullUpStateText = (function () {
            function PullUpStateText() {
            }
            PullUpStateText.init = '上拉可以刷新';
            PullUpStateText.ready = '松开后刷新';
            PullUpStateText.doing = '<div><i class="icon-spinner icon-spin"></i><span>&nbsp;正在更新中</span></div>';
            PullUpStateText.done = '更新完毕';
            return PullUpStateText;
        })();
        gesture.PullUpStateText = PullUpStateText;
        var PullDownBar = (function () {
            function PullDownBar(config) {
                this._config = config;
                this.status(RefreshState.init);
            }
            PullDownBar.prototype.status = function (value) {
                if (value === void 0) { value = undefined; }
                if (value === undefined)
                    return this._status;
                this._status = value;
                this._config.text(value);
            };
            PullDownBar.prototype.execute = function () {
                var _this = this;
                var result = $.Deferred();
                window.setTimeout(function () { return result.resolve(); }, 2000);
                result.done(function () { return _this.status(RefreshState.init); });
                return result;
            };
            PullDownBar.createPullDownBar = function (page, config) {
                config = config || {};
                config = $.extend({
                    text: function (status) {
                        this.element.innerHTML = PullDownStateText[status];
                    }
                }, config);
                var node = config.element;
                var status;
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
            };
            return PullDownBar;
        })();
        gesture.PullDownBar = PullDownBar;
        var PullUpBar = (function () {
            function PullUpBar(config) {
                this._config = config;
                this.status(RefreshState.init);
            }
            PullUpBar.prototype.status = function (value) {
                if (value === void 0) { value = undefined; }
                if (value === undefined)
                    return this._status;
                this._status = value;
                this._config.text(value);
            };
            PullUpBar.prototype.execute = function () {
                var _this = this;
                var result = this._config.execute();
                if (result != null && $.isFunction(result.done)) {
                    result.done(function () { return _this.status(RefreshState.init); });
                }
                return result;
            };
            PullUpBar.createPullUpBar = function (page, config) {
                config = config || {};
                config = $.extend({
                    execute: function () { },
                    text: function (status) {
                        this.element.innerHTML = PullUpStateText[status];
                    }
                }, config);
                var node = page.nodes()['pullup'];
                var status;
                if (node == null) {
                    node = document.createElement('div');
                    node.className = 'page-pullup';
                    node.style.textAlign = 'center';
                    var cn = page.nodes().content;
                    cn.appendChild(node);
                }
                config.element = node;
                return new PullUpBar(config);
            };
            return PullUpBar;
        })();
        gesture.PullUpBar = PullUpBar;
    })(gesture = chitu.gesture || (chitu.gesture = {}));
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    var gesture;
    (function (gesture) {
        function start(move, page, pullDownBar, pullUpBar) {
            var pre_deltaY = 0;
            var cur_scroll_args = page['cur_scroll_args'];
            var content_move = move(page.nodes().content);
            var body_move;
            var enablePullUp = false;
            var start_pos;
            var delta_height;
            var enablePullDown = false;
            var hammer = new Hammer(page.nodes().content);
            hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN });
            hammer.on('panstart', function (e) {
                var rect = page.nodes().content.getBoundingClientRect();
                var parent_rect = page.nodes().body.getBoundingClientRect();
                if (start_pos == null) {
                    start_pos = rect.top;
                }
                if (delta_height == null) {
                    delta_height = rect.height - $(page.nodes().body).height();
                }
                pre_deltaY = e['deltaY'];
                enablePullUp = pullUpBar != null && Math.abs(parent_rect.bottom - rect.bottom) <= 20 && e['direction'] == Hammer.DIRECTION_UP;
                if (enablePullUp)
                    body_move = move(page.nodes().body);
                enablePullDown = pullDownBar != null && Math.abs(rect.top - start_pos) <= 20 && e['direction'] == Hammer.DIRECTION_DOWN;
                if (enablePullDown === true) {
                    hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN, domEvents: false });
                }
            });
            hammer.on('pan', function (e) {
                var delta;
                var event = e;
                if (event.distance > gesture.config.PULL_DOWN_MAX_HEIGHT)
                    return;
                if (enablePullDown === true) {
                    content_move.set('top', event.deltaY + 'px').duration(0).end();
                    if (Math.abs(event.deltaY) > gesture.config.PULLDOWN_EXECUTE_CRITICAL_HEIGHT) {
                        pullDownBar.status(gesture.RefreshState.ready);
                    }
                    else {
                        pullDownBar.status(gesture.RefreshState.init);
                    }
                    event.preventDefault();
                }
                else if (enablePullUp) {
                    body_move.y(event.deltaY - pre_deltaY).duration(0).end();
                    if (Math.abs(event.deltaY) > gesture.config.PULLUP_EXECUTE_CRITICAL_HEIGHT) {
                        pullUpBar.status(gesture.RefreshState.ready);
                    }
                    else {
                        pullUpBar.status(gesture.RefreshState.init);
                    }
                }
                pre_deltaY = e['deltaY'];
            });
            hammer.on('panend', function (e) {
                var scroll_deferred = $.Deferred();
                if (enablePullDown === true) {
                    if (pullDownBar.status() == gesture.RefreshState.ready) {
                        content_move
                            .set('top', gesture.config.PULLDOWN_EXECUTE_CRITICAL_HEIGHT + 'px')
                            .duration(200)
                            .end();
                        pullDownBar.status(gesture.RefreshState.doing);
                        pullDownBar.execute().done(function () {
                            pullDownBar.status(gesture.RefreshState.done);
                            content_move.set('top', '0px').duration(500).end(function () {
                                console.log('scrollTop');
                                scroll_deferred.resolve();
                            });
                        });
                    }
                    else {
                        content_move.set('top', '0px').duration(200).end(function () { return scroll_deferred.resolve(); });
                    }
                }
                else if (enablePullUp) {
                    if (pullUpBar.status() == gesture.RefreshState.ready) {
                        pullUpBar.execute();
                    }
                    var m = move(page.nodes().body);
                    m.y(0).duration(200).end();
                }
            });
        }
        function enable_divfixed_gesture(page, pullDownBar, pullUpBar) {
            requirejs(['move', 'hammer'], function (move, hammer) {
                window['Hammer'] = hammer;
                start(move, page, pullDownBar, pullUpBar);
            });
        }
        gesture.enable_divfixed_gesture = enable_divfixed_gesture;
    })(gesture = chitu.gesture || (chitu.gesture = {}));
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    var gesture;
    (function (gesture) {
        function start(move, page, pullDownBar, pullUpBar) {
            console.log('enable_ios_gesture');
            var pre_deltaY = 0;
            var cur_scroll_args = page['cur_scroll_args'];
            var content_move = move(page.nodes().content);
            var body_move;
            var disable_iscroll;
            var enablePullUp = false;
            var enablePullDown = false;
            var hammer = new Hammer(page.nodes().content);
            hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN });
            hammer.on('panstart', function (e) {
                pre_deltaY = e['deltaY'];
                enablePullUp = pullUpBar != null && Math.abs(page['iscroller'].startY - page['iscroller'].maxScrollY) <= 20 && e['direction'] == Hammer.DIRECTION_UP;
                if (enablePullUp)
                    body_move = move(page.nodes().body);
                enablePullDown = pullDownBar != null && Math.abs(page['iscroller'].startY) <= 20 && e['direction'] == Hammer.DIRECTION_DOWN;
                if (enablePullDown === true || enablePullUp === true) {
                    if (page['iscroller'].enabled) {
                        page['iscroller'].disable();
                        console.log('iscrol disable');
                        disable_iscroll = true;
                    }
                    hammer.get('pan').set({ direction: Hammer.DIRECTION_UP | Hammer.DIRECTION_DOWN, domEvents: false });
                }
            });
            hammer.on('pan', function (e) {
                var event = e;
                if (event.distance > gesture.config.PULL_DOWN_MAX_HEIGHT)
                    return;
                if (enablePullDown === true) {
                    content_move.set('top', event.deltaY + 'px').duration(0).end();
                    if (event.deltaY > gesture.config.PULLDOWN_EXECUTE_CRITICAL_HEIGHT) {
                        pullDownBar.status(gesture.RefreshState.ready);
                    }
                    else {
                        pullDownBar.status(gesture.RefreshState.init);
                    }
                }
                else if (enablePullUp) {
                    body_move.y(event.deltaY - pre_deltaY).duration(0).end();
                    if (Math.abs(event.deltaY) > gesture.config.PULLUP_EXECUTE_CRITICAL_HEIGHT) {
                        pullUpBar.status(gesture.RefreshState.ready);
                    }
                    else {
                        pullUpBar.status(gesture.RefreshState.init);
                    }
                }
                event.preventDefault();
                pre_deltaY = e['deltaY'];
            });
            hammer.on('panend', function (e) {
                var scroll_deferred = $.Deferred();
                if (enablePullDown === true) {
                    if (pullDownBar.status() == gesture.RefreshState.ready) {
                        content_move
                            .set('top', gesture.config.PULLDOWN_EXECUTE_CRITICAL_HEIGHT + 'px')
                            .duration(200)
                            .end();
                        pullDownBar.status(gesture.RefreshState.doing);
                        pullDownBar.execute().done(function () {
                            pullDownBar.status(gesture.RefreshState.done);
                            content_move.set('top', '0px').duration(500).end(function () {
                                console.log('scrollTop');
                                scroll_deferred.resolve();
                            });
                        });
                    }
                    else {
                        content_move.set('top', '0px').duration(200).end(function () { return scroll_deferred.resolve(); });
                    }
                }
                else if (enablePullUp) {
                    if (pullUpBar.status() == gesture.RefreshState.ready) {
                        pullUpBar.execute();
                    }
                    var m = move(page.nodes().body);
                    m.y(0).duration(200).end();
                }
                var rect = page.nodes().content.getBoundingClientRect();
                enablePullUp = pullUpBar != null && Math.abs(page['iscroller'].startY - page['iscroller'].maxScrollY) <= 20 && e['direction'] == Hammer.DIRECTION_UP;
                console.log(pullUpBar);
                console.log(page['iscroller']);
                console.log('enablePullUp:' + enablePullUp);
                enablePullDown = pullDownBar != null && rect.top <= 0 && e['direction'] == Hammer.DIRECTION_DOWN;
                window.setTimeout(function () {
                    if (disable_iscroll)
                        page['iscroller'].enable();
                }, 100);
            });
        }
        function enable_iscroll_gesture(page, pullDownBar, pullUpBar) {
            requirejs(['move', 'hammer'], function (move, hammer) {
                window['Hammer'] = hammer;
                start(move, page, pullDownBar, pullUpBar);
            });
        }
        gesture.enable_iscroll_gesture = enable_iscroll_gesture;
    })(gesture = chitu.gesture || (chitu.gesture = {}));
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    var ns = chitu;
    var u = chitu.Utility;
    var e = chitu.Errors;
    function eventDeferred(callback, sender, args) {
        if (args === void 0) { args = {}; }
        return chitu.fireCallback(callback, [sender, args]);
    }
    ;
    var PAGE_CLASS_NAME = 'page-node';
    var PAGE_HEADER_CLASS_NAME = 'page-header';
    var PAGE_BODY_CLASS_NAME = 'page-body';
    var PAGE_FOOTER_CLASS_NAME = 'page-footer';
    var PAGE_LOADING_CLASS_NAME = 'page-loading';
    var PAGE_CONTENT_CLASS_NAME = 'page-content';
    var LOAD_COMPLETE_HTML = '<span style="padding-left:10px;">数据已全部加载完毕</span>';
    (function (PageLoadType) {
        PageLoadType[PageLoadType["open"] = 0] = "open";
        PageLoadType[PageLoadType["scroll"] = 1] = "scroll";
        PageLoadType[PageLoadType["pullDown"] = 2] = "pullDown";
        PageLoadType[PageLoadType["pullUp"] = 3] = "pullUp";
        PageLoadType[PageLoadType["custom"] = 4] = "custom";
    })(chitu.PageLoadType || (chitu.PageLoadType = {}));
    var PageLoadType = chitu.PageLoadType;
    var PageLoadArguments = (function () {
        function PageLoadArguments(page, loadType, loading) {
            if (page == null)
                throw chitu.Errors.argumentNull('page');
            this._page = page;
            this.loadType = loadType;
            this.loading = loading;
        }
        Object.defineProperty(PageLoadArguments.prototype, "enableScrollLoad", {
            get: function () {
                return this._page.enableScrollLoad;
            },
            set: function (value) {
                this._page.enableScrollLoad = value;
            },
            enumerable: true,
            configurable: true
        });
        return PageLoadArguments;
    })();
    chitu.PageLoadArguments = PageLoadArguments;
    var ShowTypes;
    (function (ShowTypes) {
        ShowTypes[ShowTypes["swipeLeft"] = 0] = "swipeLeft";
        ShowTypes[ShowTypes["swipeRight"] = 1] = "swipeRight";
        ShowTypes[ShowTypes["none"] = 2] = "none";
    })(ShowTypes || (ShowTypes = {}));
    var PageNodeParts;
    (function (PageNodeParts) {
        PageNodeParts[PageNodeParts["header"] = 1] = "header";
        PageNodeParts[PageNodeParts["body"] = 2] = "body";
        PageNodeParts[PageNodeParts["loading"] = 4] = "loading";
        PageNodeParts[PageNodeParts["footer"] = 8] = "footer";
    })(PageNodeParts || (PageNodeParts = {}));
    var PageStatus;
    (function (PageStatus) {
        PageStatus[PageStatus["open"] = 0] = "open";
        PageStatus[PageStatus["closed"] = 1] = "closed";
    })(PageStatus || (PageStatus = {}));
    (function (SwipeDirection) {
        SwipeDirection[SwipeDirection["None"] = 0] = "None";
        SwipeDirection[SwipeDirection["Left"] = 1] = "Left";
        SwipeDirection[SwipeDirection["Right"] = 2] = "Right";
        SwipeDirection[SwipeDirection["Up"] = 3] = "Up";
        SwipeDirection[SwipeDirection["Donw"] = 4] = "Donw";
    })(chitu.SwipeDirection || (chitu.SwipeDirection = {}));
    var SwipeDirection = chitu.SwipeDirection;
    (function (ScrollType) {
        ScrollType[ScrollType["IScroll"] = 0] = "IScroll";
        ScrollType[ScrollType["Div"] = 1] = "Div";
        ScrollType[ScrollType["Document"] = 2] = "Document";
    })(chitu.ScrollType || (chitu.ScrollType = {}));
    var ScrollType = chitu.ScrollType;
    var PageNodes = (function () {
        function PageNodes(node) {
            node.className = PAGE_CLASS_NAME;
            this.container = node;
            this.header = document.createElement('div');
            this.header.className = PAGE_HEADER_CLASS_NAME;
            node.appendChild(this.header);
            this.body = document.createElement('div');
            this.body.className = PAGE_BODY_CLASS_NAME;
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
            node.appendChild(this.footer);
        }
        return PageNodes;
    })();
    var PageBottomLoading = (function () {
        function PageBottomLoading(page) {
            this.LOADDING_HTML = '<i class="icon-spinner icon-spin"></i><span style="padding-left:10px;">数据正在加载中...</span>';
            if (!page)
                throw chitu.Errors.argumentNull('page');
            this._page = page;
            this._scrollLoad_loading_bar = document.createElement('div');
            this._scrollLoad_loading_bar.innerHTML = '<div name="scrollLoad_loading" style="padding:10px 0px 10px 0px;"><h5 class="text-center"></h5></div>';
            this._scrollLoad_loading_bar.style.display = 'none';
            $(this._scrollLoad_loading_bar).find('h5').html(this.LOADDING_HTML);
            page.nodes().content.appendChild(this._scrollLoad_loading_bar);
        }
        PageBottomLoading.prototype.show = function () {
            if (this._scrollLoad_loading_bar.style.display == 'block')
                return;
            this._scrollLoad_loading_bar.style.display = 'block';
            this._page.refreshUI();
        };
        PageBottomLoading.prototype.hide = function () {
            if (this._scrollLoad_loading_bar.style.display == 'none')
                return;
            this._scrollLoad_loading_bar.style.display = 'none';
            this._page.refreshUI();
        };
        return PageBottomLoading;
    })();
    var Page = (function () {
        function Page(element, scrollType, previous) {
            var _this = this;
            this._loadViewModelResult = null;
            this._openResult = null;
            this._hideResult = null;
            this._showTime = Page.animationTime;
            this._hideTime = Page.animationTime;
            this._enableScrollLoad = false;
            this.is_closed = false;
            this.actionExecuted = $.Deferred();
            this.isActionExecuted = false;
            this.preLoad = ns.Callbacks();
            this.load = ns.Callbacks();
            this.loadCompleted = ns.Callbacks();
            this.closing = ns.Callbacks();
            this.closed = ns.Callbacks();
            this.scroll = ns.Callbacks();
            this.showing = ns.Callbacks();
            this.shown = ns.Callbacks();
            this.hiding = ns.Callbacks();
            this.hidden = ns.Callbacks();
            this.scrollEnd = ns.Callbacks();
            this.viewChanged = $.Callbacks();
            if (!element)
                throw e.argumentNull('element');
            if (scrollType == null)
                throw e.argumentNull('scrollType');
            this._prevous = previous;
            this._pageNode = new PageNodes(element);
            this.disableHeaderFooterTouchMove();
            this._scrollType = scrollType;
            if (scrollType == ScrollType.IScroll) {
                $(this.nodes().container).addClass('ios');
                this.ios_scroller = new chitu.IOSScroll(this);
                chitu.gesture.enable_iscroll_gesture(this, null, null);
            }
            else if (scrollType == ScrollType.Div) {
                $(this.nodes().container).addClass('div');
                new chitu.DivScroll(this);
                chitu.gesture.enable_divfixed_gesture(this, null, null);
            }
            else if (scrollType == ScrollType.Document) {
                $(this.nodes().container).addClass('doc');
                new chitu.DocumentScroll(this);
            }
            this.scrollEnd.add(Page.page_scrollEnd);
            if (previous)
                previous.closed.add(function () { return _this.close(); });
        }
        Page.prototype.createPageLoadArguments = function (args, loadType, loading) {
            var result = new PageLoadArguments(this, loadType, loading);
            result = $.extend(result, args || {});
            return result;
        };
        Object.defineProperty(Page.prototype, "formLoading", {
            get: function () {
                var _this = this;
                if (this._formLoading == null) {
                    this._formLoading = {
                        show: function () {
                            if ($(_this.nodes().loading).is(':visible'))
                                return;
                            $(_this.nodes().loading).show();
                            $(_this.nodes().content).hide();
                        },
                        hide: function () {
                            $(_this.nodes().loading).hide();
                            $(_this.nodes().content).show();
                        }
                    };
                }
                return this._formLoading;
            },
            set: function (value) {
                if (!value)
                    throw chitu.Errors.argumentNull('value');
                this._formLoading = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Page.prototype, "bottomLoading", {
            get: function () {
                if (this._bottomLoading == null)
                    this._bottomLoading = new PageBottomLoading(this);
                return this._bottomLoading;
            },
            set: function (value) {
                if (!value)
                    throw chitu.Errors.argumentNull('value');
                this._bottomLoading = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Page.prototype, "view", {
            get: function () {
                return this._viewDeferred;
            },
            set: function (value) {
                this._viewDeferred = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Page.prototype, "action", {
            get: function () {
                return this._actionDeferred;
            },
            set: function (value) {
                this._actionDeferred = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Page.prototype, "enableScrollLoad", {
            get: function () {
                return this._enableScrollLoad;
            },
            set: function (value) {
                this._enableScrollLoad = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Page.prototype, "viewHtml", {
            get: function () {
                return this.nodes().container.innerHTML;
            },
            set: function (value) {
                this.nodes().content.innerHTML = value;
                var q = this.nodes().content.querySelector('[ch-part="header"]');
                if (q)
                    this.nodes().header.appendChild(q);
                q = this.nodes().content.querySelector('[ch-part="footer"]');
                if (q)
                    this.nodes().footer.appendChild(q);
                this.viewChanged.fire();
            },
            enumerable: true,
            configurable: true
        });
        Page.getPageName = function (routeData) {
            var name;
            if (routeData.pageName()) {
                var route = window['crossroads'].addRoute(routeData.pageName());
                name = route.interpolate(routeData.values());
            }
            else {
                name = routeData.values().controller + '.' + routeData.values().action;
            }
            return name;
        };
        Object.defineProperty(Page.prototype, "routeData", {
            get: function () {
                return this._routeData;
            },
            set: function (value) {
                this._routeData = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Page.prototype, "name", {
            get: function () {
                if (!this._name)
                    this._name = Page.getPageName(this.routeData);
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Page.prototype.node = function () {
            return this._pageNode.container;
        };
        Page.prototype.nodes = function () {
            return this._pageNode;
        };
        Object.defineProperty(Page.prototype, "previous", {
            get: function () {
                return this._prevous;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Page.prototype, "scrollType", {
            get: function () {
                return this._scrollType;
            },
            enumerable: true,
            configurable: true
        });
        Page.prototype.hide = function (swipe) {
            if (!$(this.node()).is(':visible'))
                return;
            swipe = swipe || SwipeDirection.None;
            this.hidePageNode(swipe);
        };
        Page.prototype.show = function (swipe) {
            if ($(this.node()).is(':visible'))
                return;
            swipe = swipe || SwipeDirection.None;
            this.showPageNode(swipe);
        };
        Page.prototype.visible = function () {
            return $(this.node()).is(':visible');
        };
        Page.prototype.hidePageNode = function (swipe) {
            var _this = this;
            this.on_hiding({});
            if (!window['move']) {
                swipe = SwipeDirection.None;
                console.warn('Move is not loaded and swipe is auto disabled.');
            }
            var result = $.Deferred();
            var container_width = $(this.nodes().container).width();
            var container_height = $(this.nodes().container).height();
            var on_end = function () {
                $(_this.node()).hide();
                result.resolve();
                _this.on_hidden({});
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
        };
        Page.prototype.showPageNode = function (swipe) {
            var _this = this;
            if (!window['move']) {
                swipe = SwipeDirection.None;
                console.warn('Move is not loaded and swipe is auto disabled.');
            }
            this.on_showing({});
            var result = $.Deferred();
            this.node().style.display = 'block';
            var container_width = $(this.nodes().container).width();
            var container_height = $(this.nodes().container).height();
            var on_end = function () {
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
                    move(this.node()).x(0 - container_width).duration(0).end();
                    move(this.node()).x(0).duration(this._showTime).end(on_end);
                    break;
                case SwipeDirection.Left:
                    move(this.node()).x(container_width).duration(0).end();
                    move(this.node()).x(0).duration(this._showTime).end(on_end);
                    break;
            }
            result.done(function () {
                //if (this._prevous != null)
                //    this._prevous.hide();
                _this.on_shown({});
            });
            return result;
        };
        Page.prototype.fireEvent = function (callback, args) {
            var _this = this;
            if (this.actionExecuted.state() == 'resolved')
                return eventDeferred(callback, this, args);
            return this.actionExecuted.pipe(function () { return eventDeferred(callback, _this, args); });
        };
        Page.prototype.disableHeaderFooterTouchMove = function () {
            $([this.nodes().footer, this.nodes().header]).on('touchmove', function (e) {
                e.preventDefault();
            });
        };
        Page.prototype.on_load = function (args) {
            var _this = this;
            var load_args = args instanceof PageLoadArguments ?
                args : new PageLoadArguments(this, args.loadType, args.loading);
            if (load_args.loading == null) {
                load_args.loading = load_args.loadType == chitu.PageLoadType.scroll ? this.bottomLoading : this.formLoading;
            }
            load_args.loading.show();
            var result = this.fireEvent(this.load, load_args);
            result.done(function () { return load_args.loading.hide(); });
            if (this.view == null) {
                result.done(function () { return _this.on_loadCompleted(load_args); });
            }
            else {
                if (this.view.state() == 'resolved') {
                    result.done(function () { return _this.on_loadCompleted(load_args); });
                }
                else {
                    $.when(this.view, result).done(function () { return _this.on_loadCompleted(load_args); });
                }
            }
            return result;
        };
        Page.prototype.on_loadCompleted = function (args) {
            var _this = this;
            return this.fireEvent(this.loadCompleted, args).done(function () {
                window.setTimeout(function () { return _this.refreshUI(); }, 100);
            });
        };
        Page.prototype.on_closing = function (args) {
            return this.fireEvent(this.closing, args);
        };
        Page.prototype.on_closed = function (args) {
            return this.fireEvent(this.closed, args);
        };
        Page.prototype.on_scroll = function (args) {
            return this.fireEvent(this.scroll, args);
        };
        Page.prototype.on_showing = function (args) {
            return this.fireEvent(this.showing, args);
        };
        Page.prototype.on_shown = function (args) {
            return this.fireEvent(this.shown, args);
        };
        Page.prototype.on_hiding = function (args) {
            return this.fireEvent(this.hiding, args);
        };
        Page.prototype.on_hidden = function (args) {
            return this.fireEvent(this.hidden, args);
        };
        Page.prototype.on_scrollEnd = function (args) {
            return this.fireEvent(this.scrollEnd, args);
        };
        Page.prototype.open = function (args, swipe) {
            var _this = this;
            if (this._openResult)
                return this._openResult;
            swipe = swipe || SwipeDirection.None;
            var result = this.showPageNode(swipe);
            var load_args = this.createPageLoadArguments(args, chitu.PageLoadType.open, this.formLoading);
            load_args.loading.show();
            if (this.view == null && this.viewHtml == null) {
                throw chitu.Errors.viewCanntNull();
            }
            if (this.action) {
                this.action.done(function (action) {
                    action.execute(_this);
                    _this.actionExecuted.resolve();
                    if (_this.view) {
                        _this.view.done(function (html) { return _this.viewHtml = html; });
                    }
                    _this.on_load(load_args);
                });
            }
            return result;
        };
        Page.prototype.close = function (args, swipe) {
            /// <summary>
            /// Colse the page.
            /// </summary>
            /// <param name="args" type="Object" canBeNull="true">
            /// The value passed to the hide event functions.
            /// </param>
            var _this = this;
            if (this.is_closed)
                return;
            this.on_closing(args);
            if (this.visible()) {
                this.hidePageNode(swipe).done(function () {
                    $(_this.node()).remove();
                });
            }
            else {
                $(this.node()).remove();
            }
            args = args || {};
            this.on_closed(args);
            this.is_closed = true;
        };
        Page.page_scrollEnd = function (sender, args) {
            //scrollStatus = ScrollStatus.ScrollEnd;
            var scrollTop = args.scrollTop;
            var scrollHeight = args.scrollHeight;
            var clientHeight = args.clientHeight;
            var marginBottom = clientHeight / 3;
            if (clientHeight + scrollTop < scrollHeight - marginBottom)
                return;
            if (!sender.enableScrollLoad)
                return;
            var scroll_arg = $.extend(sender.routeData.values(), {
                loadType: PageLoadType.scroll,
                loading: sender.bottomLoading,
            });
            var result = sender.on_load(scroll_arg);
        };
        Page.prototype.refreshUI = function () {
            if (this.ios_scroller) {
                this.ios_scroller.refresh();
            }
        };
        Page.animationTime = 300;
        return Page;
    })();
    chitu.Page = Page;
})(chitu || (chitu = {}));
;

var chitu;
(function (chitu) {
    var PageContext = (function () {
        function PageContext(view, routeData) {
            this._view = view;
            this._routeData = routeData;
        }
        PageContext.prototype.view = function () {
            return this._view;
        };
        PageContext.prototype.routeData = function () {
            return this._routeData;
        };
        return PageContext;
    })();
    chitu.PageContext = PageContext;
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    var Route = (function () {
        function Route(name, pattern, defaults) {
            this._name = name;
            this._pattern = pattern;
            this._defaults = defaults;
        }
        Route.prototype.name = function () {
            return this._name;
        };
        Route.prototype.defaults = function () {
            return this._defaults;
        };
        Route.prototype.url = function () {
            return this._pattern;
        };
        return Route;
    })();
    chitu.Route = Route;
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    var ns = chitu;
    var e = chitu.Errors;
    var RouteCollection = (function () {
        function RouteCollection() {
            this._init();
        }
        RouteCollection.prototype._init = function () {
            var crossroads = window['crossroads'];
            this._source = crossroads.create();
            this._source.ignoreCase = true;
            this._source.normalizeFn = crossroads.NORM_AS_OBJECT;
            this._priority = 0;
        };
        RouteCollection.prototype.count = function () {
            return this._source.getNumRoutes();
        };
        RouteCollection.prototype.mapRoute = function (args) {
            args = args || {};
            var name = args.name;
            var url = args.url;
            var defaults = args.defaults;
            var rules = args.rules || {};
            if (!name)
                throw e.argumentNull('name');
            if (!url)
                throw e.argumentNull('url');
            this._priority = this._priority + 1;
            var route = new chitu.Route(name, url, defaults);
            route.viewPath = args.viewPath;
            route.actionPath = args.actionPath;
            var originalRoute = this._source.addRoute(url, function (args) {
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
        };
        RouteCollection.prototype.getRouteData = function (url) {
            var data = this._source.getRouteData(url);
            if (data == null)
                throw e.canntParseUrl(url);
            var values = {};
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
        };
        RouteCollection.defaultRouteName = 'default';
        return RouteCollection;
    })();
    chitu.RouteCollection = RouteCollection;
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    var RouteData = (function () {
        function RouteData(url) {
            this._url = url;
        }
        RouteData.prototype.values = function (value) {
            if (value === void 0) { value = undefined; }
            if (value !== undefined)
                this._values = value;
            return this._values;
        };
        RouteData.prototype.viewPath = function (value) {
            if (value === void 0) { value = undefined; }
            if (value !== undefined)
                this._viewPath = value;
            return this._viewPath;
        };
        RouteData.prototype.actionPath = function (value) {
            if (value === void 0) { value = undefined; }
            if (value !== undefined)
                this._actionPath = value;
            return this._actionPath;
        };
        RouteData.prototype.pageName = function (value) {
            if (value === void 0) { value = undefined; }
            if (value !== undefined)
                this._pageName = value;
            return this._pageName;
        };
        RouteData.prototype.url = function () {
            return this._url;
        };
        return RouteData;
    })();
    chitu.RouteData = RouteData;
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    var ScrollArguments = (function () {
        function ScrollArguments() {
        }
        return ScrollArguments;
    })();
    chitu.ScrollArguments = ScrollArguments;
    var DivScroll = (function () {
        function DivScroll(page) {
            var cur_scroll_args = new ScrollArguments();
            var pre_scroll_top;
            var checking_num;
            var CHECK_INTERVAL = 300;
            var scrollEndCheck = function (page) {
                if (checking_num != null)
                    return;
                checking_num = 0;
                checking_num = window.setInterval(function () {
                    if (pre_scroll_top == cur_scroll_args.scrollTop) {
                        window.clearInterval(checking_num);
                        checking_num = null;
                        pre_scroll_top = null;
                        page.on_scrollEnd(cur_scroll_args);
                        return;
                    }
                    pre_scroll_top = cur_scroll_args.scrollTop;
                }, CHECK_INTERVAL);
            };
            var wrapper_node = page.nodes().body;
            wrapper_node.onscroll = function () {
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
        return DivScroll;
    })();
    chitu.DivScroll = DivScroll;
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    var cur_scroll_args = new chitu.ScrollArguments();
    var pre_scroll_top;
    var checking_num;
    var CHECK_INTERVAL = 300;
    function scrollEndCheck(page) {
        if (checking_num != null)
            return;
        checking_num = 0;
        checking_num = window.setInterval(function () {
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
    var DocumentScroll = (function () {
        function DocumentScroll(page) {
            $(document).scroll(function (event) {
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
            page.shown.add(function (sender) {
                var value = $(page.node()).data(page.name + '_scroll_top');
                if (value != null)
                    $(document).scrollTop(new Number(value).valueOf());
            });
        }
        return DocumentScroll;
    })();
    chitu.DocumentScroll = DocumentScroll;
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    var IOSScroll = (function () {
        function IOSScroll(page) {
            var _this = this;
            requirejs(['iscroll'], function () { return _this.init(page); });
        }
        IOSScroll.prototype.init = function (page) {
            var options = {
                tap: true,
                useTransition: false,
                HWCompositing: false,
                preventDefault: true,
                probeType: 1,
            };
            var iscroller = this.iscroller = page['iscroller'] = new IScroll(page.nodes().body, options);
            iscroller.on('scrollEnd', function () {
                var scroller = this;
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
            iscroller.on('scroll', function () {
                var scroller = this;
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
            (function (scroller, wrapperNode) {
                $(wrapperNode).on('tap', function (event) {
                    if (page['iscroller'].enabled == false)
                        return;
                    var MAX_DEEPH = 4;
                    var deeph = 1;
                    var node = event.target;
                    while (node != null) {
                        if (node.tagName == 'A')
                            return window.open($(node).attr('href'), '_self');
                        node = node.parentNode;
                        deeph = deeph + 1;
                        if (deeph > MAX_DEEPH)
                            return;
                    }
                });
            })(iscroller, page.nodes().body);
            page.closing.add(function () { return iscroller.destroy(); });
            $(window).on('resize', function () {
                window.setTimeout(function () { return iscroller.refresh(); }, 500);
            });
        };
        IOSScroll.prototype.refresh = function () {
            if (this.iscroller)
                this.iscroller.refresh();
        };
        return IOSScroll;
    })();
    chitu.IOSScroll = IOSScroll;
    chitu.scroll = function (page, config) {
        $(page.nodes().body).addClass('wrapper');
        $(page.nodes().content).addClass('scroller');
        var wrapperNode = page['_wrapperNode'] = page.nodes().body;
        page['_scrollerNode'] = page.nodes().content;
    };
})(chitu || (chitu = {}));

var chitu;
(function (chitu) {
    var e = chitu.Errors;
    var Utility = (function () {
        function Utility() {
        }
        Utility.isType = function (targetType, obj) {
            for (var key in targetType.prototype) {
                if (obj[key] === undefined)
                    return false;
            }
            return true;
        };
        Utility.isDeferred = function (obj) {
            if (obj == null)
                return false;
            if (obj.pipe != null && obj.always != null && obj.done != null)
                return true;
            return false;
        };
        Utility.format = function (source, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
            var params = [arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10];
            for (var i = 0; i < params.length; i++) {
                if (params[i] == null)
                    break;
                source = source.replace(new RegExp("\\{" + i + "\\}", "g"), function () {
                    return params[i];
                });
            }
            return source;
        };
        Utility.fileName = function (url, withExt) {
            if (!url)
                throw e.argumentNull('url');
            withExt = withExt || true;
            url = url.replace('http://', '/');
            var filename = url.replace(/^.*[\\\/]/, '');
            if (withExt === true) {
                var arr = filename.split('.');
                filename = arr[0];
            }
            return filename;
        };
        Utility.log = function (msg, args) {
            if (args === void 0) { args = []; }
            if (!window.console)
                return;
            if (args == null) {
                console.log(msg);
                return;
            }
            var txt = this.format.apply(this, arguments);
            console.log(txt);
        };
        Utility.loadjs = function (modules) {
            var deferred = $.Deferred();
            requirejs(modules, function () {
                var args = [];
                for (var i = 0; i < arguments.length; i++)
                    args[i] = arguments[i];
                deferred.resolve.apply(deferred, args);
            });
            return deferred;
        };
        return Utility;
    })();
    chitu.Utility = Utility;
})(chitu || (chitu = {}));
