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
    app._showPage = app.showPage;
    app.showPage = function (url, args) {
        want_to_close = false;
        var route_data = app.routes().getRouteData(url);
        var new_webview = isOtherWebView(route_data);
        if (new_webview) {
            location.href = '#';
            var swipe_string = getOpenSwipeString(route_data);
            var w = WebViewPool.instance.openWebView(url, swipe_string);
            return null;
        }
        return this._showPage(url, args);
    };
    var _back = app.back;
    app.back = function () {
        if (site.isMenuPage(app.currentPage().routeData)) {
            return $.Deferred().reject();
        }
        if (app.pages.length == 1) {
            WebViewPool.instance.closeWebView(plus.webview.currentWebview(), 'slide-out-right');
            return $.Deferred().reject();
        }
        return _back.apply(app);
    };
    var _close = chitu.Page.prototype.close;
    function resetCloseFunction(page) {
        page.close = function () {
            window.setTimeout($.proxy(function () {
                _close.apply(this);
            }, page), site.config.pageAnimationTime);
        };
    }
    app.pageCreated.add(function (sender, page) {
        resetCloseFunction(page);
    });
    if (app.currentPage())
        resetCloseFunction(app.currentPage());
    function isOtherWebView(routeData) {
        console.log('currentWebview id:' + plus.webview.currentWebview().id);
        console.log('target webview id:' + getWebViewId(routeData));
        if (plus.webview.currentWebview().id == getWebViewId(routeData))
            return false;
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
    function getOpenSwipeString(routeData) {
        var swipe_string = 'none';
        swipe_string = 'slide-in-right';
        return swipe_string;
    }
    var WebViewPool = (function () {
        function WebViewPool() {
            this.base_url = 'Page.html';
            this.webviews = new Array();
        }
        WebViewPool.prototype.allowCache = function (controller, action) {
            var allow_cache = false;
            switch (controller) {
                case 'Home':
                    var cache_actions = ['Product', 'ProductList', 'News'];
                    allow_cache = (cache_actions.indexOf(action) >= 0);
                    break;
            }
            return allow_cache;
        };
        WebViewPool.prototype.openWebView = function (url, swipeString) {
            var route_data = app.routes().getRouteData(url);
            var controller = route_data.values().controller;
            var action = route_data.values().action;
            var webview_id = getWebViewId(route_data);
            var w = plus.webview.getWebviewById(webview_id);
            if (w) {
                console.log('webview is exists, url is ' + url);
                w.evalJS("app.closeCurrentPage();app._showPage('" + url + "')");
            }
            else {
                var allow_cache = this.allowCache(controller, action);
                var webview_style = { popGesture: 'close' };
                if (allow_cache) {
                    webview_style = { popGesture: 'hide' };
                }
                w = plus.webview.create(this.base_url + '#' + url, webview_id, webview_style);
            }
            window.setTimeout(function () { return w.show(swipeString, site.config.pageAnimationTime); }, 100);
            console.log('Totoal webviews :' + plus.webview.all().length);
            var all = plus.webview.all();
            for (var i = 0; i < all.length; i++) {
                console.log('webview id:' + all[i].id);
            }
        };
        WebViewPool.prototype.closeWebView = function (webview, swipeString) {
            var arr = webview.id.split('.');
            var allow_cache = arr.length == 2 ? this.allowCache(arr[0], arr[1]) : false;
            if (allow_cache)
                webview.hide(swipeString, site.config.pageAnimationTime);
            else
                webview.close(swipeString, site.config.pageAnimationTime);
            webview.evalJS('app.closeCurrentPage()');
        };
        Object.defineProperty(WebViewPool, "instance", {
            get: function () {
                if (WebViewPool._instance == null)
                    WebViewPool._instance = new WebViewPool();
                return WebViewPool._instance;
            },
            enumerable: true,
            configurable: true
        });
        return WebViewPool;
    })();
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
