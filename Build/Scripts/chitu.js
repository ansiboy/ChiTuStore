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
            var _this = this;
            this.pageCreating = ns.Callbacks();
            this.pageCreated = ns.Callbacks();
            this.page_stack = [];
            this._routes = new chitu.RouteCollection();
            this._runned = false;
            this.page_closed = function (sender) {
                var item_index = -1;
                for (var i = 0; i < _this.page_stack.length; i++) {
                    if (sender == _this.page_stack[i]) {
                        item_index = i;
                        break;
                    }
                }
                if (item_index < 0)
                    return;
                _this.page_stack.splice(item_index, 1);
            };
            this.page_shown = function (sender) {
                _this.setCurrentPage(sender);
            };
            if (config == null)
                throw e.argumentNull('container');
            this._config = config;
            this._config.openSwipe = config.openSwipe || function (routeData) { return chitu.SwipeDirection.None; };
            this._config.closeSwipe = config.closeSwipe || function (routeData) { return chitu.SwipeDirection.None; };
            this._config.container = config.container || function (routeData, previous) {
                return chitu.PageContainerFactory.createPageContainer(routeData, previous);
            };
        }
        Object.defineProperty(Application.prototype, "config", {
            get: function () {
                return this._config;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "pages", {
            get: function () {
                return this.page_stack;
            },
            enumerable: true,
            configurable: true
        });
        Application.prototype.on_pageCreating = function (context) {
            return chitu.fireCallback(this.pageCreating, [this, context]);
        };
        Application.prototype.on_pageCreated = function (page, context) {
            return chitu.fireCallback(this.pageCreated, [this, page]);
        };
        Application.prototype.routes = function () {
            return this._routes;
        };
        Application.prototype.setCurrentPage = function (value) {
            if (value == this.page_stack[this.page_stack.length - 1])
                return;
            var item_index = -1;
            for (var i = 0; i < this.page_stack.length; i++) {
                if (value == this.page_stack[i]) {
                    item_index = i;
                    break;
                }
            }
            if (item_index >= 0) {
                this.page_stack.splice(item_index, 1);
            }
            this.page_stack.push(value);
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
            var previous_url = '';
            if (this.previousPage() != null)
                previous_url = this.previousPage().routeData.url();
            if (previous_url.toLowerCase() == hash.substr(1).toLowerCase()) {
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
        Application.prototype.getPage = function (name) {
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
            var previous = this.currentPage();
            var page = this.createPage(url, previous);
            this.page_stack.push(page);
            console.log('page_stack lenght:' + this.page_stack.length);
            if (this.page_stack.length > PAGE_STACK_MAX_SIZE) {
                var p = this.page_stack.shift();
                p.close({});
            }
            var swipe = this.config.openSwipe(routeData);
            $.extend(args, routeData.values());
            page.show(swipe);
            return page;
        };
        Application.prototype.createPageNode = function () {
            var element = document.createElement('div');
            return element;
        };
        Application.prototype.closeCurrentPage = function () {
            var current = this.currentPage();
            var previous = this.previousPage();
            if (current == null) {
                return;
            }
            var swipe = this.config.closeSwipe(current.routeData);
            if (swipe == chitu.SwipeDirection.None) {
                current.close({}, swipe);
                if (previous != null)
                    previous.show(chitu.SwipeDirection.None);
            }
            else {
                if (previous != null)
                    previous.show(chitu.SwipeDirection.None);
                current.close({}, swipe);
            }
            console.log('page_stack lenght:' + this.page_stack.length);
        };
        Application.prototype.createPage = function (url, previousPage) {
            if (!url)
                throw e.argumentNull('url');
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
            var container = this.config.container(routeData);
            var page = new ns.Page(container, routeData, action_deferred, view_deferred, previousPage);
            page.routeData = routeData;
            this.on_pageCreated(page, context);
            page.closed.add(this.page_closed);
            page.shown.add(this.page_shown);
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
    var ScrollArguments = (function () {
        function ScrollArguments() {
        }
        return ScrollArguments;
    })();
    chitu.ScrollArguments = ScrollArguments;
    var WebPageContainer = (function () {
        function WebPageContainer(prevous) {
            this.animationTime = 300;
            this.scrollEnd = $.Callbacks();
            this.is_dispose = false;
            var node = document.createElement('div');
            node.className = 'page-container';
            document.body.appendChild(node);
            var topBar = document.createElement('div');
            var bottomBar = document.createElement('div');
            var body = document.createElement('div');
            topBar.className = 'page-topBar';
            bottomBar.className = 'page-bottomBar';
            node.appendChild(topBar);
            node.appendChild(body);
            node.appendChild(bottomBar);
            this._topBar = topBar;
            this._bottomBar = bottomBar;
            this._node = node;
            this.previous = prevous;
            this.nodes = new chitu.PageNodes(body);
            this.disableHeaderFooterTouchMove();
            $(this._node).hide();
        }
        WebPageContainer.prototype.show = function (swipe) {
            var _this = this;
            if (this.visible == true)
                return $.Deferred().resolve();
            var container_width = $(this._node).width();
            var container_height = $(this._node).height();
            var result = $.Deferred();
            var on_end = function () {
                result.resolve();
            };
            switch (swipe) {
                case chitu.SwipeDirection.None:
                default:
                    $(this._node).show();
                    result = $.Deferred().resolve();
                    break;
                case chitu.SwipeDirection.Down:
                    this.translateY(0 - container_height, 0);
                    $(this._node).show();
                    window.setTimeout(function () {
                        _this.translateY(0, _this.animationTime).done(on_end);
                    }, 30);
                    break;
                case chitu.SwipeDirection.Up:
                    this.translateY(container_height, 0);
                    $(this._node).show();
                    window.setTimeout(function () {
                        _this.translateY(0, _this.animationTime).done(on_end);
                    }, 30);
                    break;
                case chitu.SwipeDirection.Right:
                    this.translateX(0 - container_width, 0);
                    $(this._node).show();
                    window.setTimeout(function () {
                        _this.translateX(0, _this.animationTime).done(on_end);
                    }, 30);
                    break;
                case chitu.SwipeDirection.Left:
                    this.translateX(container_width, 0);
                    $(this._node).show();
                    window.setTimeout(function () {
                        _this.translateX(0, _this.animationTime).done(on_end);
                    }, 30);
                    break;
            }
            return result;
        };
        WebPageContainer.prototype.translateDuration = function (duration) {
            if (duration < 0)
                throw chitu.Errors.paramError('Parameter duration must greater or equal 0, actual is ' + duration + '.');
            var result = $.Deferred();
            if (duration == 0) {
                this._node.style.transitionDuration =
                    this._node.style.webkitTransitionDuration = '';
                return result.resolve();
            }
            this._node.style.transitionDuration =
                this._node.style.webkitTransitionDuration = duration + 'ms';
            window.setTimeout(function () { return result.resolve(); }, duration);
            return result;
        };
        WebPageContainer.prototype.translateX = function (x, duration) {
            var result = this.translateDuration(duration);
            this._node.style.transform = this._node.style.webkitTransform
                = 'translateX(' + x + 'px)';
            return result;
        };
        WebPageContainer.prototype.translateY = function (y, duration) {
            var result = this.translateDuration(duration);
            this._node.style.transform = this._node.style.webkitTransform
                = 'translateY(' + y + 'px)';
            return result;
        };
        WebPageContainer.prototype.disableHeaderFooterTouchMove = function () {
            $([this.topBar, this.bottomBar]).on('touchmove', function (e) {
                e.preventDefault();
            });
        };
        WebPageContainer.prototype.wrapPageNode = function () {
        };
        WebPageContainer.prototype.hide = function (swipe) {
            var _this = this;
            if (this.visible == false)
                return $.Deferred().resolve();
            var container_width = $(this._node).width();
            var container_height = $(this._node).height();
            var result;
            switch (swipe) {
                case chitu.SwipeDirection.None:
                default:
                    result = $.Deferred().resolve();
                    break;
                case chitu.SwipeDirection.Down:
                    result = this.translateY(container_height, this.animationTime);
                    break;
                case chitu.SwipeDirection.Up:
                    result = this.translateY(0 - container_height, this.animationTime);
                    break;
                case chitu.SwipeDirection.Right:
                    result = this.translateX(container_width, this.animationTime);
                    break;
                case chitu.SwipeDirection.Left:
                    result = this.translateX(0 - container_width, this.animationTime);
                    break;
            }
            result.done(function () { return $(_this._node).hide(); });
            return result;
        };
        WebPageContainer.prototype.dispose = function () {
            if (this.is_dispose)
                return;
            this.is_dispose = true;
            $(this._node).remove();
        };
        Object.defineProperty(WebPageContainer.prototype, "topBar", {
            get: function () {
                return this._topBar;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebPageContainer.prototype, "bottomBar", {
            get: function () {
                return this._bottomBar;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebPageContainer.prototype, "loading", {
            get: function () {
                return this.nodes.loading;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebPageContainer.prototype, "visible", {
            get: function () {
                return $(this._node).is(':visible');
            },
            set: function (value) {
                if (value)
                    $(this._node).show();
                else
                    $(this._node).hide();
            },
            enumerable: true,
            configurable: true
        });
        return WebPageContainer;
    })();
    chitu.WebPageContainer = WebPageContainer;
})(chitu || (chitu = {}));
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var chitu;
(function (chitu) {
    var DivPageContainer = (function (_super) {
        __extends(DivPageContainer, _super);
        function DivPageContainer(previous) {
            var _this = this;
            _super.call(this, previous);
            this.cur_scroll_args = new chitu.ScrollArguments();
            this.CHECK_INTERVAL = 300;
            $(this.nodes.container).addClass('div');
            var wrapper_node = this.nodes.body;
            wrapper_node.onscroll = function () {
                var args = {
                    scrollTop: wrapper_node.scrollTop,
                    scrollHeight: wrapper_node.scrollHeight,
                    clientHeight: wrapper_node.clientHeight
                };
                _this.scrollEndCheck();
            };
        }
        DivPageContainer.prototype.on_scrollEnd = function (args) {
            this.scrollEnd.fire(this, args);
        };
        DivPageContainer.prototype.scrollEndCheck = function () {
            var _this = this;
            if (this.checking_num != null)
                return;
            this.checking_num = 0;
            this.checking_num = window.setInterval(function () {
                if (_this.pre_scroll_top == _this.cur_scroll_args.scrollTop) {
                    window.clearInterval(_this.checking_num);
                    _this.checking_num = null;
                    _this.pre_scroll_top = null;
                    _this.on_scrollEnd(_this.cur_scroll_args);
                    return;
                }
                _this.pre_scroll_top = _this.cur_scroll_args.scrollTop;
            }, this.CHECK_INTERVAL);
        };
        return DivPageContainer;
    })(chitu.WebPageContainer);
    chitu.DivPageContainer = DivPageContainer;
})(chitu || (chitu = {}));
var chitu;
(function (chitu) {
    var DocumentPageContainer = (function (_super) {
        __extends(DocumentPageContainer, _super);
        function DocumentPageContainer(previous) {
            var _this = this;
            _super.call(this, previous);
            this.cur_scroll_args = new chitu.ScrollArguments();
            this.CHECK_INTERVAL = 300;
            $(this.nodes.container).addClass('doc');
            $(document).scroll(function (event) {
                // if (!page.visible())
                //     return;
                var args = {
                    scrollTop: $(document).scrollTop(),
                    scrollHeight: document.body.scrollHeight,
                    clientHeight: $(window).height()
                };
                _this.cur_scroll_args.clientHeight = args.clientHeight;
                _this.cur_scroll_args.scrollHeight = args.scrollHeight;
                _this.cur_scroll_args.scrollTop = args.scrollTop;
                _this.scrollEndCheck();
            });
        }
        DocumentPageContainer.prototype.on_scrollEnd = function (args) {
            this.scrollEnd.fire(this, args);
        };
        DocumentPageContainer.prototype.scrollEndCheck = function () {
            var _this = this;
            if (this.checking_num != null)
                return;
            this.checking_num = 0;
            this.checking_num = window.setInterval(function () {
                if (_this.pre_scroll_top == _this.cur_scroll_args.scrollTop) {
                    window.clearInterval(_this.checking_num);
                    _this.checking_num = null;
                    _this.pre_scroll_top = null;
                    _this.on_scrollEnd(_this.cur_scroll_args);
                    return;
                }
                _this.pre_scroll_top = _this.cur_scroll_args.scrollTop;
            }, this.CHECK_INTERVAL);
        };
        DocumentPageContainer.prototype.show = function (swipe) {
            if (this.previous != null)
                this.previous.hide(chitu.SwipeDirection.None);
            return _super.prototype.show.call(this, swipe);
        };
        DocumentPageContainer.prototype.hide = function (swipe) {
            var result = _super.prototype.hide.call(this, swipe);
            if (this.previous != null)
                this.previous.show(chitu.SwipeDirection.None);
            return result;
        };
        return DocumentPageContainer;
    })(chitu.WebPageContainer);
    chitu.DocumentPageContainer = DocumentPageContainer;
})(chitu || (chitu = {}));
var chitu;
(function (chitu) {
    var IScrollPageContainer = (function (_super) {
        __extends(IScrollPageContainer, _super);
        function IScrollPageContainer(previous) {
            var _this = this;
            _super.call(this, previous);
            this.scroll = $.Callbacks();
            this._is_dispose = false;
            $(this.nodes.container).addClass('ios');
            $(this.nodes.body).addClass('wrapper');
            $(this.nodes.content).addClass('scroller');
            requirejs(['iscroll'], function () { return _this.init(_this.nodes); });
        }
        IScrollPageContainer.prototype.on_scroll = function (args) {
            this.scroll.fire(this, args);
        };
        IScrollPageContainer.prototype.on_scrollEnd = function (args) {
            this.scrollEnd.fire(this, args);
        };
        IScrollPageContainer.prototype.init = function (nodes) {
            var options = {
                tap: true,
                useTransition: false,
                HWCompositing: false,
                preventDefault: true,
                probeType: 1,
            };
            var iscroller = this.iscroller = new IScroll(this.nodes.body, options);
            iscroller['page_container'] = this;
            iscroller.on('scrollEnd', function () {
                var scroller = this;
                var args = {
                    scrollTop: 0 - scroller.y,
                    scrollHeight: scroller.scrollerHeight,
                    clientHeight: scroller.wrapperHeight
                };
                scroller['page_container'].on_scrollEnd(args);
            });
            iscroller.on('scroll', function () {
                var scroller = this;
                var args = {
                    scrollTop: 0 - scroller.y,
                    scrollHeight: scroller.scrollerHeight,
                    clientHeight: scroller.wrapperHeight
                };
                scroller['page_container'].on_scroll(args);
            });
            (function (scroller, wrapperNode) {
                $(wrapperNode).on('tap', function (event) {
                    if (scroller.enabled == false)
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
            })(iscroller, this.nodes.body);
            $(window).on('resize', function () {
                window.setTimeout(function () { return iscroller.refresh(); }, 500);
            });
        };
        IScrollPageContainer.prototype.dispose = function () {
            if (this._is_dispose)
                return;
            this._is_dispose = true;
            this.iscroller.destroy();
            return _super.prototype.dispose.call(this);
        };
        IScrollPageContainer.prototype.refresh = function () {
            if (this.iscroller)
                this.iscroller.refresh();
        };
        return IScrollPageContainer;
    })(chitu.WebPageContainer);
    chitu.IScrollPageContainer = IScrollPageContainer;
})(chitu || (chitu = {}));
var chitu;
(function (chitu) {
    var OS;
    (function (OS) {
        OS[OS["ios"] = 0] = "ios";
        OS[OS["android"] = 1] = "android";
        OS[OS["other"] = 2] = "other";
    })(OS || (OS = {}));
    var Environment = (function () {
        function Environment() {
            var userAgent = navigator.userAgent;
            if (userAgent.indexOf('iPhone') > 0 || userAgent.indexOf('iPad') > 0) {
                this._os = OS.ios;
                var match = userAgent.match(/iPhone OS\s([0-9\-]*)/);
                if (match) {
                    var major_version = parseInt(match[1], 10);
                    this._version = major_version;
                }
            }
            else if (userAgent.indexOf('Android') > 0) {
                this._os = OS.android;
                var match = userAgent.match(/Android\s([0-9\.]*)/);
                if (match) {
                    var major_version = parseInt(match[1], 10);
                    this._version = major_version;
                }
            }
            else {
                this._os = OS.other;
            }
        }
        Object.defineProperty(Environment.prototype, "osVersion", {
            get: function () {
                return this._version;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Environment.prototype, "os", {
            get: function () {
                return this._os;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Environment.prototype, "isIOS", {
            get: function () {
                return this.os == OS.ios;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Environment.prototype, "isAndroid", {
            get: function () {
                return this.os == OS.android;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Environment.prototype, "isApp", {
            get: function () {
                return navigator.userAgent.indexOf("Html5Plus") >= 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Environment.prototype, "isWeb", {
            get: function () {
                return !this.isApp;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Environment.prototype, "isDegrade", {
            get: function () {
                if ((this.isWeiXin || this.osVersion <= 4) && this.isAndroid)
                    return true;
                if (navigator.userAgent.indexOf('MQQBrowser') >= 0) {
                    return true;
                }
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Environment.prototype, "isWeiXin", {
            get: function () {
                var ua = navigator.userAgent.toLowerCase();
                return (ua.match(/MicroMessenger/i)) == 'micromessenger';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Environment.prototype, "isIPhone", {
            get: function () {
                return window.navigator.userAgent.indexOf('iPhone') > 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Environment, "instance", {
            get: function () {
                if (!Environment._instance)
                    Environment._instance = new Environment();
                return Environment._instance;
            },
            enumerable: true,
            configurable: true
        });
        return Environment;
    })();
    var PageContainerFactory = (function () {
        function PageContainerFactory() {
        }
        PageContainerFactory.createPageContainer = function (routeData, previous) {
            var previous_container;
            if (previous instanceof chitu.Page)
                previous_container = previous.conatiner;
            else
                previous_container = previous;
            if (Environment.instance.isDegrade)
                return new chitu.DocumentPageContainer(previous_container);
            if (Environment.instance.isIOS) {
                return new chitu.IScrollPageContainer(previous_container);
            }
            if (Environment.instance.isAndroid && Environment.instance.osVersion >= 5)
                return new chitu.DivPageContainer(previous_container);
            return new chitu.DocumentPageContainer(previous_container);
        };
        return PageContainerFactory;
    })();
    chitu.PageContainerFactory = PageContainerFactory;
})(chitu || (chitu = {}));
var chitu;
(function (chitu) {
    var Errors = (function () {
        function Errors() {
        }
        Errors.argumentNull = function (paramName) {
            var msg = chitu.Utility.format('The argument "{0}" cannt be null.', paramName);
            return new Error(msg);
        };
        Errors.modelFileExpecteFunction = function (script) {
            var msg = chitu.Utility.format('The eval result of script file "{0}" is expected a function.', script);
            return new Error(msg);
        };
        Errors.paramTypeError = function (paramName, expectedType) {
            /// <param name="paramName" type="String"/>
            /// <param name="expectedType" type="String"/>
            var msg = chitu.Utility.format('The param "{0}" is expected "{1}" type.', paramName, expectedType);
            return new Error(msg);
        };
        Errors.paramError = function (msg) {
            return new Error(msg);
        };
        Errors.viewNodeNotExists = function (name) {
            var msg = chitu.Utility.format('The view node "{0}" is not exists.', name);
            return new Error(msg);
        };
        Errors.pathPairRequireView = function (index) {
            var msg = chitu.Utility.format('The view value is required for path pair, but the item with index "{0}" is miss it.', index);
            return new Error(msg);
        };
        Errors.notImplemented = function (name) {
            var msg = chitu.Utility.format('The method "{0}" is not implemented.', name);
            return new Error(msg);
        };
        Errors.routeExists = function (name) {
            var msg = chitu.Utility.format('Route named "{0}" is exists.', name);
            return new Error(msg);
        };
        Errors.routeResultRequireController = function (routeName) {
            var msg = chitu.Utility.format('The parse result of route "{0}" does not contains controler.', routeName);
            return new Error(msg);
        };
        Errors.routeResultRequireAction = function (routeName) {
            var msg = chitu.Utility.format('The parse result of route "{0}" does not contains action.', routeName);
            return new Error(msg);
        };
        Errors.ambiguityRouteMatched = function (url, routeName1, routeName2) {
            var msg = chitu.Utility.format('Ambiguity route matched, {0} is match in {1} and {2}.', url, routeName1, routeName2);
            return new Error(msg);
        };
        Errors.noneRouteMatched = function (url) {
            var msg = chitu.Utility.format('None route matched with url "{0}".', url);
            var error = new Error(msg);
            return error;
        };
        Errors.emptyStack = function () {
            return new Error('The stack is empty.');
        };
        Errors.canntParseUrl = function (url) {
            var msg = chitu.Utility.format('Can not parse the url "{0}" to route data.', url);
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
            var msg = chitu.Utility.format('Parameter {1} does not contains field {0}.', fileName, parameterName);
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
            return this.source.fire(context, args);
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
        PageLoadType[PageLoadType["init"] = 0] = "init";
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
        SwipeDirection[SwipeDirection["Down"] = 4] = "Down";
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
    chitu.PageNodes = PageNodes;
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
            page.conatiner.nodes.content.appendChild(this._scrollLoad_loading_bar);
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
        function Page(container, routeData, action, view, previous) {
            var _this = this;
            this._loadViewModelResult = null;
            this._openResult = null;
            this._hideResult = null;
            this._showTime = Page.animationTime;
            this._hideTime = Page.animationTime;
            this._enableScrollLoad = false;
            this.is_closed = false;
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
            this.viewChanged = ns.Callbacks();
            if (!container)
                throw e.argumentNull('container');
            if (routeData == null)
                throw e.argumentNull('scrorouteDatallType');
            if (action == null)
                throw e.argumentNull('action');
            if (view == null)
                throw e.argumentNull('view');
            this._actionDeferred = action;
            this._viewDeferred = view;
            this._prevous = previous;
            this._routeData = routeData;
            this._pageContainer = container;
            this._pageContainer.scrollEnd.add(function (sender, args) { return _this.on_scrollEnd(args); });
            this.scrollEnd.add(Page.page_scrollEnd);
            this.action.done(function (action) {
                action.execute(_this);
                if (_this.view) {
                    _this.view.done(function (html) { return _this.viewHtml = html; });
                }
                var load_args = _this.createPageLoadArguments(routeData.values(), chitu.PageLoadType.init, _this.formLoading);
                load_args.loading.show();
                _this.on_load(load_args);
            });
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
                            if ($(_this.conatiner.loading).is(':visible'))
                                return;
                            $(_this.conatiner.loading).show();
                            $(_this.conatiner.nodes.content).hide();
                        },
                        hide: function () {
                            $(_this.conatiner.loading).hide();
                            $(_this.conatiner.nodes.content).show();
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
                return this.conatiner.nodes.content.innerHTML;
            },
            set: function (value) {
                this.conatiner.nodes.content.innerHTML = value;
                this.fireEvent(this.viewChanged, {});
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
        Object.defineProperty(Page.prototype, "node", {
            get: function () {
                return this._pageContainer.nodes.container;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Page.prototype, "conatiner", {
            get: function () {
                return this._pageContainer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Page.prototype, "previous", {
            get: function () {
                return this._prevous;
            },
            enumerable: true,
            configurable: true
        });
        Page.prototype.hide = function (swipe) {
            swipe = swipe || SwipeDirection.None;
            return this._pageContainer.hide(swipe);
        };
        Page.prototype.show = function (swipe) {
            swipe = swipe || SwipeDirection.None;
            return this._pageContainer.show(swipe);
        };
        Page.prototype.visible = function () {
            return this._pageContainer.visible;
        };
        Page.prototype.fireEvent = function (callback, args) {
            return eventDeferred(callback, this, args);
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
            this._pageContainer.hide(swipe).done(function () {
                _this._pageContainer.dispose();
                args = args || {};
                _this.on_closed(args);
                _this.is_closed = true;
            });
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
            if (this._pageContainer instanceof chitu.IScrollPageContainer)
                this._pageContainer.refresh();
        };
        Page.animationTime = 300;
        return Page;
    })();
    chitu.Page = Page;
    Object.defineProperty(Page.prototype, 'iscroller', {
        get: function () {
            return this.conatiner['iscroller'];
        }
    });
})(chitu || (chitu = {}));
;
var chitu;
(function (chitu) {
    var ScrollArguments = (function () {
        function ScrollArguments() {
        }
        return ScrollArguments;
    })();
    var BasePageContainer = (function () {
        function BasePageContainer(node, prevous) {
            this.animationTime = 300;
            this.scrollEnd = $.Callbacks();
            this.is_dispose = false;
            if (!node)
                throw chitu.Errors.argumentNull('node');
            $(node).hide();
            this.previous = prevous;
            this._nodes = new chitu.PageNodes(node);
            this.disableHeaderFooterTouchMove();
        }
        BasePageContainer.prototype.show = function (swipe) {
            var _this = this;
            if (this.visible == true)
                return $.Deferred().resolve();
            var container_width = $(this.nodes.container).width();
            var container_height = $(this.nodes.container).height();
            var result = $.Deferred();
            var on_end = function () {
                result.resolve();
            };
            switch (swipe) {
                case chitu.SwipeDirection.None:
                default:
                    $(this.nodes.container).show();
                    result = $.Deferred().resolve();
                    break;
                case chitu.SwipeDirection.Down:
                    this.translateY(0 - container_height, 0);
                    $(this.nodes.container).show();
                    window.setTimeout(function () {
                        _this.translateY(0, _this.animationTime).done(on_end);
                    }, 30);
                    break;
                case chitu.SwipeDirection.Up:
                    this.translateY(container_height, 0);
                    $(this.nodes.container).show();
                    window.setTimeout(function () {
                        _this.translateY(0, _this.animationTime).done(on_end);
                    }, 30);
                    break;
                case chitu.SwipeDirection.Right:
                    this.translateX(0 - container_width, 0);
                    $(this.nodes.container).show();
                    window.setTimeout(function () {
                        _this.translateX(0, _this.animationTime).done(on_end);
                    }, 30);
                    break;
                case chitu.SwipeDirection.Left:
                    this.translateX(container_width, 0);
                    $(this.nodes.container).show();
                    window.setTimeout(function () {
                        _this.translateX(0, _this.animationTime).done(on_end);
                    }, 30);
                    break;
            }
            return result;
        };
        BasePageContainer.prototype.translateDuration = function (duration) {
            if (duration < 0)
                throw chitu.Errors.paramError('Parameter duration must greater or equal 0, actual is ' + duration + '.');
            var result = $.Deferred();
            if (duration == 0) {
                this.nodes.container.style.transitionDuration =
                    this.nodes.container.style.webkitTransitionDuration = '';
                return result.resolve();
            }
            this.nodes.container.style.transitionDuration =
                this.nodes.container.style.webkitTransitionDuration = duration + 'ms';
            window.setTimeout(function () { return result.resolve(); }, duration);
            return result;
        };
        BasePageContainer.prototype.translateX = function (x, duration) {
            var result = this.translateDuration(duration);
            this.nodes.container.style.transform = this.nodes.container.style.webkitTransform
                = 'translateX(' + x + 'px)';
            return result;
        };
        BasePageContainer.prototype.translateY = function (y, duration) {
            var result = this.translateDuration(duration);
            this.nodes.container.style.transform = this.nodes.container.style.webkitTransform
                = 'translateY(' + y + 'px)';
            return result;
        };
        BasePageContainer.prototype.disableHeaderFooterTouchMove = function () {
            $([this.footer, this.header]).on('touchmove', function (e) {
                e.preventDefault();
            });
        };
        BasePageContainer.prototype.hide = function (swipe) {
            var _this = this;
            if (this.visible == false)
                return $.Deferred().resolve();
            var container_width = $(this.nodes.container).width();
            var container_height = $(this.nodes.container).height();
            var result;
            switch (swipe) {
                case chitu.SwipeDirection.None:
                default:
                    result = $.Deferred().resolve();
                    break;
                case chitu.SwipeDirection.Down:
                    result = this.translateY(container_height, this.animationTime);
                    break;
                case chitu.SwipeDirection.Up:
                    result = this.translateY(0 - container_height, this.animationTime);
                    break;
                case chitu.SwipeDirection.Right:
                    result = this.translateX(container_width, this.animationTime);
                    break;
                case chitu.SwipeDirection.Left:
                    result = this.translateX(0 - container_width, this.animationTime);
                    break;
            }
            result.done(function () { return $(_this.nodes.container).hide(); });
            return result;
        };
        BasePageContainer.prototype.dispose = function () {
            if (this.is_dispose)
                return;
            this.is_dispose = true;
            this.nodes.container.parentNode.removeChild(this.nodes.container);
        };
        Object.defineProperty(BasePageContainer.prototype, "header", {
            get: function () {
                return this.nodes.header;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasePageContainer.prototype, "nodes", {
            get: function () {
                return this._nodes;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasePageContainer.prototype, "footer", {
            get: function () {
                return this.nodes.footer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasePageContainer.prototype, "loading", {
            get: function () {
                return this.nodes.loading;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasePageContainer.prototype, "visible", {
            get: function () {
                return $(this.nodes.container).is(':visible');
            },
            set: function (value) {
                if (value)
                    $(this.nodes.container).show();
                else
                    $(this.nodes.container).hide();
            },
            enumerable: true,
            configurable: true
        });
        return BasePageContainer;
    })();
    chitu.BasePageContainer = BasePageContainer;
})(chitu || (chitu = {}));
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
