///<reference path='../Scripts/typings/jquery.d.ts'/>
/// <reference path='../Scripts/typings/chitu.d.ts' />
import site = require('Site');
import app = require('Application');

var plus = window['plus'];
var navigator: any = plus.navigator;

var want_to_close = false;
plus.key.addEventListener("backbutton", function() {
    app.back()
        .fail(() => {
            if (want_to_close) {
                plus.runtime.quit();
                return;
            }
            want_to_close = true;
            plus.nativeUI.toast('再按一次返回退出');
        });
});



//var _showPage = app.showPage;
(<any>app)._showPage = app.showPage;
app.showPage = function(url: string, args): chitu.Page {
    want_to_close = false;
    var route_data = app.routes().getRouteData(url);
    var new_webview = isOtherWebView(route_data);
    if (new_webview) {
        //===============================================
        // 重置URL，使得返回上一页，再次点击该页面仍能打开。
        location.href = '#';
        //===============================================
        // var webview_style = {
        //     popGesture: 'close'
        // };
        //var swipe = app.config.openSwipe(route_data);
        var swipe_string = getOpenSwipeString(route_data);
        var w = WebViewPool.instance.openWebView(url, swipe_string);

        return null;
    }
    return (<any>this)._showPage(url, args);//.apply(app, [url, args]);
}

var _back = app.back;
app.back = function() {
    // console.log('back');
    // var close_swipe = app.config.closeSwipe(app.currentPage().routeData);
    // var previous_page = app.currentPage().previous;
    // if (previous_page != null) {
    //     console.log('previous_page not null:' + previous_page.name);
    //     app.currentPage().close({}, close_swipe);
    //     previous_page.show();
    //     return $.Deferred().resolve();
    // }
    // console.log('previous_page is null');
    // var swipe_string = getCloseSwipeString(close_swipe);
    // if (isOtherWebView(app.currentPage().routeData)) {
    //     console.log('is webview page');
    //     WebViewPool.instance.closeWebView(plus.webview.currentWebview(), swipe_string);
    //     return $.Deferred().resolve();
    // }
    // console.log('is not webview page');
    if (site.isMenuPage(app.currentPage().routeData)) {
        return $.Deferred().reject();
    }
    if (app.pageContainers.length == 1) {
        WebViewPool.instance.closeWebView(plus.webview.currentWebview(), 'slide-out-right');
        return $.Deferred().reject();
    }

    return (<JQueryPromise<any>>_back.apply(app));
}


// var _close = chitu.Page.prototype.close;
// function resetCloseFunction(page: chitu.Page) {
//     page.close = function() {
//         window.setTimeout($.proxy(function() {
//             _close.apply(this);
//         }, page), site.config.pageAnimationTime);
//     }
// }
// app.pageCreated.add(function(sender: chitu.Application, page: chitu.Page) {
//     resetCloseFunction(page);
// });
// if (app.currentPage())
//     resetCloseFunction(app.currentPage());

/// <summary>判断是否需要在在另外一个 ＷebView 打开</summary>
function isOtherWebView(routeData: chitu.RouteData) {
    
    // 当前 WebView 为期待的 ＷebView,在当前 WebView 打开即可。
    console.log('currentWebview id:' + plus.webview.currentWebview().id);
    console.log('target webview id:' + getWebViewId(routeData));
    if (plus.webview.currentWebview().id == getWebViewId(routeData))
        return false;


    var controller = routeData.values().controller;
    var action = routeData.values().action;
    var is_in_menu = site.isMenuPage(routeData);
    return !is_in_menu;
}

function getWebViewId(routeData: chitu.RouteData) {
    var webview_id = routeData.values().controller + '_' + routeData.values().action;
    return webview_id;
}

