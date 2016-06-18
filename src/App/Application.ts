import chitu = require('chitu');
import site = require('Site');
import PageContainerFactory = require('PageContainerFactory');

chitu.Page.animationTime = site.config.pageAnimationTime;




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
}

var touch_move_time: number = 0;
$(window).on('touchmove', function (e) {
    touch_move_time = Date.now();
});

var app = new chitu.Application(config);
//==========================================================
// 说明：重写路由解释
let pathBase = 'mod/';
let path_spliter_char = '_';
app.parseUrl = (url: string): chitu.RouteData => {
    if (!url) throw chitu.Errors.argumentNull('url');

    let a = document.createElement('a');
    a.href = url;

    // if (a.search && a.search.length > 1) {
    //     this._parameters = this.pareeUrlQuery(a.search.substr(1));
    // }
    // if (a.hash && a.hash.length > 1) {
    //     this._pageName = a.hash.substr(1);
    // }

    let path_parts = a.hash.substr(1).split(path_spliter_char);
    if (path_parts.length < 2)
        throw chitu.Errors.canntParseUrl(url);

    let controller = path_parts[0];
    let action = path_parts[1];

    let _parameters: any = {};
    _parameters.controller = controller;
    _parameters.action = action;
    if (path_parts.length > 2)
        _parameters.id = path_parts[2];

    let path = controller + '/' + action;
    let page_name = controller + '.' + action;
    var routeData: chitu.RouteData = {
        actionPath: pathBase + path,
        viewPath: pathBase + path + '.html',
        values: _parameters,
        pageName: page_name,
    }

    var route_values = a.hash.substr(1).split('_');
    var MIN_PARTS_COUNT = 2;

    switch (routeData.pageName) {
        case 'Home.ProductList':
            routeData.values.type = route_values[2];
            routeData.values.id = route_values[3];
            break;
        case 'User.UserInfoItemEdit':
            routeData.values.field = route_values[2];
            break;
        default:
            if (route_values[0] == 'AccountSecurity') {
                routeData.values.type = route_values[2];
            } else if (route_values.length > MIN_PARTS_COUNT) {
                routeData.values.id = route_values[2];
            }
            break;
    }

    var css_path = chitu.Utility.format('css!content/{0}/{1}', route_values[0], route_values[1]);
    routeData.resource = [css_path];

    return routeData;
}
//==========================================================

export = window['app'] = app;


