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
            this._routes = new chitu.RouteCollection();
            this._runned = false;
            this.container_stack = new Array();
            if (config == null)
                throw e.argumentNull('container');
            this._config = config;
            this._config.openSwipe = config.openSwipe || function (routeData) { return chitu.SwipeDirection.None; };
            this._config.closeSwipe = config.closeSwipe || function (routeData) { return chitu.SwipeDirection.None; };
            this._config.container = config.container || $.proxy(function (routeData, previous) {
                return chitu.PageContainerFactory.createInstance(this.app, routeData, previous);
            }, { app: this });
        }
        Application.prototype.on_pageCreating = function (context) {
            return chitu.fireCallback(this.pageCreating, [this, context]);
        };
        Application.prototype.on_pageCreated = function (page) {
            return chitu.fireCallback(this.pageCreated, [this, page]);
        };
        Object.defineProperty(Application.prototype, "config", {
            get: function () {
                return this._config;
            },
            enumerable: true,
            configurable: true
        });
        Application.prototype.routes = function () {
            return this._routes;
        };
        Application.prototype.currentPage = function () {
            if (this.container_stack.length > 0)
                return this.container_stack[this.container_stack.length - 1].currentPage;
            return null;
        };
        Object.defineProperty(Application.prototype, "pageContainers", {
            get: function () {
                return this.container_stack;
            },
            enumerable: true,
            configurable: true
        });
        Application.prototype.createPageContainer = function (routeData) {
            var container = this.config.container(routeData, this.pageContainers[this.pageContainers.length - 1]);
            this.container_stack.push(container);
            if (this.container_stack.length > PAGE_STACK_MAX_SIZE) {
                var c = this.container_stack.shift();
                c.close(chitu.SwipeDirection.None);
            }
            return container;
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
            var url = hash.substr(1);
            var routeData = this.routes().getRouteData(url);
            var pageName = chitu.Page.getPageName(routeData);
            var page = this.getPage(pageName);
            var container = page != null ? page.container : null;
            if (container != null && $.inArray(container, this.container_stack) == this.container_stack.length - 2) {
                var c = this.container_stack.pop();
                var swipe = this.config.closeSwipe(c.currentPage.routeData);
                if (c.previous != null) {
                    c.previous.visible = true;
                }
                c.close(swipe);
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
            for (var i = this.container_stack.length - 1; i >= 0; i--) {
                var page = this.container_stack[i].pages[name];
                if (page != null)
                    return page;
            }
            return null;
        };
        Application.prototype.showPage = function (url, args) {
            var _this = this;
            if (!url)
                throw e.argumentNull('url');
            args = args || {};
            var routeData = this.routes().getRouteData(url);
            if (routeData == null) {
                throw e.noneRouteMatched(url);
            }
            var routeValues = $.extend(args, routeData.values() || {});
            routeData.values(routeValues);
            var container = this.createPageContainer(routeData);
            container.pageCreated.add(function (sender, page) { return _this.on_pageCreated(page); });
            var swipe = this.config.openSwipe(routeData);
            var page = container.showPage(routeData, swipe);
            return page;
        };
        Application.prototype.createPageNode = function () {
            var element = document.createElement('div');
            return element;
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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var chitu;
(function (chitu) {
    (function (OS) {
        OS[OS["ios"] = 0] = "ios";
        OS[OS["android"] = 1] = "android";
        OS[OS["other"] = 2] = "other";
    })(chitu.OS || (chitu.OS = {}));
    var OS = chitu.OS;
    var scroll_types = {
        div: 'div',
        iscroll: 'iscroll',
        doc: 'doc'
    };
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
    chitu.Environment = Environment;
    var ControlFactory = (function () {
        function ControlFactory() {
        }
        ControlFactory.createControls = function (element, page) {
            ControlFactory.transformElement(element);
            var controls = new Array();
            var elements = element.childNodes;
            for (var i = 0; i < elements.length; i++) {
                var element_type = elements[i].nodeType;
                if (element_type != 1)
                    continue;
                var control = ControlFactory.createControl(elements[i], page);
                if (control == null)
                    continue;
                controls.push(control);
            }
            return controls;
        };
        ControlFactory.createControl = function (element, page) {
            return Control.createControl(element, page);
        };
        ControlFactory.transformElement = function (element) {
            var node = element;
            switch (node.tagName) {
                case 'SCROLL-VIEW':
                    var scroll_type = $(node).attr('scroll-type');
                    if (scroll_type == null) {
                        if (Environment.instance.isDegrade) {
                            scroll_type = scroll_types.doc;
                        }
                        else if (Environment.instance.isIOS) {
                            scroll_type = scroll_types.iscroll;
                        }
                        else if (Environment.instance.isAndroid && Environment.instance.osVersion >= 5) {
                            scroll_type = scroll_types.div;
                        }
                        else {
                            scroll_type = scroll_types.doc;
                        }
                    }
                    if (scroll_type == scroll_types.iscroll) {
                        var scroller_node = document.createElement('scroller');
                        scroller_node.innerHTML = node.innerHTML;
                        node.innerHTML = '';
                        node.appendChild(scroller_node);
                    }
                    $(node).attr('scroll-type', scroll_type);
                    break;
            }
            for (var i = 0; i < element.childNodes.length; i++) {
                ControlFactory.transformElement(element.childNodes[i]);
            }
        };
        return ControlFactory;
    })();
    chitu.ControlFactory = ControlFactory;
    var ControlCollection = (function () {
        function ControlCollection(parent) {
            this.parent = parent;
            this.items = [];
        }
        ControlCollection.prototype.add = function (control) {
            if (control == null)
                throw chitu.Errors.argumentNull('control');
            this[this.length] = this.items[this.items.length] = control;
            control.parent = this.parent;
        };
        Object.defineProperty(ControlCollection.prototype, "length", {
            get: function () {
                return this.items.length;
            },
            enumerable: true,
            configurable: true
        });
        ControlCollection.prototype.item = function (indexOrName) {
            if (typeof (indexOrName) == 'number')
                return this.items[indexOrName];
            var name = indexOrName;
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].name == name)
                    return this.items[i];
            }
            return null;
        };
        return ControlCollection;
    })();
    chitu.ControlCollection = ControlCollection;
    var Control = (function () {
        function Control(element, page) {
            this._children = new ControlCollection(this);
            this.load = chitu.Callbacks();
            if (element == null)
                throw chitu.Errors.argumentNull('element');
            if (page == null)
                throw chitu.Errors.argumentNull('page');
            this._element = element;
            this._page = page;
            this._name = $(element).attr('name');
            $(element).data('control', this);
            this.createChildren(element, page);
        }
        ;
        Control.prototype.createChildren = function (element, page) {
            for (var i = 0; i < element.childNodes.length; i++) {
                if (element.childNodes[i].nodeType != 1)
                    continue;
                var child_control = this.createChild(element.childNodes[i], page);
                if (child_control == null)
                    continue;
                this.children.add(child_control);
            }
        };
        Control.prototype.createChild = function (element, page) {
            var child_control = ControlFactory.createControl(element, page);
            return child_control;
        };
        Object.defineProperty(Control.prototype, "visible", {
            get: function () {
                var display = this.element.style.display;
                return display != 'none';
            },
            set: function (value) {
                if (value == true)
                    this.element.style.display = 'block';
                else
                    this.element.style.display = 'none';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Control.prototype, "element", {
            get: function () {
                return this._element;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Control.prototype, "children", {
            get: function () {
                return this._children;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Control.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Control.prototype, "page", {
            get: function () {
                return this._page;
            },
            enumerable: true,
            configurable: true
        });
        Control.prototype.fireEvent = function (callback, args) {
            return chitu.fireCallback(callback, [this, args]);
        };
        Control.prototype.on_load = function (args) {
            var promises = new Array();
            promises.push(this.fireEvent(this.load, args));
            for (var i = 0; i < this.children.length; i++) {
                var promise = this.children.item(i).on_load(args);
                if (chitu.Utility.isDeferred(promise))
                    promises.push(promise);
            }
            var result = $.when.apply($, promises);
            return result;
        };
        Control.register = function (tagName, createControlMethod) {
            Control.ControlTags[tagName] = createControlMethod;
        };
        Control.createControl = function (element, page) {
            if (element == null)
                throw chitu.Errors.argumentNull('element');
            if (page == null)
                throw chitu.Errors.argumentNull('page');
            var tagName = element.tagName;
            var createControlMethod = Control.ControlTags[tagName];
            if (createControlMethod == null)
                return null;
            var instance;
            if (createControlMethod.prototype != null)
                instance = new createControlMethod(element, page);
            else
                instance = createControlMethod(element, page);
            return instance;
        };
        Control.ControlTags = {};
        return Control;
    })();
    chitu.Control = Control;
    var PageHeader = (function (_super) {
        __extends(PageHeader, _super);
        function PageHeader(element, page) {
            _super.call(this, element, page);
        }
        return PageHeader;
    })(Control);
    chitu.PageHeader = PageHeader;
    var PageFooter = (function (_super) {
        __extends(PageFooter, _super);
        function PageFooter(element, page) {
            _super.call(this, element, page);
        }
        return PageFooter;
    })(Control);
    chitu.PageFooter = PageFooter;
    var ScrollArguments = (function () {
        function ScrollArguments() {
        }
        return ScrollArguments;
    })();
    chitu.ScrollArguments = ScrollArguments;
    var ScrollView = (function (_super) {
        __extends(ScrollView, _super);
        function ScrollView(element, page) {
            _super.call(this, element, page);
            this.scroll = chitu.Callbacks();
            this.scrollEnd = chitu.Callbacks();
            this.scrollEnd.add(ScrollView.page_scrollEnd);
            var $status_bar = $(element).find('STATUS-BAR');
            if ($status_bar.length > 0) {
                this._bottomLoading = new ScrollViewStatusBar($status_bar[0], page);
            }
        }
        ScrollView.prototype.on_load = function (args) {
            var result;
            if (this.scrollLoad != null) {
                result = this.scrollLoad(this, args);
            }
            if (result != null) {
                result = $.when(result, _super.prototype.on_load.call(this, args));
            }
            else {
                result = _super.prototype.on_load.call(this, args);
            }
            return result;
        };
        ScrollView.prototype.on_scrollEnd = function (args) {
            ScrollView.scrolling = false;
            return chitu.fireCallback(this.scrollEnd, [this, args]);
        };
        ScrollView.prototype.on_scroll = function (args) {
            ScrollView.scrolling = true;
            return chitu.fireCallback(this.scroll, [this, args]);
        };
        ScrollView.createInstance = function (element, page) {
            var scroll_type = $(element).attr('scroll-type');
            if (scroll_type == scroll_types.doc)
                return new DocumentScrollView(element, page);
            if (scroll_type == scroll_types.iscroll) {
                return new IScrollView(element, page);
            }
            if (scroll_type == scroll_types.div)
                return new DivScrollView(element, page);
            return new DocumentScrollView(element, page);
        };
        Object.defineProperty(ScrollView.prototype, "bottomLoading", {
            get: function () {
                return this._bottomLoading;
            },
            enumerable: true,
            configurable: true
        });
        ScrollView.page_scrollEnd = function (sender, args) {
            var scrollTop = args.scrollTop;
            var scrollHeight = args.scrollHeight;
            var clientHeight = args.clientHeight;
            var marginBottom = clientHeight / 3;
            if (clientHeight + scrollTop < scrollHeight - marginBottom)
                return;
            if (sender.scrollLoad != null) {
                var result = sender.scrollLoad(sender, args);
                result.done(function () {
                    if (sender.bottomLoading != null) {
                        sender.bottomLoading.visible = args.enableScrollLoad != false;
                    }
                });
            }
        };
        ScrollView.scrolling = false;
        return ScrollView;
    })(Control);
    chitu.ScrollView = ScrollView;
    var DocumentScrollView = (function (_super) {
        __extends(DocumentScrollView, _super);
        function DocumentScrollView(element, page) {
            var _this = this;
            _super.call(this, element, page);
            this.cur_scroll_args = new ScrollArguments();
            this.CHECK_INTERVAL = 300;
            $(document).scroll(function (event) {
                var args = new ScrollArguments();
                args.scrollTop = $(document).scrollTop();
                args.scrollHeight = document.body.scrollHeight;
                args.clientHeight = $(window).height();
                _this.cur_scroll_args.clientHeight = args.clientHeight;
                _this.cur_scroll_args.scrollHeight = args.scrollHeight;
                _this.cur_scroll_args.scrollTop = args.scrollTop;
                _this.scrollEndCheck();
            });
        }
        DocumentScrollView.createElement = function (html, page) {
            var element = document.createElement('div');
            element.innerHTML = html;
            page.element.appendChild(element);
            return element;
        };
        DocumentScrollView.prototype.scrollEndCheck = function () {
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
        return DocumentScrollView;
    })(ScrollView);
    var DivScrollView = (function (_super) {
        __extends(DivScrollView, _super);
        function DivScrollView(element, page) {
            var _this = this;
            _super.call(this, element, page);
            this.cur_scroll_args = new ScrollArguments();
            this.CHECK_INTERVAL = 30;
            this.element.onscroll = function () {
                _this.cur_scroll_args.scrollTop = _this.element.scrollTop;
                _this.cur_scroll_args.clientHeight = _this.element.clientHeight;
                _this.cur_scroll_args.scrollHeight = _this.element.scrollHeight;
                _this.on_scroll(_this.cur_scroll_args);
                _this.scrollEndCheck();
            };
        }
        DivScrollView.prototype.scrollEndCheck = function () {
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
        return DivScrollView;
    })(ScrollView);
    var ScrollViewStatusBar = (function (_super) {
        __extends(ScrollViewStatusBar, _super);
        function ScrollViewStatusBar(element, page) {
            _super.call(this, element, page);
            element.innerHTML =
                '<div name="scrollLoad_loading" style="padding:10px 0px 10px 0px;"> \
        <h5 class="text-center"> \
                <i class="icon-spinner icon-spin"></i><span style="padding-left:10px;">数据正在加载中...</span> \
            </h5> \
    </div>';
        }
        return ScrollViewStatusBar;
    })(Control);
    chitu.ScrollViewStatusBar = ScrollViewStatusBar;
    var IScrollView = (function (_super) {
        __extends(IScrollView, _super);
        function IScrollView(element, page) {
            var _this = this;
            _super.call(this, element, page);
            requirejs(['iscroll'], function () { return _this.init(_this.element); });
        }
        IScrollView.prototype.init = function (element) {
            var options = {
                tap: true,
                useTransition: false,
                HWCompositing: false,
                preventDefault: true,
                probeType: 1,
            };
            var iscroller = this.iscroller = new IScroll(element, options);
            iscroller['page_container'] = this;
            iscroller.on('scrollEnd', function () {
                var scroller = this;
                var args = {
                    scrollTop: 0 - scroller.y,
                    scrollHeight: scroller.scrollerHeight,
                    clientHeight: scroller.wrapperHeight
                };
                control.on_scrollEnd(args);
            });
            var control = this;
            iscroller.on('scroll', function () {
                var scroller = this;
                var args = {
                    scrollTop: 0 - scroller.y,
                    scrollHeight: scroller.scrollerHeight,
                    clientHeight: scroller.wrapperHeight
                };
                control.on_scroll(args);
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
            })(iscroller, element);
            $(window).on('resize', function () {
                window.setTimeout(function () { return iscroller.refresh(); }, 500);
            });
        };
        IScrollView.prototype.refresh = function () {
            if (this.iscroller != null)
                this.iscroller.refresh();
        };
        return IScrollView;
    })(ScrollView);
    chitu.IScrollView = IScrollView;
    var FormLoading = (function (_super) {
        __extends(FormLoading, _super);
        function FormLoading(element, page) {
            _super.call(this, element, page);
            this._loaded_count = 0;
            this.loading_element = document.createElement('page-loading');
            this.loading_element.className = 'page-loading';
            this.loading_element.innerHTML = this.defaultHtml();
            element.appendChild(this.loading_element);
        }
        FormLoading.prototype.defaultHtml = function () {
            var html = '<div class="spin"><i class="icon-spinner icon-spin"></i><div>';
            return html;
        };
        Object.defineProperty(FormLoading.prototype, "loaded_count", {
            set: function (value) {
                this._loaded_count = this._loaded_count + 1;
                if (this._loaded_count >= this.children.length) {
                    this.loading_element.style.display = 'none';
                    for (var j = 0; j < this.children.length; j++) {
                        this.children[j].visible = true;
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        FormLoading.prototype.createChild = function (element, page) {
            var self = this;
            var control = _super.prototype.createChild.call(this, element, page);
            if (control == null)
                return;
            control.visible = false;
            control.on_load = function (args) {
                var result = FormLoading._on_load.apply(this, [args]);
                if (chitu.Utility.isDeferred(result)) {
                    result.done(function () { return self.loaded_count = self.loaded_count + 1; });
                }
                else {
                    self.loaded_count = self.loaded_count + 1;
                }
                return result;
            };
            return control;
        };
        FormLoading._on_load = Control.prototype.on_load;
        return FormLoading;
    })(Control);
    chitu.FormLoading = FormLoading;
    Control.register('FORM-LOADING', FormLoading);
    Control.register('HEADER', PageHeader);
    Control.register('TOP-BAR', PageHeader);
    Control.register('SCROLL-VIEW', ScrollView.createInstance);
    Control.register('FOOTER', PageFooter);
    Control.register('BOTTOM-BAR', PageFooter);
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
            this.showing = ns.Callbacks();
            this.shown = ns.Callbacks();
            this.hiding = ns.Callbacks();
            this.hidden = ns.Callbacks();
            this.viewChanged = ns.Callbacks();
            if (!container)
                throw e.argumentNull('container');
            if (routeData == null)
                throw e.argumentNull('scrorouteDatallType');
            if (action == null)
                throw e.argumentNull('action');
            if (view == null)
                throw e.argumentNull('view');
            this._pageContainer = container;
            this._node = document.createElement('div');
            this._actionDeferred = action;
            this._viewDeferred = view;
            this._prevous = previous;
            this._routeData = routeData;
            this.action.done(function (action) {
                action.execute(_this);
                if (_this.view) {
                    _this.view.done(function (html) {
                        _this.element.innerHTML = html;
                        _this._controls = _this.createControls(_this.element);
                        _this.viewHtml = html;
                        _this.on_load(routeData.values());
                    });
                }
            });
        }
        Page.prototype.createControls = function (element) {
            this._controls = chitu.ControlFactory.createControls(element, this);
            var stack = new Array();
            for (var i = 0; i < this._controls.length; i++) {
                stack.push(this._controls[i]);
            }
            return this._controls;
        };
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
                return this._viewHtml;
            },
            set: function (value) {
                this._viewHtml = value;
                this.on_viewChanged({});
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
        Object.defineProperty(Page.prototype, "element", {
            get: function () {
                return this._node;
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
        Object.defineProperty(Page.prototype, "visible", {
            get: function () {
                return $(this._node).is(':visible');
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Page.prototype, "container", {
            get: function () {
                return this._pageContainer;
            },
            enumerable: true,
            configurable: true
        });
        Page.prototype.hide = function (swipe) {
            swipe = swipe || SwipeDirection.None;
            return this.container.hide(swipe);
        };
        Page.prototype.findControl = function (name) {
            if (!name)
                throw chitu.Errors.argumentNull('name');
            var stack = new Array();
            for (var i = 0; i < this._controls.length; i++) {
                var control = this._controls[i];
                stack.push(control);
            }
            while (stack.length > 0) {
                var control = stack.pop();
                if (control.name == name)
                    return control;
                for (var i = 0; i < control.children.length; i++)
                    stack.push(control.children[i]);
            }
            return null;
        };
        Page.prototype.fireEvent = function (callback, args) {
            return chitu.fireCallback(callback, [this, args]);
        };
        Page.prototype.on_load = function (args) {
            var _this = this;
            var promises = new Array();
            promises.push(this.fireEvent(this.load, args));
            for (var i = 0; i < this._controls.length; i++) {
                var p = this._controls[i].on_load(args);
                promises.push(p);
            }
            var result = $.when.apply($, promises);
            if (this.view == null) {
                result.done(function () { return _this.on_loadCompleted(args); });
            }
            else {
                if (this.view.state() == 'resolved') {
                    result.done(function () { return _this.on_loadCompleted(args); });
                }
                else {
                    $.when(this.view, result).done(function () { return _this.on_loadCompleted(args); });
                }
            }
            return result;
        };
        Page.prototype.on_loadCompleted = function (args) {
            var result = this.fireEvent(this.loadCompleted, args);
        };
        Page.prototype.on_closing = function (args) {
            return this.fireEvent(this.closing, args);
        };
        Page.prototype.on_closed = function (args) {
            return this.fireEvent(this.closed, args);
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
        Page.prototype.on_viewChanged = function (args) {
            return this.fireEvent(this.viewChanged, args);
        };
        Page.animationTime = 300;
        return Page;
    })();
    chitu.Page = Page;
})(chitu || (chitu = {}));
;
// TODO:
// 1，关闭当页面容器并显示之前容器时，更新URL
// 2, 侧滑时，底容器带有遮罩效果。
//import Hammer = require('hammer');
var chitu;
(function (chitu) {
    var ScrollArguments = (function () {
        function ScrollArguments() {
        }
        return ScrollArguments;
    })();
    var PageContainerTypeClassNames = (function () {
        function PageContainerTypeClassNames() {
            this.Div = 'div';
            this.IScroll = 'iscroll';
            this.Document = 'doc';
        }
        return PageContainerTypeClassNames;
    })();
    var PageContainer = (function () {
        function PageContainer(app, previous) {
            this.animationTime = 300;
            this._previousOffsetRate = 0.5;
            this.enableSwipeClose = true;
            this.pageCreated = chitu.Callbacks();
            this.is_closing = false;
            this._node = this.createNode();
            this._loading = this.createLoading(this._node);
            this._pages = new Array();
            this._previous = previous;
            this._app = app;
            this.gesture = new Gesture();
            this._enableSwipeBack();
        }
        PageContainer.prototype.on_pageCreated = function (page) {
            return chitu.fireCallback(this.pageCreated, [this, page]);
        };
        PageContainer.prototype._enableSwipeBack = function () {
            var _this = this;
            var container = this;
            if (container.previous == null || this.enableSwipeClose == false)
                return;
            var previous_start_x;
            var previous_visible;
            var node = container.element;
            var colse_position = $(window).width() / 2;
            var horizontal_swipe_angle = 20;
            var pan = container.gesture.createPan(container.element);
            pan.start = function (e) {
                node.style.webkitTransform = '';
                node.style.transform = '';
                var martix = new WebKitCSSMatrix(container.previous.element.style.webkitTransform);
                previous_start_x = martix.m41;
                if (chitu.ScrollView.scrolling == true)
                    return false;
                var d = Math.atan(Math.abs(e.deltaY / e.deltaX)) / 3.14159265 * 180;
                if (d > horizontal_swipe_angle)
                    return false;
                var result = (container.previous != null && (e.direction & Hammer.DIRECTION_RIGHT) != 0) &&
                    (_this.open_swipe == chitu.SwipeDirection.Left || _this.open_swipe == chitu.SwipeDirection.Right);
                if (result == true) {
                    previous_visible = _this.previous.visible;
                    _this.previous.visible = true;
                }
                return result;
            };
            pan.left = function (e) {
                if (e.deltaX <= 0) {
                    move(node).x(0).duration(0).end();
                    move(_this.previous.element).x(previous_start_x).duration(0).end();
                    return;
                }
                move(node).x(e.deltaX).duration(0).end();
                move(_this.previous.element).x(previous_start_x + e.deltaX * _this._previousOffsetRate).duration(0).end();
            };
            pan.right = function (e) {
                move(node).x(e.deltaX).duration(0).end();
                move(_this.previous.element).x(previous_start_x + e.deltaX * _this._previousOffsetRate).duration(0).end();
            };
            pan.end = function (e) {
                if (e.deltaX > colse_position) {
                    _this._app.back();
                    return;
                }
                move(node).x(0).duration(chitu.Page.animationTime).end();
                move(container.previous.element).x(previous_start_x).duration(chitu.Page.animationTime)
                    .end(function () { return _this.previous.visible = previous_visible; });
            };
        };
        PageContainer.prototype.createNode = function () {
            this._node = document.createElement('div');
            this._node.className = 'page-container';
            this._node.style.display = 'none';
            document.body.appendChild(this._node);
            return this._node;
        };
        PageContainer.prototype.createLoading = function (parent) {
            var loading_element = document.createElement('div');
            loading_element.className = 'page-loading';
            loading_element.innerHTML = '<div class="spin"><i class="icon-spinner icon-spin"></i><div>';
            parent.appendChild(loading_element);
            return loading_element;
        };
        PageContainer.prototype.show = function (swipe) {
            var _this = this;
            if (this.visible == true)
                return $.Deferred().resolve();
            var container_width = $(this._node).width();
            var container_height = $(this._node).height();
            var result = $.Deferred();
            var on_end = function () {
                if (_this.previous != null)
                    _this.previous.visible = false;
                result.resolve();
            };
            this.open_swipe = swipe;
            switch (swipe) {
                case chitu.SwipeDirection.None:
                default:
                    $(this._node).show();
                    on_end();
                    break;
                case chitu.SwipeDirection.Down:
                    move(this.element).y(0 - container_height).duration(0).end();
                    $(this._node).show();
                    window.setTimeout(function () {
                        move(_this.element).y(0).duration(_this.animationTime).end(on_end);
                    }, 30);
                    break;
                case chitu.SwipeDirection.Up:
                    move(this.element).y(container_height).duration(0).end();
                    $(this._node).show();
                    window.setTimeout(function () {
                        move(_this.element).y(0).duration(_this.animationTime).end(on_end);
                    }, 30);
                    break;
                case chitu.SwipeDirection.Right:
                    move(this.element).x(0 - container_width).duration(0).end();
                    $(this._node).show();
                    window.setTimeout(function () {
                        if (_this.previous != null)
                            move(_this.previous.element).x(container_width * _this._previousOffsetRate).duration(_this.animationTime).end();
                        move(_this.element).x(0).duration(_this.animationTime).end(on_end);
                    }, 30);
                    break;
                case chitu.SwipeDirection.Left:
                    move(this.element).x(container_width).duration(0).end();
                    $(this._node).show();
                    window.setTimeout(function () {
                        if (_this.previous != null)
                            move(_this.previous.element).x(0 - container_width * _this._previousOffsetRate).duration(_this.animationTime).end();
                        move(_this.element).x(0).duration(_this.animationTime).end(on_end);
                    }, 30);
                    break;
            }
            return result;
        };
        PageContainer.prototype.hide = function (swipe) {
            if (this.visible == false)
                return $.Deferred().resolve();
            var container_width = $(this._node).width();
            var container_height = $(this._node).height();
            var result = $.Deferred();
            switch (swipe) {
                case chitu.SwipeDirection.None:
                default:
                    if (this.previous != null)
                        move(this.previous.element).x(0).duration(this.animationTime).end();
                    result.resolve();
                    break;
                case chitu.SwipeDirection.Down:
                    move(this.element).y(container_height).duration(this.animationTime).end(function () { return result.resolve(); });
                    break;
                case chitu.SwipeDirection.Up:
                    move(this.element).y(0 - container_height).duration(this.animationTime).end(function () { return result.resolve(); });
                    break;
                case chitu.SwipeDirection.Right:
                    if (this.previous != null)
                        move(this.previous.element).x(0).duration(this.animationTime).end();
                    move(this.element).x(container_width).duration(this.animationTime).end(function () { return result.resolve(); });
                    break;
                case chitu.SwipeDirection.Left:
                    if (this.previous != null)
                        move(this.previous.element).x(0).duration(this.animationTime).end();
                    move(this.element).x(0 - container_width).duration(this.animationTime).end(function () { return result.resolve(); });
                    break;
            }
            return result;
        };
        PageContainer.prototype.close = function (swipe) {
            var _this = this;
            if (this.is_closing)
                return;
            this.is_closing = true;
            this.hide(swipe).done(function () {
                $(_this._node).remove();
            });
        };
        PageContainer.prototype.showLoading = function () {
            this._loading.style.display = 'block';
        };
        PageContainer.prototype.hideLoading = function () {
            this._loading.style.display = 'none';
        };
        Object.defineProperty(PageContainer.prototype, "visible", {
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
        Object.defineProperty(PageContainer.prototype, "element", {
            get: function () {
                return this._node;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PageContainer.prototype, "currentPage", {
            get: function () {
                return this._currentPage;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PageContainer.prototype, "pages", {
            get: function () {
                return this._pages;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PageContainer.prototype, "previous", {
            get: function () {
                return this._previous;
            },
            enumerable: true,
            configurable: true
        });
        PageContainer.prototype.createPage = function (routeData) {
            var controllerName = routeData.values().controller;
            var actionName = routeData.values().action;
            var view_deferred = chitu.createViewDeferred(routeData);
            var action_deferred = chitu.createActionDeferred(routeData);
            var context = new chitu.PageContext(view_deferred, routeData);
            var previousPage;
            if (this._pages.length > 0)
                previousPage = this._pages[this._pages.length - 1];
            var page = new chitu.Page(this, routeData, action_deferred, view_deferred, previousPage);
            this.on_pageCreated(page);
            this._pages.push(page);
            this._pages[page.name] = page;
            return page;
        };
        PageContainer.prototype.showPage = function (routeData, swipe) {
            var _this = this;
            var page = this.createPage(routeData);
            this.element.appendChild(page.element);
            this._currentPage = page;
            page.on_showing(routeData.values());
            this.show(swipe).done(function () {
                page.on_shown(routeData.values());
            });
            page.loadCompleted.add(function () { return _this.hideLoading(); });
            return page;
        };
        return PageContainer;
    })();
    chitu.PageContainer = PageContainer;
    var PageContainerFactory = (function () {
        function PageContainerFactory(app) {
            this._app = app;
        }
        PageContainerFactory.createInstance = function (app, routeData, previous) {
            return new PageContainer(app, previous);
        };
        return PageContainerFactory;
    })();
    chitu.PageContainerFactory = PageContainerFactory;
    var Pan = (function () {
        function Pan(gesture) {
            this.cancel = false;
        }
        return Pan;
    })();
    chitu.Pan = Pan;
    var Gesture = (function () {
        function Gesture() {
            var _this = this;
            this._prevent = {
                pan: Hammer.DIRECTION_NONE
            };
            this.prevent = {
                pan: function (direction) {
                    _this._prevent.pan = direction;
                }
            };
            this.executedCount = 0;
            this.hammersCount = 0;
        }
        Gesture.prototype.getHammer = function (element) {
            var _this = this;
            var hammer = $(element).data('hammer');
            if (hammer == null) {
                hammer = new Hammer.Manager(element);
                hammer.add(new Hammer.Pan({ direction: Hammer.DIRECTION_HORIZONTAL }));
                $(element).data('hammer', hammer);
                this.hammersCount = this.hammersCount + 1;
                hammer.on('pan', function (e) {
                    var pans = _this.getPans(hammer.element);
                    for (var i = pans.length - 1; i >= 0; i--) {
                        var state = hammer.get('pan').state;
                        if (pans[i]['started'] == null && (state & Hammer.STATE_BEGAN) == Hammer.STATE_BEGAN) {
                            pans[i]['started'] = pans[i].start(e);
                        }
                        var exected = false;
                        var started = pans[i]['started'];
                        if (started == true) {
                            if ((e.direction & Hammer.DIRECTION_LEFT) == Hammer.DIRECTION_LEFT && pans[i].left != null)
                                pans[i].left(e);
                            else if ((e.direction & Hammer.DIRECTION_RIGHT) == Hammer.DIRECTION_RIGHT && pans[i].right != null)
                                pans[i].right(e);
                            else if ((e.direction & Hammer.DIRECTION_UP) == Hammer.DIRECTION_UP && pans[i].up != null)
                                pans[i].up(e);
                            else if ((e.direction & Hammer.DIRECTION_DOWN) == Hammer.DIRECTION_DOWN && pans[i].down != null)
                                pans[i].down(e);
                            if ((state & Hammer.STATE_ENDED) == Hammer.STATE_ENDED && pans[i].end != null)
                                pans[i].end(e);
                            exected = true;
                        }
                        if ((state & Hammer.STATE_ENDED) == Hammer.STATE_ENDED) {
                            pans[i]['started'] = null;
                        }
                        if (exected == true)
                            break;
                    }
                });
            }
            return hammer;
        };
        Gesture.prototype.getPans = function (element) {
            var pans = $(element).data('pans');
            if (pans == null) {
                pans = new Array();
                $(element).data('pans', pans);
            }
            return pans;
        };
        Gesture.prototype.clear = function () {
            this._prevent.pan = Hammer.DIRECTION_NONE;
        };
        Gesture.prototype.createPan = function (element) {
            if (element == null)
                throw chitu.Errors.argumentNull('element');
            var hammer = this.getHammer(element);
            var pan = new Pan(this);
            var pans = this.getPans(element);
            pans.push(pan);
            return pan;
        };
        return Gesture;
    })();
    chitu.Gesture = Gesture;
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
