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
            var swipe = app.config.openSwipe(route_data);
            var swipe_string = getOpenSwipeString(swipe);
            var w = plus.webview.create('Page.html#' + url, webview_id, webview_style);
            window.setTimeout(function () { return w.show(swipe_string); }, 100);
            return null;
        }
        return _showPage.apply(app, [url, args]);
    };
    var _back = app.back;
    app.back = function () {
        console.log('back');
        var close_swipe = app.config.closeSwipe(app.currentPage().routeData);
        var previous_page = app.currentPage().previous;
        if (previous_page != null) {
            console.log('previous_page not null:' + previous_page.name);
            app.currentPage().close({}, close_swipe);
            previous_page.show();
            return $.Deferred().resolve();
        }
        console.log('previous_page is null');
        var swipe_string = getCloseSwipeString(close_swipe);
        if (isNewWebView(app.currentPage().routeData)) {
            console.log('is webview page');
            var webview_id = getWebViewId(app.currentPage().routeData);
            plus.webview.close(webview_id, swipe_string);
            return $.Deferred().resolve();
        }
        console.log('is not webview page');
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
    function getCloseSwipeString(swipe) {
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
    function getOpenSwipeString(swipe) {
        var swipe_string = 'none';
        if (swipe == chitu.SwipeDirection.Left)
            swipe_string = 'slide-in-right';
        else if (swipe == chitu.SwipeDirection.Right)
            swipe_string = 'slide-in-left';
        else if (swipe == chitu.SwipeDirection.Up)
            swipe_string = 'slide-in-down';
        else if (swipe == chitu.SwipeDirection.Down)
            swipe_string = 'slide-in-up';
        return swipe_string;
    }
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
    })();
});
