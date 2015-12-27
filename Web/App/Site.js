define(["require", "exports"], function (require, exports) {
    var EnvironmentType;
    (function (EnvironmentType) {
        EnvironmentType[EnvironmentType["ios"] = 0] = "ios";
        EnvironmentType[EnvironmentType["android"] = 1] = "android";
        EnvironmentType[EnvironmentType["low"] = 2] = "low";
        EnvironmentType[EnvironmentType["pc"] = 3] = "pc";
    })(EnvironmentType || (EnvironmentType = {}));
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
        SiteCookies.prototype.appToken = function (value) {
            if (value === void 0) { value = undefined; }
            var name = 'appToken';
            if (value === undefined)
                return site.cookies.get_value(name);
            $.cookie(name, value);
            site.cookies.set_value(name, value);
        };
        SiteCookies.prototype.token = function (value) {
            if (value === void 0) { value = undefined; }
            var name = 'token';
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
    })();
    var SiteStorage = (function () {
        function SiteStorage() {
        }
        SiteStorage.prototype.get_item = function (name) {
            var str = window.localStorage.getItem(name);
            var obj = JSON.parse(str);
            return obj;
        };
        SiteStorage.prototype.set_item = function (name, value) {
            var str = JSON.stringify(value);
            window.localStorage.setItem(name, str);
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
        return SiteStorage;
    })();
    var SiteConfig = (function () {
        function SiteConfig() {
            this.storeName = '零食有约';
            this.pageSize = 10;
            this.defaultUrl = 'Index';
            this.baseUrl = 'u.alinq.cn/test/Index.html';
            this.purchaseUrlFormat = 'pay/Purchase.html#{0}';
            this.cookiePrefix = 'lsyy';
            this.imageBaseUrl = 'http://shop.alinq.cn/AdminServices/Shop';
            this.pageAnimationTime = 500;
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
    })();
    var SiteEnvironment = (function () {
        function SiteEnvironment() {
        }
        SiteEnvironment.isIOS = function (userAgent) {
            return userAgent.indexOf('iPhone') > 0 || userAgent.indexOf('iPad') > 0;
        };
        SiteEnvironment.isAndroid = function (userAgent) {
            var ua = userAgent.toLowerCase();
            var android_major_version = 0;
            var match = ua.match(/android\s([0-9\.]*)/);
            if (match)
                android_major_version = parseInt(match[1], 10);
            return android_major_version;
        };
        SiteEnvironment.prototype['type'] = function () {
            if (this._environmentType == null) {
                var andriod_version = SiteEnvironment.isAndroid(navigator.userAgent);
                if (andriod_version) {
                    if (andriod_version < 4) {
                        this._environmentType = EnvironmentType.low;
                    }
                    else {
                        this._environmentType = EnvironmentType.android;
                    }
                }
                else if (SiteEnvironment.isIOS(navigator.userAgent)) {
                    this._environmentType = EnvironmentType.ios;
                }
                else {
                    this._environmentType = EnvironmentType.pc;
                }
            }
            return this._environmentType;
        };
        Object.defineProperty(SiteEnvironment.prototype, "isIOS", {
            get: function () {
                return site.env.type() == EnvironmentType.ios;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SiteEnvironment.prototype, "isAndroid", {
            get: function () {
                return site.env.type() == EnvironmentType.android;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SiteEnvironment.prototype, "isDegrade", {
            get: function () {
                if (this.isWeiXin && this.isAndroid)
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
    })();
    var Site = (function () {
        function Site() {
            this.ready_funcs = [];
            this.is_ready = false;
            this.config = new SiteConfig();
            this.cookies = new SiteCookies();
            this.storage = new SiteStorage();
            this.env = new SiteEnvironment();
        }
        Site.prototype.invokeReadyFunc = function (func) {
            func();
        };
        Site.prototype.set_config = function (config) {
            site.config.cookiePrefix = config.CookiePrefix;
            site.config.imageBaseUrl = config.ImageBaseUrl;
            site.cookies.appToken(config.AppToken);
            this.is_ready = true;
            for (var i = 0; i < this.ready_funcs.length; i++) {
                this.invokeReadyFunc(this.ready_funcs[i]);
            }
        };
        return Site;
    })();
    var site = window['site'] = window['site'] || new Site();
    return site;
});
