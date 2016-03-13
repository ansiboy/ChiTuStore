define(["require", "exports", 'Site', 'jquery'], function (require, exports, site, $) {
    var ServiceConfig = (function () {
        function ServiceConfig() {
            this.serviceUrl = 'http://shop.alinq.cn/UserServices/Shop/';
            this.siteServiceUrl = 'http://shop.alinq.cn/UserServices/Site/';
            this.memberServiceUrl = 'http://shop.alinq.cn/UserServices/Member/';
            this.weixinServiceUrl = 'http://shop.alinq.cn/UserServices/WeiXin/';
            this.accountServiceUrl = 'http://shop.alinq.cn/UserServices/Account/';
            this.appToken = '7F0B6740588DCFA7E1C29C627B8C87379F1C98D5962FAB01D0D604307C04BFF0182BAE0B98307143';
        }
        return ServiceConfig;
    })();
    var Services = (function () {
        function Services() {
            var _this = this;
            this.error = $.Callbacks();
            this.callMethod = function (serviceUrl, method, data) {
                if (data === void 0) { data = undefined; }
                return (function (service, serviceUrl, method, data) {
                    if (data === void 0) { data = undefined; }
                    data = data || {};
                    if (serviceUrl == null)
                        throw new Error('The service url is not setted.');
                    var ajax;
                    var url = serviceUrl + method;
                    data = $.extend({
                        '$token': site.storage.token,
                        '$appToken': services.config.appToken,
                    }, data);
                    var options = {
                        url: url,
                        data: data,
                        method: 'post',
                        dataType: 'json',
                        traditional: true
                    };
                    ajax = $.ajax(options);
                    var element = ajax['element'];
                    ajax['element'] = function () {
                        return element;
                    };
                    return ajax;
                })(_this, serviceUrl, method, data);
            };
            this.callRemoteMethod = function (method, data) {
                if (data === void 0) { data = undefined; }
                return _this.callMethod(services.config.serviceUrl, method, data);
            };
        }
        Object.defineProperty(Services.prototype, "defaultPageSize", {
            get: function () {
                return site.config.pageSize;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Services.prototype, "config", {
            get: function () {
                if (!this._config)
                    this._config = new ServiceConfig();
                return this._config;
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
    if (!window['services']) {
        var services = window['services'] = new Services();
        var _ajax = $.ajax;
        $.extend($, {
            ajax: function (options) {
                options.data = options.data || {};
                var result = $.Deferred();
                _ajax(options).done($.proxy(function (data, textStatus, jqXHR) {
                    if (data.Type == 'ErrorObject') {
                        if (data.Code == 'Success') {
                            this._result.resolve(data, textStatus, jqXHR);
                            return;
                        }
                        if ($.isFunction(this._result.element)) {
                            data.element = this._result.element();
                        }
                        services.error.fire(data, textStatus, jqXHR);
                        this._result.reject(data, textStatus, jqXHR);
                        return;
                    }
                    this._result.resolve(data);
                }, { _result: result }))
                    .fail($.proxy(function (jqXHR, textStatus) {
                    var err = { Code: textStatus, status: jqXHR.status, Message: jqXHR.statusText };
                    if ($.isFunction(this._result.element)) {
                        err['element'] = this._result.element();
                    }
                    services.error.fire(err);
                    this._result.reject(err);
                }, { _result: result }));
                return result;
            }
        });
        (function () {
            var prefix = '/Date(';
            function parseStringToDate(value) {
                var star = prefix.length;
                var len = value.length - prefix.length - ')/'.length;
                var str = value.substr(star, len);
                var num = parseInt(str);
                var date = new Date(num);
                return date;
            }
            $.ajaxSettings.converters['text json'] = function (json) {
                var result = $.parseJSON(json);
                if (typeof result === 'string') {
                    if (result.substr(0, prefix.length) == prefix)
                        result = parseStringToDate(result);
                    return result;
                }
                var stack = new Array();
                stack.push(result);
                while (stack.length > 0) {
                    var item = stack.pop();
                    for (var key in item) {
                        var value = item[key];
                        if (value == null)
                            continue;
                        if ($.isArray(value)) {
                            for (var i = 0; i < value.length; i++) {
                                stack.push(value[i]);
                            }
                            continue;
                        }
                        if ($.isPlainObject(value)) {
                            stack.push(value);
                            continue;
                        }
                        if (typeof value == 'string' && value.substr(0, prefix.length) == prefix) {
                            item[key] = parseStringToDate(value);
                        }
                    }
                }
                return result;
            };
        })();
    }
    return window['services'];
});
