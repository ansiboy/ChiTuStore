define(["require", "exports", 'Site'], function (require, exports, site) {
    chitu.Page.animationTime = site.config.pageAnimationTime;
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
            $(this._page.node).find('.page-content').append(this._scrollLoad_loading_bar);
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
            this._status = value;
            if (this.is_render)
                $(this._scrollLoad_loading_bar).find('h5').html(this.contents[this._status]);
        };
        return PageBottomLoading;
    })();
    function resetBottomLoading(page) {
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
        openSwipe: function (routeData) {
            if (site.env.isDegrade || site.env.isApp)
                return chitu.SwipeDirection.None;
            if (site.isMenuPage(routeData))
                return chitu.SwipeDirection.None;
            var controller = routeData.values().controller;
            var action = routeData.values().action;
            if (controller == 'Home' && action == 'ProductDetail')
                return chitu.SwipeDirection.Up;
            return chitu.SwipeDirection.Left;
        },
        closeSwipe: function (routeData) {
            if (site.env.isDegrade)
                return chitu.SwipeDirection.None;
            if (site.isMenuPage(routeData))
                return chitu.SwipeDirection.None;
            var controller = routeData.values().controller;
            var action = routeData.values().action;
            if (controller == 'Home' && action == 'ProductDetail')
                return chitu.SwipeDirection.Down;
            if (site.env.isWeb && site.env.isIOS && Date.now() - touch_move_time < 500) {
                return chitu.SwipeDirection.None;
            }
            return chitu.SwipeDirection.Right;
        },
    };
    var touch_move_time = 0;
    $(window).on('touchmove', function (e) {
        touch_move_time = Date.now();
    });
    var app = new chitu.Application(config);
    app.pageCreated.add(function (sender, page) {
        var route_values = page.routeData.values();
        var controller = route_values.controller;
        var action = route_values.action;
        $(page.node).addClass(controller + '-' + action);
        if (page.conatiner instanceof chitu.WebPageContainer) {
            var c = page.conatiner;
            c.topBar.className = c.topBar.className + ' ' + controller + '-' + action;
            c.bottomBar.className = c.bottomBar.className + ' ' + controller + '-' + action;
        }
        var is_menu_page = (controller == 'Home' && (action == 'Index' || action == 'NewsList' || action == 'Class')) ||
            (controller == 'Shopping' && action == 'ShoppingCart') ||
            (controller == 'User' && action == 'Index');
        if (site.env.isIOS) {
            page.shown.add(function () {
                $(document).scrollTop(0);
                $(document).scrollLeft(0);
            });
        }
        var controller = page.routeData.values().controller;
        var action = page.routeData.values().action;
        if ((controller == 'Home' && action == 'Index') || (controller == 'Home' && action == 'ProductList')) {
            resetBottomLoading(page);
        }
        page.viewChanged.add(function () {
            var q = page.conatiner.nodes.content.querySelector('[ch-part="header"]');
            if (q)
                $(page.conatiner.nodes.header).append(q);
            q = page.conatiner.nodes.content.querySelector('[ch-part="footer"]');
            if (q)
                $(page.conatiner.nodes.footer).append(q);
        });
    });
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
    function enable_iscroll_gesture(page) {
    }
    return window['app'] = app;
});
