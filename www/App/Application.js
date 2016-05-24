var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'chitu', 'Site', 'PageContainerFactory'], function (require, exports, chitu, site, PageContainerFactory) {
    chitu.Page.animationTime = site.config.pageAnimationTime;
    var UrlParser = (function (_super) {
        __extends(UrlParser, _super);
        function UrlParser() {
            _super.apply(this, arguments);
        }
        UrlParser.prototype.pareeUrl = function (url) {
            var a = document.createElement('a');
            a.href = url;
            var routeData = _super.prototype.pareeUrl.call(this, url);
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
            var css_path = chitu.Utility.format('css!content/{0}/{1}', route_values[0], route_values[1]);
            routeData.resource = [css_path];
            return routeData;
        };
        return UrlParser;
    })(chitu.UrlParser);
    var urlParser = new UrlParser();
    urlParser.pathBase = 'mod/';
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
