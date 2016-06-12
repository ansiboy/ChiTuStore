define(["require", "exports"], function (require, exports) {
    "use strict";
    var OS;
    (function (OS) {
        OS[OS["ios"] = 0] = "ios";
        OS[OS["android"] = 1] = "android";
        OS[OS["other"] = 2] = "other";
    })(OS || (OS = {}));
    var SiteCookies = (function () {
        function SiteCookies() {
        }
        SiteCookies.prototype.sourceOpenId = function (value) {
            var name = this.get_cookieName('sourceOpenId');
            if (value === undefined)
                return site.cookies.get_value(name);
            if (!site.cookies.get_value(name))
                site.cookies.set_value(name, value);
        };
        SiteCookies.prototype.returnUrl = function (value) {
            var name = 'returnUrl';
            if (value === undefined)
                return site.cookies.get_value(name);
            site.cookies.set_value(name, value);
        };
        SiteCookies.prototype.set_value = function (name, value, expires) {
            if (expires === void 0) { expires = 7; }
            var cookieName = site.cookies.get_cookieName(name);
            $.cookie(cookieName, value, { expires: expires });
        };
        SiteCookies.prototype.get_value = function (name) {
            var cookieName = site.cookies.get_cookieName(name);
            return $.cookie(cookieName);
        };
        SiteCookies.prototype.get_cookieName = function (name) {
            return site.config.cookiePrefix + "_" + name;
        };
        return SiteCookies;
    }());
    var SiteStorage = (function () {
        function SiteStorage() {
        }
        SiteStorage.prototype.get_itemName = function (name) {
            return site.config.cookiePrefix + "_" + name;
        };
        SiteStorage.prototype.get_item = function (name) {
            var item_name = this.get_itemName(name);
            var str = window.localStorage.getItem(item_name);
            var obj = JSON.parse(str);
            return obj;
        };
        SiteStorage.prototype.set_item = function (name, value) {
            var item_name = this.get_itemName(name);
            var str = JSON.stringify(value);
            window.localStorage.setItem(item_name, str);
        };
        Object.defineProperty(SiteStorage.prototype, "historyKeywords", {
            get: function () {
                var result = this.get_item('historyKeywords');
                if (result == null) {
                    result = [];
                    this.set_item('historyKeywords', result);
                }
                return result;
            },
            set: function (value) {
                this.set_item('historyKeywords', value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SiteStorage.prototype, "token", {
            get: function () {
                return this.get_item('token');
            },
            set: function (value) {
                this.set_item('token', value);
            },
            enumerable: true,
            configurable: true
        });
        return SiteStorage;
    }());
    var SiteConfig = (function () {
        function SiteConfig() {
            this.storeName = '零食有约';
            this.pageSize = 10;
            this.defaultUrl = 'Home_Index';
            this.baseUrl = 'u.alinq.cn/test/Index.html';
            this.purchaseUrlFormat = 'pay/Purchase.html#{0}';
            this.cookiePrefix = 'lsyy';
            this.imageBaseUrl = 'http://shop.alinq.cn/AdminServices/Shop';
            this.pageAnimationTime = 400;
            this.panelWithRate = 0.9;
            this.imageDataSpliter = '#';
        }
        Object.defineProperty(SiteConfig.prototype, "animationSpeed", {
            get: function () {
                return $(window).width() / this.pageAnimationTime;
            },
            enumerable: true,
            configurable: true
        });
        return SiteConfig;
    }());
    var SiteEnvironment = (function () {
        function SiteEnvironment() {
            var userAgent = navigator.userAgent;
            if (userAgent.indexOf('iPhone') > 0 || userAgent.indexOf('iPad') > 0) {
                this._os = OS.ios;
                var match = userAgent.match(/iPhone OS\s([0-9\-]*)/);
                if (match) {
                    var major_version = parseInt(match[1], 10);
                    this._version = major_version;
                }
            }
            else if (userAgent.indexOf('Android') > 0) {
                this._os = OS.android;
                var match = userAgent.match(/Android\s([0-9\.]*)/);
                if (match) {
                    var major_version = parseInt(match[1], 10);
                    this._version = major_version;
                }
            }
            else {
                this._os = OS.other;
            }
        }
        Object.defineProperty(SiteEnvironment.prototype, "osVersion", {
            get: function () {
                return this._version;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SiteEnvironment.prototype, "os", {
            get: function () {
                return this._os;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SiteEnvironment.prototype, "isIOS", {
            get: function () {
                return this.os == OS.ios;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SiteEnvironment.prototype, "isAndroid", {
            get: function () {
                return this.os == OS.android;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SiteEnvironment.prototype, "isApp", {
            get: function () {
                var isCordovaApp = location.protocol === 'file:';
                return isCordovaApp;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SiteEnvironment.prototype, "isWeb", {
            get: function () {
                return !this.isApp;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SiteEnvironment.prototype, "isDegrade", {
            get: function () {
                if ((this.isWeiXin || this.osVersion <= 4) && this.isAndroid)
                    return true;
                if (navigator.userAgent.indexOf('MQQBrowser') >= 0) {
                    return true;
                }
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SiteEnvironment.prototype, "isWeiXin", {
            get: function () {
                var ua = navigator.userAgent.toLowerCase();
                return (ua.match(/MicroMessenger/i)) == 'micromessenger';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SiteEnvironment.prototype, "isIPhone", {
            get: function () {
                return window.navigator.userAgent.indexOf('iPhone') > 0;
            },
            enumerable: true,
            configurable: true
        });
        return SiteEnvironment;
    }());
    var Site = (function () {
        function Site() {
            this.ready_funcs = [];
            this.is_ready = false;
            this.config = new SiteConfig();
            this.cookies = new SiteCookies();
            this.storage = new SiteStorage();
            this.env = new SiteEnvironment();
        }
        Site.prototype.isMenuPage = function (routeData) {
            var name = routeData.pageName;
            return (name == 'Home.Index' || name == 'Home.Class' || name == 'Shopping.ShoppingCart' ||
                name == 'Home.NewsList' || name == 'User.Index');
        };
        return Site;
    }());
    var site = window['site'] = window['site'] || new Site();
    if (site.env.isApp) {
        document.addEventListener('deviceready', function () {
            console.log('deviceready');
        });
        requirejs(['../cordova'], function () {
        });
    }
    return site;
});
