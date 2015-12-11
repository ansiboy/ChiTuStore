import site = require('Site');
import $ = require('jquery');

chitu.Page.animationTime = site.config.pageAnimationTime;

var app = new chitu.Application({
    container: () => document.getElementById('main'),
    scrollType: () => {
        if (site.env.isIOS)
            return chitu.ScrollType.IScroll;

        return chitu.ScrollType.Document;
    },
    openSwipe: (routeData: chitu.RouteData) => {
        if (site.env.isIOS) {
            var controller = routeData.values().controller;
            var action = routeData.values().action;
            var name = controller + '.' + action;
            if (name == 'Home.Index' || name == 'Home.Class' || name == 'Shopping.ShoppingCart' ||
                name == 'Home.NewsList' || name == 'User.Index')
                return chitu.SwipeDirection.None;

            if (name == 'Home.ProductDetail')
                return chitu.SwipeDirection.Up;

            return chitu.SwipeDirection.Left;
        }

        return chitu.SwipeDirection.None
    },
    closeSwipe: (routeData: chitu.RouteData) => {
        if (site.env.isIOS) {
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


        return chitu.SwipeDirection.None
    }
});

//app.pageCreated.add(function (sender: chitu.Application, page: chitu.Page) {


//    var route_values = page.routeData.values();
//    var controller = route_values.controller;
//    var action = route_values.action;

//    $(page.nodes().container).addClass(controller + '-' + action);
//    if (site.env.isAndroid()) {
//        if (site.browser.isQQ)
//            $(page.nodes().container).addClass('low');
//        else
//            $(page.nodes().container).addClass('android');
//    }
//    else if (site.env.isIOS()) {
//        $(page.nodes().container).addClass('ios');
//    }
//    else {
//        $(page.nodes().container).addClass('low');
//    }
//});

//if (site.env.isQQ()) {
//    var pages = {
//    };

//    var page_stack: Array<chitu.Page> = [];

//    $.extend(app, {
//        showPage: function (url: string, args) {

//            args = args || {};

//            var routeData = this.routes().getRouteData(url);
//            $.extend(args, routeData.values());

//            if (app.currentPage())
//                app.currentPage().hide();

//            //var result = $.Deferred();
//            var page_name = chitu.Page.getPageName(routeData);
//            if (!pages[page_name]) {
//                var container: HTMLElement;
//                if ($.isFunction(this._container)) {
//                    container = (<Function>this._container)(routeData.values());
//                    if (container == null)
//                        throw new Error('The result of continer function cannt be null');
//                }
//                else {
//                    container = <HTMLElement>this._container;
//                }

//                pages[page_name] = (<any>app)._createPage(url, container, this.currentPage());
//                pages[page_name].swipe = false;
//                page_stack.push(pages[page_name]);
//            }
//            else {
//                if (pages[page_name] == page_stack[page_stack.length - 2]) {
//                    var p = page_stack.pop();
//                    p.close();
//                    pages[p.name()] = null;
//                }
//            }

//            this._currentPage = pages[page_name];
//            return pages[page_name].open(args);
//        },
//        currentPage: function (): chitu.Page {
//            return this._currentPage;
//        },
//        back(args = undefined) {
//            /// <returns type="jQuery.Deferred"/>
//            if (window.history.length == 0)
//                return $.Deferred().reject();

//            window.history.back();
//            window.setTimeout(() => {
//                var url = window.location.hash.substr(1);
//                this.showPage(url)
//            }, 200);
//            return $.Deferred().resolve();
//        },
//    });

//    app.pageCreated.add((sender: chitu.Application, page: chitu.Page) => {
//        $.extend(page, {
//            close: function (args: any = undefined) {
//                $(this.node()).remove();
//                this.on_closed(args);
//            }
//        });
//    });
//}
//else {
//var zindex = 200;
//function setPageSize(page: chitu.Page) {
//    $(page.nodes().loading).height($(window).height() + 'px');
//    $(page.nodes().body).height($(window).height() + 'px');
//}

app.pageCreated.add(function (sender: chitu.Application, page: chitu.Page) {

    //page.nodes().container.style.zIndex = zindex.toString();
    //page.nodes().body.style.zIndex = (zindex + 5).toString();
    //page.nodes().loading.style.zIndex = (zindex + 5).toString();
    //page.nodes().header.style.zIndex = (zindex + 10).toString();
    //page.nodes().footer.style.zIndex = (zindex + 10).toString();

    //zindex = zindex + 3;

    var route_values = page.routeData.values();
    var controller = route_values.controller;
    var action = route_values.action;

    $(page.nodes().container).addClass(controller + '-' + action);

    //=======================================================================
    // 设置页面大小
    //setPageSize(page);
    //=======================================================================
    // 实现滑动返回
        
    var is_menu_page =  // 底部菜单页面
        (controller == 'Home' && (action == 'Index' || action == 'NewsList' || action == 'Class')) ||
        (controller == 'Shopping' && action == 'ShoppingCart') ||
        (controller == 'User' && action == 'Index');

    if (is_menu_page) {//|| site.env.isQQ()
    }
    else {

        if ((<any>$).event.special.swipe) {
            $(page.node())
                .on('swiperight', function () {
                    app.back();
                })
                .on('movestart', function (e: any) {
                    if (Math.abs(e.distX) < Math.abs(e.distY)) {
                        e.preventDefault();
                    }
                });


        }
    }
    //=======================================================================

    if (controller == 'Home' && action == 'ProductDetail') {
        //debugger;
        //$(page.nodes().container).height(500);
    }

})
//}

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

//app.routes().mapRoute({
//    name: 'Error',
//    url: '{controller}_{action}_{hash}',
//    rules: {
//        controller: ['Error']
//    }
//});

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





export = window['app'] = app;





