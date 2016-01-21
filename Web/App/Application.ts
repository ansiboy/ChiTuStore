import site = require('Site');

chitu.Page.animationTime = site.config.pageAnimationTime;


class SiteApplication extends chitu.Application {
    run() {
        $(window).bind('hashchange', $.proxy(this.hashchange, this));

        var hash = window.location.hash;
        if (!hash) {
            return;
        }

        var args = window.location['arguments'] || {};
        window.location['arguments'] = null;
        this.showPage(hash.substr(1), args);
    }
    hashchange() {
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
    }
    back(args = undefined): JQueryDeferred<any> {
        var plus = window['plus'];
        plus.webview.currentWebview().close();
        return $.Deferred().resolve();
    }
}

var config: chitu.ApplicationConfig = {
    container: () => document.getElementById('main'),
    scrollType: (routeData: chitu.RouteData) => {
        if (site.env.isDegrade)//||site.env.isApp
            return chitu.ScrollType.Document;

        if (site.env.isIOS) {
            return chitu.ScrollType.IScroll;
        }

        if (site.env.isAndroid)
            return chitu.ScrollType.Div;

        return chitu.ScrollType.Div;
    },
    openSwipe: (routeData: chitu.RouteData) => {
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
    closeSwipe: (routeData: chitu.RouteData) => {
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
}

var app = site.env.isApp ? new SiteApplication(config) : new chitu.Application(config);



app.pageCreated.add(function (sender: chitu.Application, page: chitu.Page) {

    var route_values = page.routeData.values();
    var controller = route_values.controller;
    var action = route_values.action;

    $(page.nodes().container).addClass(controller + '-' + action);

    var is_menu_page =  // 底部菜单页面
        (controller == 'Home' && (action == 'Index' || action == 'NewsList' || action == 'Class')) ||
        (controller == 'Shopping' && action == 'ShoppingCart') ||
        (controller == 'User' && action == 'Index');

    if (!is_menu_page) {
        // 实现滑动返回
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
    //说明：一定要的，否则会因为 document 对象的偏移，使得顶栏消失
    if (site.env.isIOS) {
        page.shown.add(() => {
            $(document).scrollTop(0);
            $(document).scrollLeft(0);
        });
    }
    //=======================================================================

    page.load.add(function (sender: chitu.Page, args: chitu.PageLoadArguments) {
        var enableScrollLoad = args.enableScrollLoad;
        var descriptor = Object.getOwnPropertyDescriptor(chitu.PageLoadArguments.prototype, 'enableScrollLoad');
        Object.defineProperty(args, "enableScrollLoad", {
            set: function (value) {
                if (!(sender.bottomLoading instanceof PageBottomLoading))
                    sender.bottomLoading = new PageBottomLoading(page)

                if (value == false) {
                    (<PageBottomLoading>sender.bottomLoading).status('complete');
                }

                descriptor.set.apply(this, [value]);
            },
            get: function () {
                return descriptor.get.apply(this);
            },
            configurable: descriptor.configurable,
            enumerable: descriptor.enumerable
        });
    });
})

class PageBottomLoading implements chitu.PageLoading {
    private LOADDING_HTML = '<i class="icon-spinner icon-spin"></i><span style="padding-left:10px;">数据正在加载中...</span>';
    private LOADCOMPLETE_HTML = '<span style="padding-left:10px;">数据已全部加载完</span>';
    private _page: chitu.Page;
    private _scrollLoad_loading_bar: HTMLElement;

    constructor(page: chitu.Page) {
        if (!page)
            throw chitu.Errors.argumentNull('page');

        this._page = page;

        this._scrollLoad_loading_bar = document.createElement('div');
        this._scrollLoad_loading_bar.innerHTML = '<div style="padding:10px 0px 10px 0px;"><h5 class="text-center"></h5></div>';
        this._scrollLoad_loading_bar.style.display = 'block';
        $(this._scrollLoad_loading_bar).find('h5').html(this.LOADDING_HTML);
        page.nodes().content.appendChild(this._scrollLoad_loading_bar);
        page.refreshUI();
    }
    show() {
        if (this._scrollLoad_loading_bar.style.display == 'block')
            return;

        this._scrollLoad_loading_bar.style.display = 'block';
        this._page.refreshUI();
    }
    hide() {
    }
    status(value: string) {
        if (value == 'complete') {
            $(this._scrollLoad_loading_bar).find('h5').html(this.LOADCOMPLETE_HTML);
        }
    }
}

if (!site.env.isDegrade && site.env.isAndroid && !site.env.isApp) {
    requirejs(['hammer'], function (hammer) {
        console.log('hammer load');
        window['Hammer'] = window['Hammer'] || hammer;

        app.pageCreated.add(function (sender: chitu.Application, page: chitu.Page) {
            var previous_page = page.previous;
            if (previous_page == null)
                return;

            var node = page.nodes().container;
            var hammer = new Hammer(page.nodes().content);
            hammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL | Hammer.DIRECTION_VERTICAL });
            hammer.on('panleft', function (e: PanEvent) {
                if (e.deltaX <= 0) {
                    node.style.webkitTransform = 'translateX(' + 0 + 'px)';
                    return;
                }

                console.log('e.deltaX:' + e.deltaX);
                node.style.webkitTransform = 'translateX(' + e.deltaX + 'px)';
                console.log('panleft');
                console.log(arguments);
            });
            hammer.on('panright', function (e: PanEvent) {
                node.style.webkitTransform = 'translateX(' + e.deltaX + 'px)';
                console.log('panright');
                console.log('velocityX:' + e.velocityX);
            });
            hammer.on('panstart', function () {
                previous_page.nodes().container.style.display = 'block';
            });
            hammer.on('panend', function (e: PanEvent) {
                if (e.deltaX > 100) {
                    app.back();
                    return;
                }

                previous_page.nodes().container.style.display = 'none';
                node.style.webkitTransform = 'translateX(' + 0 + 'px)';
                node.style.webkitTransitionDuration = '500';
            });

        })
    })
}


//function addEventTest() {
//    plus.key.addEventListener("backbutton", function () {
//        alert("BackButton Key pressed!");
//    });
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





