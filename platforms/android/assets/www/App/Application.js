define(["require", "exports", 'Site', 'PageContainerFactory'], function (require, exports, site, PageContainerFactory) {
    chitu.Page.animationTime = site.config.pageAnimationTime;
    var config = {
        openSwipe: function (routeData) {
            if (site.env.isDegrade)
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
            return chitu.SwipeDirection.Right;
        },
        container: function (routeData, prevous) {
            var c = PageContainerFactory.createInstance(app, routeData, prevous);
            var action = routeData.values().action;
            var controller = routeData.values().controller;
            if ((controller == 'Home' && action == 'Index') || (controller == 'Home' && action == 'Class') ||
                (controller == 'Shopping' && action == 'ShoppingCart') || (controller == 'Home' && action == 'NewList') ||
                (controller == 'User' && action == 'Index')) {
                c.enableSwipeClose = false;
            }
            return c;
        }
    };
    var touch_move_time = 0;
    $(window).on('touchmove', function (e) {
        touch_move_time = Date.now();
    });
    var app = new chitu.Application(config);
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
