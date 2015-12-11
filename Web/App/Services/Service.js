define(["require", "exports", 'Site', 'jquery'], function (require, exports, site, $) {
    var ServiceConfig = (function () {
        function ServiceConfig() {
            this.serviceUrl = '';
            this.siteServiceUrl = '';
            this.memberServiceUrl = '';
            this.weixinServiceUrl = '';
        }
        return ServiceConfig;
    })();
    var Services = (function () {
        function Services() {
            var _this = this;
            this.is_config = false;
            this.loadConfig = function () {
                var getSiteConfig;
                if (window['plus']) {
                    getSiteConfig = $.ajax({ url: 'App_Data/SiteConfig.json', dataType: 'json', method: 'post' }).pipe(function (data) {
                        return $.ajax({
                            url: data.MemberServiceUrl + 'Auth/GetAppToken',
                            data: { appId: data.appId, appSecret: data.appSecret },
                            dataType: 'json'
                        }).then(function (tokenData) {
                            $.extend(data, tokenData);
                            return data;
                        });
                    });
                }
                else {
                    getSiteConfig = $.ajax({ url: 'Home/GetSiteConfig', dataType: 'json', method: 'post' });
                }
                return getSiteConfig.done(function (config) {
                    console.log('config:' + config);
                    console.log('ShopServiceUrl:' + config.ShopServiceUrl);
                    site.set_config(config);
                    if (config.AppToken)
                        site.cookies.appToken(config.AppToken);
                    _this.is_config = true;
                });
            };
            this.checkedConfig = function () {
                if (!_this.is_config)
                    return _this.loadConfig();
                return $.Deferred().resolve();
            };
            this.error = site.error;
            this.callMethod = function (serviceUrl, method, data) {
                if (data === void 0) { data = undefined; }
                return (function (service, serviceUrl, method, data) {
                    if (data === void 0) { data = undefined; }
                    data = data || {};
                    if (serviceUrl == null)
                        throw new Error('The service url is not setted.');
                    var ajax;
                    var result = service.checkedConfig()
                        .pipe(function () {
                        var url = serviceUrl + method;
                        data = $.extend({
                            '$token': site.cookies.token(),
                            '$appToken': site.cookies.appToken(),
                        }, data);
                        var options = {
                            url: url,
                            data: data,
                            method: 'post',
                            dataType: 'json',
                            traditional: true
                        };
                        ajax = $.ajax(options);
                        ajax['element'] = function () {
                            return result['element'];
                        };
                        return ajax;
                    });
                    return result;
                })(_this, serviceUrl, method, data);
            };
            this.callRemoteMethod = function (method, data) {
                if (data === void 0) { data = undefined; }
                return _this.callMethod(site.config.serviceUrl, method, data);
            };
            this.loadConfig();
        }
        Object.defineProperty(Services.prototype, "defaultPageSize", {
            get: function () {
                return site.config.pageSize;
            },
            enumerable: true,
            configurable: true
        });
        Services.prototype.loadList = function (serviceUrl, method, data) {
            if (data === void 0) { data = undefined; }
            var defferd = this.callMethod(serviceUrl, method, data);
            defferd.then(function (data) {
                if (data.length < site.config.pageSize) {
                    defferd.loadCompleted = true;
                }
                return data;
            });
            var result = defferd;
            return result;
        };
        return Services;
    })();
    window['services'] = window['services'] || new Services();
    return window['services'];
});
