import site = require('Site');
import $ = require('jquery');


class ServiceConfig {
    serviceUrl = 'http://shop.alinq.cn/UserServices/Shop/'
    siteServiceUrl = 'http://shop.alinq.cn/UserServices/Site/'
    memberServiceUrl = 'http://shop.alinq.cn/UserServices/Member/'
    weixinServiceUrl = 'http://shop.alinq.cn/UserServices/WeiXin/'
    accountServiceUrl = 'http://shop.alinq.cn/UserServices/Account/'
}


class Services {
    //constructor() {
    //    this.loadConfig();
    //}
    private _config: ServiceConfig;
    get defaultPageSize(): number {
        return site.config.pageSize;
    }
    get config(): ServiceConfig {
        if (!this._config)
            this._config = new ServiceConfig();

        return this._config;
    }
    //private is_config: boolean = false
    
    //loadConfig = () => {
    //    //======================================================================================
    //    // 这段和 Site 相关的代码，貌似只能放在这里，Rewrite 文件依赖 Site 文件，放在 Site 文件没办法
    //    // 处理连接错误 
    //    var getSiteConfig: JQueryPromise<any>
    //    if (window['plus']) {
    //        getSiteConfig = $.ajax({ url: 'App_Data/SiteConfig.json', dataType: 'json', method: 'post' }).pipe(function (data) {
    //            return $.ajax({
    //                url: data.MemberServiceUrl + 'Auth/GetAppToken',
    //                data: { appId: data.appId, appSecret: data.appSecret },
    //                dataType: 'json'
    //            }).then(function (tokenData) {
    //                $.extend(data, tokenData);
    //                return data;
    //            });
    //        });
    //    }
    //    else {
    //        getSiteConfig = $.ajax({ url: 'Home/GetSiteConfig', dataType: 'json', method: 'post' });
    //    }

    //    return getSiteConfig.done((config) => {
    //        console.log('config:' + config);
    //        console.log('ShopServiceUrl:' + config.ShopServiceUrl);

    //        site.set_config(config);
    //        if (config.AppToken)
    //            site.cookies.appToken(config.AppToken);

    //        this.is_config = true;

    //    });
    //    //======================================================================================
    //}

    //checkedConfig = (): JQueryPromise<any> => {
    //    if (!this.is_config)
    //        return this.loadConfig();

    //    return $.Deferred().resolve();
    //}

    error = $.Callbacks()
    callMethod = (serviceUrl: string, method: string, data: Object = undefined): JQueryPromise<any> => {

        return (function (service: Services, serviceUrl: string, method: string, data: Object = undefined): JQueryPromise<any> {

            data = data || {};
            if (serviceUrl == null)
                throw new Error('The service url is not setted.');

            var ajax: JQueryXHR;
            //var result = service.checkedConfig()
            //    .pipe(() => {

            //    });


            //return result;
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
            var element = ajax['element'];
            ajax['element'] = () => {
                return element;
            };

            return ajax;

        })(this, serviceUrl, method, data);


    }
    callRemoteMethod = (method: string, data: Object = undefined): JQueryPromise<any> => {
        return this.callMethod(services.config.serviceUrl, method, data);
    }

    loadList(serviceUrl: string, method: string, data: Object = undefined): LoadListPromise<Array<any>> {
        var defferd = <LoadListPromise<any>>this.callMethod(serviceUrl, method, data);
        defferd.then(function (data: Array<any>) {
            if (data.length < site.config.pageSize) {
                defferd.loadCompleted = true;
            }
            return data;
        });

        var result = <LoadListPromise<any>>defferd;

        return result;
    }
}


if (!window['services']) {
    var services = window['services'] = new Services();

    //===========================================================================
    // jquery ajax 扩展

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

                this._result.resolve(data, textStatus, jqXHR);
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

    //============================================================
    //这一部份可能需要移入 JData
    //var parseStringToDate
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
                //Sys.Debug.assert(item != null);

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
    //================================================================
}
export = <Services>window['services'];




