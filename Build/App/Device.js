define(["require", "exports", 'Site', 'Application'], function (require, exports, site, app) {
    var plus = window['plus'];
    var navigator = plus.navigator;
    var want_to_close = false;
    plus.key.addEventListener("backbutton", function () {
        app.back()
            .fail(function () {
            if (want_to_close) {
                plus.runtime.quit();
                return;
            }
            want_to_close = true;
            plus.nativeUI.toast('再按一次返回退出');
        });
    });
    var _showPage = app.showPage;
    app.showPage = function (url, args) {
        want_to_close = false;
        var route_data = app.routes().getRouteData(url);
        var new_webview = isNewWebView(route_data);
        if (new_webview) {
            var webview_id = getWebViewId(route_data);
            location.href = '#';
            var webview_style = {
                popGesture: 'close'
            };
            var swipe_string = 'slide-in-right';
            plus.webview.open('Page.html#' + url, webview_id, webview_style, swipe_string);
            return null;
        }
        return _showPage.apply(app, [url, args]);
    };
    var _back = app.back;
    app.back = function () {
        if (isNewWebView(app.currentPage().routeData)) {
            var webview_id = getWebViewId(app.currentPage().routeData);
            plus.webview.close(webview_id, 'slide-out-right');
            return $.Deferred().resolve();
        }
        if (site.isMenuPage(app.currentPage().routeData)) {
            return $.Deferred().reject();
        }
        return _back.apply(app);
    };
    function isNewWebView(routeData) {
        var controller = routeData.values().controller;
        var action = routeData.values().action;
        var is_in_menu = site.isMenuPage(routeData);
        return !is_in_menu;
    }
    function getWebViewId(routeData) {
        var webview_id = routeData.values().controller + '_' + routeData.values().action;
        return webview_id;
    }
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
    }
    immersed();
});