function getCloseSwipeString(swipe: chitu.SwipeDirection) {
    var swipe_string = 'none';
    if (swipe == chitu.SwipeDirection.Left)
        swipe_string = 'slide-out-left';
    else if (swipe == chitu.SwipeDirection.Right)
        swipe_string = 'slide-out-right';
    else if (swipe == chitu.SwipeDirection.Up)
        swipe_string = 'slide-out-up';
    else if (swipe == chitu.SwipeDirection.Down)
        swipe_string = 'slide-out-down';

    return swipe_string;
}

function getOpenSwipeString(routeData: chitu.RouteData) {
    var swipe_string = 'none';
    //     if (swipe == chitu.SwipeDirection.Left)
    swipe_string = 'slide-in-right';
    //     else if (swipe == chitu.SwipeDirection.Right)
    //         swipe_string = 'slide-in-left';
    //     else if (swipe == chitu.SwipeDirection.Up)
    //         swipe_string = 'slide-in-down';
    //     else if (swipe == chitu.SwipeDirection.Down)
    //         swipe_string = 'slide-in-up';
    // 
    return swipe_string;
}

//const Using = '$_isUsing';
/// <summary> WebView 对象池，避免反复创建 ＷebView </summary>
class WebViewPool {
    private base_url = 'Page.html';
    private webviews = new Array<any>();
    //private webviewUsing: { [index: string]: boolean } = {};
    private static _instance: WebViewPool;


    private allowCache(controller: string, action: string): boolean {
        var allow_cache = false;
        switch (controller) {
            case 'Home':
                var cache_actions = ['Product', 'ProductList', 'News'];
                allow_cache = (cache_actions.indexOf(action) >= 0);
                break;
        }

        return allow_cache;
    }

    public openWebView(url: string, swipeString: string) {


        var route_data = app.routes().getRouteData(url);
        var controller = route_data.values().controller
        var action = route_data.values().action;
        //var webview_id = controller + '.' + action;
        var webview_id = getWebViewId(route_data);

        var w = plus.webview.getWebviewById(webview_id);
        if (w) {
            console.log('webview is exists, url is ' + url);
            w.evalJS("app.closeCurrentPage();app._showPage('" + url + "')");
            //w.loadURL(this.base_url + '#' + url);
        }
        else {
            var allow_cache = this.allowCache(controller, action);
            var webview_style = { popGesture: 'close' };
            if (allow_cache) {
                webview_style = { popGesture: 'hide' };
            }

            w = plus.webview.create(this.base_url + '#' + url, webview_id, webview_style);
        }

        //===============================================
        // 延迟加载，使用页面完全载入，避免页面显示时出现闪烁。
        window.setTimeout(() => w.show(swipeString, site.config.pageAnimationTime), 100);
        //===============================================
        
        console.log('Totoal webviews :' + plus.webview.all().length);
        var all = <Array<any>>plus.webview.all();
        for (var i = 0; i < all.length; i++) {
            console.log('webview id:' + all[i].id);
        }


    }

    public closeWebView(webview: any, swipeString: string) {
        var arr = (<string>webview.id).split('.');
        var allow_cache = arr.length == 2 ? this.allowCache(arr[0], arr[1]) : false;
        if (allow_cache)
            webview.hide(swipeString, site.config.pageAnimationTime);
        else
            webview.close(swipeString, site.config.pageAnimationTime);

        webview.evalJS('app.closeCurrentPage()');
    }

    public static get instance(): WebViewPool {
        if (WebViewPool._instance == null)
            WebViewPool._instance = new WebViewPool();

        return WebViewPool._instance;
    }

}

/// <summary> 沉浸式标题 </summary>
(function immersed() {

    var immersed = 0;
    var ms = (/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
    if (ms && ms.length >= 3) {
        immersed = parseFloat(ms[2]);
    }

    if (!immersed) {
        if (site.env.isIOS) {
            navigator.setStatusBarStyle('UIStatusBarStyleBlackOpaque');
            navigator.setStatusBarBackground('#bf0705');
        }

        return;
    }
    //TODO:设置沉浸式样式
})();

