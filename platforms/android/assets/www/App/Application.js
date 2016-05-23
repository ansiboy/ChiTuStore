define(["require", "exports", 'chitu', 'Site', 'PageContainerFactory'], function (require, exports, chitu, site, PageContainerFactory) {
    chitu.Page.animationTime = site.config.pageAnimationTime;
    var urlParser = new chitu.UrlParser();
    var pareeUrl = urlParser.pareeUrl;
    urlParser.pathBase = '/store/App/Module/';
    urlParser.pareeUrl = function (url) {
        var a = document.createElement('a');
        a.href = url;
        var routeData = pareeUrl.apply(this, [url]);
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
    };
    var config = {
        openSwipe: function (routeData) {
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
        closeSwipe: function (routeData) {
            if (site.env.isDegrade)
                return chitu.SwipeDirection.None;
            if (site.isMenuPage(routeData))
                return chitu.SwipeDirection.None;
            var controller = routeData.values.controller;
            var action = routeData.values.action;
            if (controller == 'Home' && action == 'ProductDetail')
                return chitu.SwipeDirection.Down;
            return chitu.SwipeDirection.Right;
        },
        container: function (routeData, prevous) {
            var c = PageContainerFactory.createInstance(app, routeData, prevous);
            var action = routeData.values.action;
            var controller = routeData.values.controller;
            if ((controller == 'Home' && action == 'Index') || (controller == 'Home' && action == 'Class') ||
                (controller == 'Shopping' && action == 'ShoppingCart') || (controller == 'Home' && action == 'NewList') ||
                (controller == 'User' && action == 'Index')) {
                c.enableSwipeClose = false;
            }
            return c;
        },
        urlParser: urlParser
    };
    var touch_move_time = 0;
    $(window).on('touchmove', function (e) {
        touch_move_time = Date.now();
    });
    var app = new chitu.Application(config);
    return window['app'] = app;
});
