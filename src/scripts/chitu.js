(function(factory) { 
        if (typeof define === 'function' && define['amd']) { 
            define(['jquery', 'hammer', 'move'], factory);  
        } else { 
            factory($, Hammer, move); 
        } 
    })(function($, Hammer,move) {var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var chitu;
(function (chitu) {
    var UrlParser = (function () {
        function UrlParser(pathBase) {
            this.path_string = '';
            this.path_spliter_char = '/';
            this.param_spliter = '?';
            this.name_spliter_char = '.';
            this._actionPath = '';
            this._viewPath = '';
            this._cssPath = '';
            this._parameters = {};
            this._pageName = '';
            this.pathBase = '';
            this.HASH_MINI_LENGTH = 2;
            if (pathBase == null)
                pathBase = 'modules/';
            this.pathBase = pathBase;
        }
        UrlParser.prototype.parseUrl = function (url) {
            if (!url)
                throw chitu.Errors.argumentNull('url');
            var a = document.createElement('a');
            a.href = url;
            if (!a.hash || a.hash.length < this.HASH_MINI_LENGTH)
                throw chitu.Errors.canntParseUrl(url);
            var path;
            var search;
            var param_spliter_index = a.hash.indexOf(this.param_spliter);
            if (param_spliter_index > 0) {
                search = a.hash.substr(param_spliter_index + 1);
                path = a.hash.substring(1, param_spliter_index);
            }
            else {
                path = a.hash.substr(1);
            }
            if (!path)
                throw chitu.Errors.canntParseUrl(url);
            if (search) {
                this._parameters = this.pareeUrlQuery(search);
            }
            var page_name = path.split(this.path_spliter_char).join(this.name_spliter_char);
            var result = {
                actionPath: this.pathBase + path,
                viewPath: this.pathBase + path + '.html',
                values: this._parameters,
                pageName: page_name,
            };
            return result;
        };
        UrlParser.prototype.pareeUrlQuery = function (query) {
            var match, pl = /\+/g, search = /([^&=]+)=?([^&]*)/g, decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };
            var urlParams = {};
            while (match = search.exec(query))
                urlParams[decode(match[1])] = decode(match[2]);
            return urlParams;
        };
        return UrlParser;
    }());
    var PAGE_STACK_MAX_SIZE = 10;
    var ACTION_LOCATION_FORMATER = '{controller}/{action}';
    var VIEW_LOCATION_FORMATER = '{controller}/{action}';
    var Application = (function () {
        function Application(config) {
            this.pageCreated = chitu.Callbacks();
            this._runned = false;
            this.container_stack = new Array();
            if (config == null)
                config = {};
            this._config = {};
            this._config.openSwipe = config.openSwipe || function (routeData) { return chitu.SwipeDirection.None; };
            this._config.closeSwipe = config.closeSwipe || function (routeData) { return chitu.SwipeDirection.None; };
            this._config.container = config.container || $.proxy(function (routeData, previous) {
                return chitu.PageContainerFactory.createInstance(this.app, routeData, previous);
            }, { app: this });
            var urlParser = new UrlParser(this._config.pathBase);
            this.parseUrl = function (url) {
                return urlParser.parseUrl(url);
            };
        }
        Application.prototype.on_pageCreated = function (page) {
            return chitu.fireCallback(this.pageCreated, this, page);
        };
        Object.defineProperty(Application.prototype, "config", {
            get: function () {
                return this._config;
            },
            enumerable: true,
            configurable: true
        });
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
            var url = location.href;
            var pageInfo = this.parseUrl(url);
            var page = this.getPage(pageInfo.pageName);
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
                this.showPage(url);
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
                throw chitu.Errors.argumentNull('url');
            var routeData = this.parseUrl(url);
            if (routeData == null) {
                throw chitu.Errors.noneRouteMatched(url);
            }
            routeData.values = $.extend(routeData.values, args || {});
            var container = this.createPageContainer(routeData);
            container.pageCreated.add(function (sender, page) { return _this.on_pageCreated(page); });
            var swipe = this.config.openSwipe(routeData);
            var result = container.showPage(routeData, swipe);
            return result;
        };
        Application.prototype.createPageNode = function () {
            var element = document.createElement('div');
            return element;
        };
        Application.prototype.redirect = function (url, args) {
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
    }());
    chitu.Application = Application;
})(chitu || (chitu = {}));
var chitu;
(function (chitu) {
    var OS;
    (function (OS) {
        OS[OS["ios"] = 0] = "ios";
        OS[OS["android"] = 1] = "android";
        OS[OS["other"] = 2] = "other";
    })(OS || (OS = {}));
    var scroll_types = {
        div: 'div',
        iscroll: 'iscroll',
        doc: 'doc'
    };
    var Environment = (function () {
        function Environment() {
        }
        Object.defineProperty(Environment, "osVersion", {
            get: function () {
                return this._version;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Environment, "os", {
            get: function () {
                return Environment._os;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Environment, "isIOS", {
            get: function () {
                return this.os == OS.ios;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Environment, "isAndroid", {
            get: function () {
                return this.os == OS.android;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Environment, "isWeiXin", {
            get: function () {
                var ua = navigator.userAgent.toLowerCase();
                return (ua.match(/MicroMessenger/i)) == 'micromessenger';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Environment, "isIPhone", {
            get: function () {
                return window.navigator.userAgent.indexOf('iPhone') > 0;
            },
            enumerable: true,
            configurable: true
        });
        Environment.init = (function () {
            var userAgent = navigator.userAgent;
            if (userAgent.indexOf('iPhone') > 0 || userAgent.indexOf('iPad') > 0) {
                Environment._os = OS.ios;
                var match = userAgent.match(/iPhone OS\s([0-9\-]*)/);
                if (match) {
                    var major_version = parseInt(match[1], 10);
                    Environment._version = major_version;
                }
            }
            else if (userAgent.indexOf('Android') > 0) {
                Environment._os = OS.android;
                var match = userAgent.match(/Android\s([0-9\.]*)/);
                if (match) {
                    var major_version = parseInt(match[1], 10);
                    Environment._version = major_version;
                }
            }
            else {
                Environment._os = OS.other;
            }
        })();
        return Environment;
    }());
    var ControlFactory = (function () {
        function ControlFactory() {
        }
        ControlFactory.createControls = function (element, page) {
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
        return ControlFactory;
    }());
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
    }());
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
        Control.prototype.on_load = function (args) {
            var promises = new Array();
            promises.push(chitu.fireCallback(this.load, this, args));
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
    }());
    chitu.Control = Control;
    var PageHeader = (function (_super) {
        __extends(PageHeader, _super);
        function PageHeader(element, page) {
            _super.call(this, element, page);
        }
        return PageHeader;
    }(Control));
    chitu.PageHeader = PageHeader;
    var PageFooter = (function (_super) {
        __extends(PageFooter, _super);
        function PageFooter(element, page) {
            _super.call(this, element, page);
        }
        return PageFooter;
    }(Control));
    chitu.PageFooter = PageFooter;
    var ScrollView = (function (_super) {
        __extends(ScrollView, _super);
        function ScrollView(element, page) {
            _super.call(this, element, page);
            this.scroll = chitu.Callbacks();
            this.scrollEnd = chitu.Callbacks();
        }
        ScrollView.prototype.on_load = function (args) {
            var result;
            if (result != null) {
                result = $.when(result, _super.prototype.on_load.call(this, args));
            }
            else {
                result = _super.prototype.on_load.call(this, args);
            }
            return result;
        };
        ScrollView.prototype.on_scrollEnd = function (args) {
            return chitu.fireCallback(this.scrollEnd, this, args);
        };
        ScrollView.prototype.on_scroll = function (args) {
            return chitu.fireCallback(this.scroll, this, args);
        };
        ScrollView.createInstance = function (element, page) {
            if (Environment.isAndroid && Environment.isWeiXin)
                return new DocumentScrollView(element, page);
            if (Environment.isIOS || (Environment.isAndroid && Environment.osVersion >= 5))
                return new DivScrollView(element, page);
            return new DocumentScrollView(element, page);
        };
        return ScrollView;
    }(Control));
    chitu.ScrollView = ScrollView;
    var DocumentScrollView = (function (_super) {
        __extends(DocumentScrollView, _super);
        function DocumentScrollView(element, page) {
            var _this = this;
            _super.call(this, element, page);
            this.cur_scroll_args = {};
            this.CHECK_INTERVAL = 300;
            $(element).attr('scroll-type', scroll_types.doc);
            $(document).scroll(function (event) {
                _this.cur_scroll_args.clientHeight = $(window).height();
                _this.cur_scroll_args.scrollHeight = document.body.scrollHeight;
                _this.cur_scroll_args.scrollTop = $(document).scrollTop();
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
    }(ScrollView));
    var DivScrollView = (function (_super) {
        __extends(DivScrollView, _super);
        function DivScrollView(element, page) {
            $(element).attr('scroll-type', scroll_types.div);
            var scroller_node;
            if (element.firstElementChild != null && element.firstElementChild.tagName == DivScrollView.SCROLLER_TAG_NAME) {
                scroller_node = element.firstElementChild;
            }
            else {
                scroller_node = document.createElement(DivScrollView.SCROLLER_TAG_NAME);
                scroller_node.innerHTML = element.innerHTML;
                element.innerHTML = '';
                element.appendChild(scroller_node);
            }
            _super.call(this, element, page);
            this.cur_scroll_args = {};
            this.scroller_node = scroller_node;
            this.scroller_node.onscroll = $.proxy(this.on_elementScroll, this);
            new GesturePull(this, $.proxy(this.on_scroll, this));
        }
        DivScrollView.prototype.on_elementScroll = function () {
            var scroller_node = this.scroller_node;
            this.cur_scroll_args.scrollTop = 0 - scroller_node.scrollTop;
            this.cur_scroll_args.clientHeight = scroller_node.clientHeight;
            this.cur_scroll_args.scrollHeight = scroller_node.scrollHeight;
            var scroll_args = {
                clientHeight: this.cur_scroll_args.clientHeight,
                scrollHeight: this.cur_scroll_args.scrollHeight,
                scrollTop: 0 - this.cur_scroll_args.scrollTop
            };
            this.on_scroll(scroll_args);
            this.scrollEndCheck();
        };
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
            }, DivScrollView.CHECK_INTERVAL);
        };
        Object.defineProperty(DivScrollView.prototype, "disabled", {
            get: function () {
                var s = document.defaultView.getComputedStyle(this.scroller_node);
                return s.overflowY != 'scroll';
            },
            set: function (value) {
                if (value == true)
                    this.scroller_node.style.overflowY = 'hidden';
                else
                    this.scroller_node.style.overflowY = 'scroll';
            },
            enumerable: true,
            configurable: true
        });
        DivScrollView.CHECK_INTERVAL = 30;
        DivScrollView.SCROLLER_TAG_NAME = 'SCROLLER';
        return DivScrollView;
    }(ScrollView));
    var GesturePull = (function () {
        function GesturePull(scrollView, on_scroll) {
            this.is_vertical = false;
            this.moved = false;
            if (scrollView == null)
                throw chitu.Errors.argumentNull('scrollView');
            if (on_scroll == null)
                throw chitu.Errors.argumentNull('on_scroll');
            this.scrollView = scrollView;
            this.on_scroll = on_scroll;
            this.containerElement = this.scrollView.element;
            this.scrollerElement = $(this.scrollView.element).find('scroller')[0];
            if (this.scrollerElement == null)
                throw chitu.Errors.scrollerElementNotExists();
            this.hammer = new Hammer.Manager(this.containerElement);
            this.hammer.add(new Hammer.Pan({ direction: Hammer.DIRECTION_VERTICAL }));
            this.hammer.on('pandown', $.proxy(this.on_pandown, this));
            this.hammer.on('panup', $.proxy(this.on_panup, this));
            this.hammer.on('panstart', $.proxy(this.on_panstart, this));
            this.hammer.on('panend', $.proxy(this.on_panend, this));
        }
        GesturePull.prototype.on_panstart = function (e) {
            this.pre_y = e.deltaY;
            this.elementScrollTop = this.scrollerElement.scrollTop;
            var d = Math.atan(Math.abs(e.deltaY / e.deltaX)) / 3.14159265 * 180;
            this.is_vertical = d >= 70;
            var enablePullDown = this.scrollerElement.scrollTop == 0 && this.is_vertical;
            var enablePullUp = (this.scrollerElement.scrollHeight - this.scrollerElement.scrollTop <= this.scrollerElement.clientHeight) && this.is_vertical;
            if (enablePullDown && e.deltaY > 0) {
                this.pullType = 'down';
            }
            else if (enablePullUp && e.deltaY < 0) {
                this.pullType = 'up';
            }
            else {
                this.pullType = 'none';
            }
        };
        GesturePull.prototype.on_pandown = function (e) {
            if (e.deltaY >= 0 && this.pullType == 'up') {
                move(this.containerElement).y(0).duration(0).end();
            }
            else if (e.deltaY >= 0 && this.pullType == 'down') {
                this.move(e);
            }
            else if (e.deltaY < 0 && this.pullType == 'up') {
                this.move(e);
            }
        };
        GesturePull.prototype.on_panup = function (e) {
            if (e.deltaY <= 0 && this.pullType == 'down') {
                move(this.containerElement).y(0).duration(0).end();
            }
            else if (e.deltaY <= 0 && this.pullType == 'up') {
                this.move(e);
            }
            else if (e.deltaY > 0 && this.pullType == 'down') {
                this.move(e);
            }
        };
        GesturePull.prototype.on_panend = function (e) {
            if (this.moved) {
                $(this.scrollerElement).scrollTop(this.elementScrollTop);
                move(this.containerElement).y(0).end();
                this.moved = false;
            }
            this.enableNativeScroll();
        };
        GesturePull.prototype.move = function (e) {
            this.disableNativeScroll();
            var destY = e.deltaY / 2;
            move(this.containerElement).y(destY).duration(0).end();
            this.moved = true;
            var args = {
                scrollHeight: this.scrollerElement.scrollHeight,
                clientHeight: this.scrollerElement.clientHeight,
                scrollTop: destY - this.scrollerElement.scrollTop
            };
            this.on_scroll(args);
        };
        GesturePull.prototype.disableNativeScroll = function () {
            this.scrollerElement.style.overflowY = 'hidden';
        };
        GesturePull.prototype.enableNativeScroll = function () {
            this.scrollerElement.style.overflowY = 'scroll';
        };
        return GesturePull;
    }());
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
    }(Control));
    chitu.ScrollViewStatusBar = ScrollViewStatusBar;
    var IScrollView = (function (_super) {
        __extends(IScrollView, _super);
        function IScrollView(element, page) {
            var _this = this;
            $(element).attr('scroll-type', scroll_types.iscroll);
            if (element.firstElementChild == null || element.firstElementChild.tagName != IScrollView.SCROLLER_TAG_NAME) {
                var scroller_node = document.createElement(IScrollView.SCROLLER_TAG_NAME);
                scroller_node.innerHTML = element.innerHTML;
                element.innerHTML = '';
                element.appendChild(scroller_node);
            }
            _super.call(this, element, page);
            requirejs(['iscroll'], function () { return _this.init(_this.element); });
        }
        IScrollView.prototype.init = function (element) {
            var options = {
                tap: true,
                useTransition: false,
                HWCompositing: false,
                preventDefault: true,
                probeType: 2,
            };
            var iscroller = this.iscroller = new IScroll(element, options);
            iscroller['page_container'] = this;
            iscroller.on('scrollEnd', function () {
                var scroller = this;
                var args = {
                    scrollTop: scroller.y,
                    scrollHeight: scroller.scrollerHeight,
                    clientHeight: scroller.wrapperHeight
                };
                control.on_scrollEnd(args);
            });
            iscroller.hasVerticalScroll = true;
            var control = this;
            iscroller.on('scroll', function () {
                var scroller = this;
                var args = {
                    scrollTop: scroller.y,
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
        Object.defineProperty(IScrollView.prototype, "disabled", {
            get: function () {
                return !this.iscroller.enabled;
            },
            set: function (value) {
                if (value)
                    this.iscroller.disable();
                else
                    this.iscroller.enable();
            },
            enumerable: true,
            configurable: true
        });
        IScrollView.SCROLLER_TAG_NAME = 'SCROLLER';
        return IScrollView;
    }(ScrollView));
    chitu.IScrollView = IScrollView;
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
        Errors.createPageFail = function (pageName) {
            var msg = chitu.Utility.format('Create page "{0}" fail.', pageName);
            return new Error(msg);
        };
        Errors.actionTypeError = function (pageName) {
            var msg = chitu.Utility.format('Export of \'{0}\' page is expect chitu.Page type.', pageName);
            return new Error(msg);
        };
        Errors.scrollerElementNotExists = function () {
            var msg = "Scroller element is not exists.";
            return new Error(msg);
        };
        return Errors;
    }());
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
    }());
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
    function fireCallback(callback, sender, args) {
        var context = sender;
        var results = callback.fireWith(context, [sender, args]);
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
})(chitu || (chitu = {}));
var chitu;
(function (chitu) {
    var ns = chitu;
    var u = chitu.Utility;
    var e = chitu.Errors;
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
        function Page(args) {
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
            this.closing = ns.Callbacks();
            this.closed = ns.Callbacks();
            this.showing = ns.Callbacks();
            this.shown = ns.Callbacks();
            this.hiding = ns.Callbacks();
            this.hidden = ns.Callbacks();
            if (args == null)
                throw chitu.Errors.argumentNull('args');
            if (args.view == null)
                throw chitu.Errors.argumentNull('view');
            this._node = document.createElement('page');
            this._node.innerHTML = args.view;
            this._controls = this.createControls(this.element);
            $(this._node).data('page', this);
            this.initialize(args.container, args.routeData);
        }
        Page.prototype.initialize = function (container, pageInfo) {
            if (!container)
                throw e.argumentNull('container');
            if (pageInfo == null)
                throw e.argumentNull('pageInfo');
            this._pageContainer = container;
            this._routeData = pageInfo;
        };
        Page.prototype.createControls = function (element) {
            this._controls = chitu.ControlFactory.createControls(element, this);
            var stack = new Array();
            for (var i = 0; i < this._controls.length; i++) {
                stack.push(this._controls[i]);
            }
            return this._controls;
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
                    this._name = this.routeData.pageName;
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
            return chitu.fireCallback(callback, this, args);
        };
        Page.prototype.on_load = function (args) {
            var promises = new Array();
            promises.push(this.fireEvent(this.load, args));
            for (var i = 0; i < this._controls.length; i++) {
                var p = this._controls[i].on_load(args);
                promises.push(p);
            }
            var result = $.when.apply($, promises);
            return result;
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
        Page.animationTime = 300;
        return Page;
    }());
    chitu.Page = Page;
})(chitu || (chitu = {}));
;
var chitu;
(function (chitu) {
    var ScrollArguments = (function () {
        function ScrollArguments() {
        }
        return ScrollArguments;
    }());
    var PageContainerTypeClassNames = (function () {
        function PageContainerTypeClassNames() {
            this.Div = 'div';
            this.IScroll = 'iscroll';
            this.Document = 'doc';
        }
        return PageContainerTypeClassNames;
    }());
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
            this.gesture = new Gesture(this._node);
            this._enableSwipeBack();
        }
        PageContainer.prototype.on_pageCreated = function (page) {
            return chitu.fireCallback(this.pageCreated, this, page);
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
            var horizontal_swipe_angle = 35;
            var scroll_views;
            var pan = container.gesture.createPan();
            pan.start = function (e) {
                node.style.webkitTransform = '';
                node.style.transform = '';
                var martix = new WebKitCSSMatrix(container.previous.element.style.webkitTransform);
                previous_start_x = martix.m41;
                var d = Math.atan(Math.abs(e.deltaY / e.deltaX)) / 3.14159265 * 180;
                if (d > horizontal_swipe_angle)
                    return false;
                var result = (container.previous != null && (e.direction & Hammer.DIRECTION_RIGHT) != 0) &&
                    (_this.open_swipe == chitu.SwipeDirection.Left || _this.open_swipe == chitu.SwipeDirection.Right);
                if (result == true) {
                    previous_visible = _this.previous.visible;
                    _this.previous.visible = true;
                }
                scroll_views = currentPageScrollViews();
                return result;
            };
            pan.left = function (e) {
                discableScrollViews(scroll_views);
                if (e.deltaX <= 0) {
                    move(node).x(0).duration(0).end();
                    move(_this.previous.element).x(previous_start_x).duration(0).end();
                    return;
                }
                move(node).x(e.deltaX).duration(0).end();
                move(_this.previous.element).x(previous_start_x + e.deltaX * _this._previousOffsetRate).duration(0).end();
            };
            pan.right = function (e) {
                discableScrollViews(scroll_views);
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
            var currentPageScrollViews = function () {
                var result = [];
                $(_this.currentPage.element).find('scroll-view').each(function (index, item) {
                    var scroll_view = $(item).data('control');
                    result.push(scroll_view);
                });
                return result;
            };
            var discableScrollViews = function (views) {
                for (var i = 0; i < views.length; i++) {
                    views[i].disabled = true;
                }
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
            if (container_width <= 0 || container_height <= 0)
                swipe = chitu.SwipeDirection.None;
            var interval = 30;
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
                    }, interval);
                    break;
                case chitu.SwipeDirection.Up:
                    move(this.element).y(container_height).duration(0).end();
                    $(this._node).show();
                    window.setTimeout(function () {
                        move(_this.element).y(0).duration(_this.animationTime).end(on_end);
                    }, interval);
                    break;
                case chitu.SwipeDirection.Right:
                    move(this.element).x(0 - container_width).duration(0).end();
                    $(this._node).show();
                    window.setTimeout(function () {
                        if (_this.previous != null)
                            move(_this.previous.element).x(container_width * _this._previousOffsetRate).duration(_this.animationTime).end();
                        move(_this.element).x(0).duration(_this.animationTime).end(on_end);
                    }, interval);
                    break;
                case chitu.SwipeDirection.Left:
                    move(this.element).x(container_width).duration(0).end();
                    $(this._node).show();
                    window.setTimeout(function () {
                        if (_this.previous != null)
                            move(_this.previous.element).x(0 - container_width * _this._previousOffsetRate).duration(_this.animationTime).end();
                        move(_this.element).x(0).duration(_this.animationTime).end(on_end);
                    }, interval);
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
            if (swipe == null)
                swipe = chitu.SwipeDirection.None;
            if (this.is_closing)
                return;
            this.pages.forEach(function (item, index, Array) {
                item.on_closing(item.routeData.values);
            });
            this.is_closing = true;
            this.hide(swipe).done(function () {
                $(_this._node).remove();
                _this.pages.forEach(function (item, index, Array) {
                    item.on_closed(item.routeData.values);
                });
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
        PageContainer.prototype.createActionDeferred = function (routeData) {
            var url = routeData.actionPath;
            var result = $.Deferred();
            requirejs([url], function (Type) {
                if (!Type) {
                    console.warn(chitu.Utility.format('加载活动“{0}”失败。', routeData.pageName));
                    result.reject();
                    return;
                }
                if (!$.isFunction(Type) || Type.prototype == null)
                    throw chitu.Errors.actionTypeError(routeData.pageName);
                result.resolve(Type);
            }, function (err) { return result.reject(err); });
            return result;
        };
        PageContainer.prototype.createViewDeferred = function (url) {
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
                }, function (err) {
                    result.reject(err);
                });
            }
            return result;
        };
        PageContainer.prototype.createPage = function (routeData) {
            var _this = this;
            var view_deferred;
            if (routeData.viewPath)
                view_deferred = this.createViewDeferred(routeData.viewPath);
            else
                view_deferred = $.Deferred().resolve("");
            var action_deferred = this.createActionDeferred(routeData);
            var result = $.Deferred();
            $.when(action_deferred, view_deferred).done(function (pageType, html) {
                var page = new pageType({ view: html, container: _this, routeData: routeData });
                if (!(page instanceof chitu.Page))
                    throw chitu.Errors.actionTypeError(routeData.pageName);
                _this.on_pageCreated(page);
                _this._pages.push(page);
                _this._pages[page.name] = page;
                result.resolve(page);
                page.on_load(routeData.values).done(function () {
                    _this.hideLoading();
                });
            }).fail(function (err) {
                result.reject();
                console.log(err);
                throw chitu.Errors.createPageFail(routeData.pageName);
            });
            if (routeData.resource != null && routeData.resource.length > 0) {
                chitu.Utility.loadjs.apply(chitu.Utility, routeData.resource);
            }
            return result;
        };
        PageContainer.prototype.showPage = function (routeData, swipe) {
            var _this = this;
            return this.createPage(routeData)
                .done(function (page) {
                _this.element.appendChild(page.element);
                _this._currentPage = page;
                page.on_showing(page.routeData.values);
                _this.show(swipe).done(function () {
                    page.on_shown(page.routeData.values);
                });
            });
        };
        return PageContainer;
    }());
    chitu.PageContainer = PageContainer;
    var PageContainerFactory = (function () {
        function PageContainerFactory(app) {
            this._app = app;
        }
        PageContainerFactory.createInstance = function (app, routeData, previous) {
            return new PageContainer(app, previous);
        };
        return PageContainerFactory;
    }());
    chitu.PageContainerFactory = PageContainerFactory;
    var Pan = (function () {
        function Pan(gesture) {
            this.cancel = false;
        }
        return Pan;
    }());
    chitu.Pan = Pan;
    var Gesture = (function () {
        function Gesture(element) {
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
            this.hammer = new Hammer.Manager(element);
        }
        Gesture.prototype.on_pan = function (e) {
            var pans = this.pans;
            for (var i = pans.length - 1; i >= 0; i--) {
                var state = this.hammer.get('pan').state;
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
        };
        Object.defineProperty(Gesture.prototype, "pans", {
            get: function () {
                if (this._pans == null) {
                    this._pans = new Array();
                    this.hammer.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL }));
                    this.hammer.on('pan', $.proxy(this.on_pan, this));
                }
                return this._pans;
            },
            enumerable: true,
            configurable: true
        });
        Gesture.prototype.createPan = function () {
            var pan = new Pan(this);
            this.pans.push(pan);
            return pan;
        };
        return Gesture;
    }());
    chitu.Gesture = Gesture;
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
        Utility.format = function (source) {
            var params = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                params[_i - 1] = arguments[_i];
            }
            for (var i = 0; i < params.length; i++) {
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
        Utility.loadjs = function () {
            var modules = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                modules[_i - 0] = arguments[_i];
            }
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
    }());
    chitu.Utility = Utility;
})(chitu || (chitu = {}));

window['chitu'] = window['chitu'] || chitu 
                    
 return chitu;
    });