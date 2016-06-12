import chitu = require('chitu');
import site = require('Site');
import PageContainerFactory = require('PageContainerFactory');

chitu.Page.animationTime = site.config.pageAnimationTime;

class UrlParser extends chitu.UrlParser {
    pareeUrl(url: string): chitu.RouteData {
        var a = document.createElement('a');
        a.href = url;

        var routeData: chitu.RouteData = super.pareeUrl(url);
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

        //            case 'AccountSecurity':


        var css_path = chitu.Utility.format('css!content/{0}/{1}', route_values[0], route_values[1]);
        routeData.resource = [css_path];

        return routeData;
    }
}

let urlParser = new UrlParser();
urlParser.pathBase = 'mod/';

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

var app = new chitu.Application(config);
export = window['app'] = app;


