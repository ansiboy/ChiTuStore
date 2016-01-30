
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
        })
        // .done(() => {
        //     want_to_close = false;
        // });
});

var _showPage = app.showPage;
app.showPage = function(url: string, args): chitu.Page {
    want_to_close = false;
    var route_data = app.routes().getRouteData(url);
    var new_webview = isNewWebView(route_data);
    if (new_webview) {
        var webview_id = getWebViewId(route_data);
        //===============================================
        // 重置URL，使得返回上一页，再次点击该页面仍能打开。
        location.href = '#';
        //===============================================
        var webview_style = {
            popGesture: 'close'
        };
        var swipe_string = 'slide-in-right';
        plus.webview.open('Page.html#' + url, webview_id, webview_style, swipe_string);

        return null;
    }
    return _showPage.apply(app, [url, args]);
}

var _back = app.back;
app.back = function() {
    if (isNewWebView(app.currentPage().routeData)) {
        var webview_id = getWebViewId(app.currentPage().routeData);
        plus.webview.close(webview_id, 'slide-out-right')
        return $.Deferred().resolve();
    }

    if (site.isMenuPage(app.currentPage().routeData)) {
        return $.Deferred().reject();
    }

    return (<JQueryPromise<any>>_back.apply(app));
}

function isNewWebView(routeData: chitu.RouteData) {
    var controller = routeData.values().controller;
    var action = routeData.values().action;
    var is_in_menu = site.isMenuPage(routeData);
    return !is_in_menu;
}

function getWebViewId(routeData: chitu.RouteData) {
    var webview_id = routeData.values().controller + '_' + routeData.values().action;
    return webview_id;
}

/// <summary>
/// 沉浸式标题
/// </summary>
function immersed() {

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
}
immersed();
