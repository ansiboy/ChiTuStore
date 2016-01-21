var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Site'], function (require, exports, site) {
    chitu.Page.animationTime = site.config.pageAnimationTime;
    var SiteApplication = (function (_super) {
        __extends(SiteApplication, _super);
        function SiteApplication() {
            _super.apply(this, arguments);
        }
        SiteApplication.prototype.run = function () {
            $(window).bind('hashchange', $.proxy(this.hashchange, this));
            var hash = window.location.hash;
            if (!hash) {
                return;
            }
            var args = window.location['arguments'] || {};
            window.location['arguments'] = null;
            this.showPage(hash.substr(1), args);
        };
        SiteApplication.prototype.hashchange = function () {
            var plus = window['plus'];
            var hash = window.location.hash;
            if (!hash) {
                return;
            }
            var currentWebView = plus.webview.currentWebview();
            console.log('hashchange:' + hash);
            console.log('currentWebviewID:' + currentWebView.id);
            var webview_id = hash.substr(1);
            plus.webview.open('Page.html' + hash, webview_id, {
                popGesture: 'close'
            }, 'slide-in-right');
            location.hash = '';
        };
        SiteApplication.prototype.back = function (args) {
            if (args === void 0) { args = undefined; }
            var plus = window['plus'];
            plus.webview.currentWebview().close();
            return $.Deferred().resolve();
        };
        return SiteApplication;
    })(chitu.Application);
    var PageBottomLoading = (function () {
        function PageBottomLoading(page) {
            this.LOADDING_HTML = '<i class="icon-spinner icon-spin"></i><span style="padding-left:10px;">数据正在加载中...</span>';
            this.LOADCOMPLETE_HTML = '<span style="padding-left:10px;">数据已全部加载完</span>';
            this._status = 'loading';
            this.is_render = false;
            this.contents = {
                loading: '<i class="icon-spinner icon-spin"></i><span style="padding-left:10px;">数据正在加载中...</span>',
                complete: '<span style="padding-left:10px;">数据已全部加载完</span>'
            };
            if (!page)
                throw chitu.Errors.argumentNull('page');
            this._page = page;
        }
        PageBottomLoading.prototype.render = function () {
            if (this.is_render)
                return;
            this._scrollLoad_loading_bar = document.createElement('div');
            this._scrollLoad_loading_bar.innerHTML = '<div style="padding:10px 0px 10px 0px;"><h5 class="text-center"></h5></div>';
            this._scrollLoad_loading_bar.style.display = 'block';
            $(this._scrollLoad_loading_bar).find('h5').html(this.contents[this._status]);
            this._page.nodes().content.appendChild(this._scrollLoad_loading_bar);
            this._page.refreshUI();
            this.is_render = true;
        };
        PageBottomLoading.prototype.show = function () {
            this.status('loading');
        };
        PageBottomLoading.prototype.hide = function () {
        };
        PageBottomLoading.prototype.status = function (value) {
            if (this._status == value)
                return;
            debugger;
            this._status = value;
            if (this.is_render)
                $(this._scrollLoad_loading_bar).find('h5').html(this.contents[this._status]);
        };
        return PageBottomLoading;
    })();
    function resetBottomLoading(page) {
        if (page.routeData.values().action == 'ShoppingCart')
            return;
        var bottomLoading = page.bottomLoading = new PageBottomLoading(page);
        var enableScrollLoad_value_assinged = $.Deferred();
        var viewChanged = $.Deferred();
        page.viewChanged.add(function () { return viewChanged.resolve(); });
        page.load.add(function (sender, args) {
            if (sender.bottomLoading instanceof PageBottomLoading)
                sender.bottomLoading.status('loading');
            var enableScrollLoad = args.enableScrollLoad;
            var descriptor = Object.getOwnPropertyDescriptor(chitu.PageLoadArguments.prototype, 'enableScrollLoad');
            Object.defineProperty(args, "enableScrollLoad", {
                set: function (value) {
                    if (value == false) {
                        sender.bottomLoading.status('complete');
                    }
                    else {
                        sender.bottomLoading.status('loading');
                    }
                    enableScrollLoad_value_assinged.resolve();
                    descriptor.set.apply(this, [value]);
                },
                get: function () {
                    return descriptor.get.apply(this);
                },
                configurable: descriptor.configurable,
                enumerable: descriptor.enumerable
            });
        });
        $.when(viewChanged, enableScrollLoad_value_assinged).done(function () { return bottomLoading.render(); });
    }
    var config = {
        container: function () { return document.getElementById('main'); },
        scrollType: function (routeData) {
            if (site.env.isDegrade || (site.env.isApp && site.env.isAndroid))
                return chitu.ScrollType.Document;
            if (site.env.isIOS) {
                return chitu.ScrollType.IScroll;
            }
            if (site.env.isAndroid)
                return chitu.ScrollType.Div;
            return chitu.ScrollType.Div;
        },
        openSwipe: function (routeData) {
            if (site.env.isDegrade)
                return chitu.SwipeDirection.None;
            var controller = routeData.values().controller;
            var action = routeData.values().action;
            var name = controller + '.' + action;
            if (name == 'Home.Index' || name == 'Home.Class' || name == 'Shopping.ShoppingCart' ||
                name == 'Home.NewsList' || name == 'User.Index')
                return chitu.SwipeDirection.None;
            if (name == 'Home.ProductDetail')
                return chitu.SwipeDirection.Up;
            return chitu.SwipeDirection.Left;
        },
        closeSwipe: function (routeData) {
            if (site.env.isDegrade)
                return chitu.SwipeDirection.None;
            var controller = routeData.values().controller;
            var action = routeData.values().action;
            var name = controller + '.' + action;
            if (name == 'Home.Index' || name == 'Home.Class' || name == 'Shopping.ShoppingCart' ||
                name == 'Home.NewsList' || name == 'User.Index')
                return chitu.SwipeDirection.None;
            if (name == 'Home.ProductDetail')
                return chitu.SwipeDirection.Donw;
            return chitu.SwipeDirection.Right;
        }
    };
    var app = site.env.isApp ? new SiteApplication(config) : new chitu.Application(config);
    app.pageCreated.add(function (sender, page) {
        var route_values = page.routeData.values();
        var controller = route_values.controller;
        var action = route_values.action;
        $(page.nodes().container).addClass(controller + '-' + action);
        var is_menu_page = (controller == 'Home' && (action == 'Index' || action == 'NewsList' || action == 'Class')) ||
            (controller == 'Shopping' && action == 'ShoppingCart') ||
            (controller == 'User' && action == 'Index');
        if (!is_menu_page) {
            if ($.event.special.swipe) {
                $(page.node())
                    .on('swiperight', function () {
                    app.back();
                })
                    .on('movestart', function (e) {
                    if (Math.abs(e.distX) < Math.abs(e.distY)) {
                        e.preventDefault();
                    }
                });
            }
        }
        if (site.env.isIOS) {
            page.shown.add(function () {
                $(document).scrollTop(0);
                $(document).scrollLeft(0);
            });
        }
        resetBottomLoading(page);
    });
    if (!site.env.isDegrade && site.env.isAndroid && !site.env.isApp) {
        requirejs(['hammer'], function (hammer) {
            console.log('hammer load');
            window['Hammer'] = window['Hammer'] || hammer;
            app.pageCreated.add(function (sender, page) {
                var previous_page = page.previous;
                if (previous_page == null)
                    return;
                var node = page.nodes().container;
                var hammer = new Hammer(page.nodes().content);
                hammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL | Hammer.DIRECTION_VERTICAL });
                hammer.on('panleft', function (e) {
                    if (e.deltaX <= 0) {
                        node.style.webkitTransform = 'translateX(' + 0 + 'px)';
                        return;
                    }
                    console.log('e.deltaX:' + e.deltaX);
                    node.style.webkitTransform = 'translateX(' + e.deltaX + 'px)';
                    console.log('panleft');
                    console.log(arguments);
                });
                hammer.on('panright', function (e) {
                    node.style.webkitTransform = 'translateX(' + e.deltaX + 'px)';
                    console.log('panright');
                    console.log('velocityX:' + e.velocityX);
                });
                hammer.on('panstart', function () {
                    previous_page.nodes().container.style.display = 'block';
                });
                hammer.on('panend', function (e) {
                    if (e.deltaX > 100) {
                        app.back();
                        return;
                    }
                    previous_page.nodes().container.style.display = 'none';
                    node.style.webkitTransform = 'translateX(' + 0 + 'px)';
                    node.style.webkitTransitionDuration = '500';
                });
            });
        });
    }
    var viewPath = '../App/Module/{controller}/{action}.html';
    var actionPath = '../App/Module/{controller}/{action}';
    var guidRule = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    var actionRule = /^[a-z]+$/i;
    var controllerRule = /^[a-z]+$/i;
    app.routes().mapRoute({
        name: 'Normal',
        url: '{controller}_{action}',
        rules: {
            controller: controllerRule,
            action: actionRule
        },
        viewPath: viewPath,
        actionPath: actionPath
    });
    app.routes().mapRoute({
        name: 'Shopping_Purchase',
        url: '{controller}_{action}_{id}',
        rules: {
            controller: controllerRule,
            action: actionRule,
            id: guidRule
        }
    });
    app.routes().mapRoute({
        name: 'OrderList',
        url: '{controller}_{action}_{status}',
        rules: {
            controller: ['Shopping'],
            action: ['OrderList']
        }
    });
    app.routes().mapRoute({
        name: 'ProductList',
        url: '{controller}_{action}_{type}_{name}',
        rules: {
            controller: controllerRule,
            action: actionRule,
            type: ['category', 'brand', 'search']
        }
    });
    app.routes().mapRoute({
        name: 'UserIndex',
        url: '{controller}_{action}_{type}',
        rules: {
            controller: ['User'],
            action: ['Index'],
        }
    });
    app.routes().mapRoute({
        name: 'UserInfo',
        url: '{controller}_{action}_{code}',
        rules: {
            controller: ['User'],
            action: ['UserInfo'],
        }
    });
    app.routes().mapRoute({
        name: 'UserInfoItemEdit',
        url: '{controller}_{action}_{field}',
        rules: {
            controller: ['User'],
            action: ['UserInfoItemEdit'],
        }
    });
    app.routes().mapRoute({
        name: 'AccountSecurity',
        url: 'User_{controller}_{action}',
        rules: {
            controller: ['AccountSecurity']
        },
        viewPath: '../App/Module/User/{controller}/{action}.html',
        actionPath: '../App/Module/User/{controller}/{action}'
    });
    app.routes().mapRoute({
        name: 'AccountSecurity1',
        url: 'User_{controller}_{action}_{type}',
        rules: {
            controller: ['AccountSecurity']
        },
        viewPath: '../App/Module/User/{controller}/{action}.html',
        actionPath: '../App/Module/User/{controller}/{action}'
    });
    return window['app'] = app;
});
