import site = require('Site');
import $ = require('jquery');

const SERVICE_HOST ='service.alinq.cn:2800/UserServices';//`shop.alinq.cn`;// 'service.alinq.cn:2800/UserServices'; //
class ServiceConfig {
    serviceUrl = `http://${SERVICE_HOST}/Shop/`;
    siteServiceUrl = `http://${SERVICE_HOST}/Site/`;
    memberServiceUrl = `http://${SERVICE_HOST}/Member/`;
    weixinServiceUrl = `http://${SERVICE_HOST}/WeiXin/`;
    accountServiceUrl = `http://${SERVICE_HOST}/Account/`;
    appToken = '58424776034ff82470d06d3d';
    storeId = '58401d1906c02a2b8877bd13'
}


class Services {
    private _config: ServiceConfig;
    get defaultPageSize(): number {
        return 10;
    }
    get config(): ServiceConfig {
        if (!this._config)
            this._config = new ServiceConfig();

        return this._config;
    }
    error = $.Callbacks()

    callMethod(serviceUrl: string, method: string): JQueryPromise<any>;
    callMethod(serviceUrl: string, method: string, data: Object): JQueryPromise<any>;
    callMethod<T>(serviceUrl: string, method: string, data: Object = undefined): JQueryPromise<T> {

        return (function (service: Services, serviceUrl: string, method: string, data: Object = undefined): JQueryPromise<T> {

            data = data || {};
            if (serviceUrl == null)
                throw new Error('The service url is not setted.');

            var ajax: JQueryXHR;

            var url = serviceUrl + method + `?storeId=${service.config.storeId}`;;

            //urlParams = `?storeId=${store_id}`;

            data = $.extend({
                '$token': site.storage.token,
                '$appToken': services.config.appToken,
            }, data);

            var options = {
                headers: {
                    'application-token': service.config.appToken
                },
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
    callRemoteMethod(method: string, data: Object = undefined): JQueryPromise<any> {
        return this.callMethod(services.config.serviceUrl, method, data);
    }

    loadList(serviceUrl: string, method: string, data: Object = undefined): LoadListPromise<Array<any>> {
        var defferd = <LoadListPromise<any>>this.callMethod(serviceUrl, method, data);
        defferd.then(function (data: Array<any>) {
            if (data.length < services.defaultPageSize) {
                defferd.loadCompleted = true;
            }
            return data;
        });

        var result = <LoadListPromise<any>>defferd;

        return result;
    }
    //get token(): string {
    //    return site.storage.get_item('token');
    //}
    //set token(value: string) {
    //    debugger;
    //    site.storage.set_item('token', value);
    //}
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




