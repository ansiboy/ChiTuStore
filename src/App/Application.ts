import chitu = require('chitu');
import site = require('Site');
import PageContainerFactory = require('PageContainerFactory');

chitu.Page.animationTime = site.config.pageAnimationTime;

let urlParser = new chitu.UrlParser();
let pareeUrl = urlParser.pareeUrl;

urlParser.pathBase = '/store/App/Module/';
urlParser.pareeUrl = function (url: string) {
    var a = document.createElement('a');
    a.href = url;
    var routeData: chitu.RouteData = pareeUrl.apply(this, [url]);
    var route_values = a.hash.substr(1).split('_');
    var MIN_PARTS_COUNT = 2;
    switch (routeData.pageName) {
        case 'Home.ProductList':
            routeData.values.type = route_values[2];
            routeData.values.id = route_values[3];
            break;
        default:
            if (route_values.length > MIN_PARTS_COUNT) {
                routeData.values.id = route_values[2];
            }
            break;
    }
    return routeData;
}

var config: chitu.ApplicationConfig = {
    openSwipe: (routeData) => {
        if (site.env.isDegrade)
            return chitu.SwipeDirection.None;

        if (site.isMenuPage(routeData))
            return chitu.SwipeDirection.None;

        var controller = routeData.values.controller;
        var action = routeData.values.action;
        if (controller == 'Home' && action == 'ProductDetail')
            return chitu.SwipeDirection.Up;

        return chitu.SwipeDirection.Left;
    },
    closeSwipe: (routeData: chitu.RouteData) => {
        if (site.env.isDegrade)
            return chitu.SwipeDirection.None;

        if (site.isMenuPage(routeData))
            return chitu.SwipeDirection.None;

        var controller = routeData.values.controller;
        var action = routeData.values.action;
        if (controller == 'Home' && action == 'ProductDetail')
            return chitu.SwipeDirection.Down;

        //============================================
        // 如果 touchmove 时间与方法调用的时间在 500ms 以内，则认为是通过滑屏返回，
        // 通过滑屏返回，是不需要有返回效果的。
        // if (site.env.isWeb && site.env.isIOS && Date.now() - touch_move_time < 500) {
        //     return chitu.SwipeDirection.None;
        // }
        //============================================
        return chitu.SwipeDirection.Right;
    },
    container: function (routeData: chitu.RouteData, prevous: chitu.PageContainer): chitu.PageContainer {
        var c = PageContainerFactory.createInstance(app, routeData, prevous);

        var action = routeData.values.action;
        var controller = routeData.values.controller;
        if ((controller == 'Home' && action == 'Index') || (controller == 'Home' && action == 'Class') ||
            (controller == 'Shopping' && action == 'ShoppingCart') || (controller == 'Home' && action == 'NewList') ||
            (controller == 'User' && action == 'Index')) {
            //prevous = null;
            c.enableSwipeClose = false;
        }

        return c;
    },
    urlParser: urlParser
}

var touch_move_time: number = 0;
$(window).on('touchmove', function (e) {
    touch_move_time = Date.now();
});

var app = new chitu.Application(config);//site.env.isApp ? new SiteApplication(config) :


// var viewPath = '../App/Module/{controller}/{action}.html';
// var actionPath = '../App/Module/{controller}/{action}';

// var guidRule = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
// var actionRule = /^[a-z]+$/i;
// var controllerRule = /^[a-z]+$/i;

// app.routes().mapRoute({
//     name: 'Normal',
//     url: '{controller}_{action}',
//     rules: {
//         controller: controllerRule,
//         action: actionRule
//     },
//     viewPath: viewPath,
//     actionPath: actionPath
// });

// app.routes().mapRoute({
//     name: 'Shopping_Purchase',
//     url: '{controller}_{action}_{id}',
//     rules: {
//         controller: controllerRule,
//         action: actionRule,
//         id: guidRule
//     }
// });

// app.routes().mapRoute({
//     name: 'OrderList',
//     url: '{controller}_{action}_{status}',
//     rules: {
//         controller: ['Shopping'],
//         action: ['OrderList']
//     }
// });

// app.routes().mapRoute({
//     name: 'ProductList',
//     url: '{controller}_{action}_{type}_{name}',
//     rules: {
//         controller: controllerRule,
//         action: actionRule,
//         type: ['category', 'brand', 'search']
//     }
// });

// app.routes().mapRoute({
//     name: 'UserIndex',
//     url: '{controller}_{action}_{type}',
//     rules: {
//         controller: ['User'],
//         action: ['Index'],
//     }
// });

// app.routes().mapRoute({
//     name: 'UserInfo',
//     url: '{controller}_{action}_{code}',
//     rules: {
//         controller: ['User'],
//         action: ['UserInfo'],
//     }
// });

// app.routes().mapRoute({
//     name: 'UserInfoItemEdit',
//     url: '{controller}_{action}_{field}',
//     rules: {
//         controller: ['User'],
//         action: ['UserInfoItemEdit'],
//     }
// });


// app.routes().mapRoute({
//     name: 'AccountSecurity',
//     url: 'User_{controller}_{action}',
//     rules: {
//         controller: ['AccountSecurity']
//     },
//     viewPath: '../App/Module/User/{controller}/{action}.html',
//     actionPath: '../App/Module/User/{controller}/{action}'
// });

// app.routes().mapRoute({
//     name: 'AccountSecurity1',
//     url: 'User_{controller}_{action}_{type}',
//     rules: {
//         controller: ['AccountSecurity']
//     },
//     viewPath: '../App/Module/User/{controller}/{action}.html',
//     actionPath: '../App/Module/User/{controller}/{action}'
// });



export = window['app'] = app;


