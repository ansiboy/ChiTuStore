import site = require('Site');
import $ = require('jquery');


class ServiceConfig {
    serviceUrl = ''
    siteServiceUrl = ''
    memberServiceUrl = ''
    weixinServiceUrl = ''
}


class Services {
    constructor() {
        this.loadConfig();
    }
    get defaultPageSize(): number {
        return site.config.pageSize;
    }
    private is_config: boolean = false

    loadConfig = () => {
        //======================================================================================
        // 这段和 Site 相关的代码，貌似只能放在这里，Rewrite 文件依赖 Site 文件，放在 Site 文件没办法
        // 处理连接错误 
        var getSiteConfig: JQueryPromise<any>
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

        return getSiteConfig.done((config) => {
            console.log('config:' + config);
            console.log('ShopServiceUrl:' + config.ShopServiceUrl);

            site.set_config(config);
            if (config.AppToken)
                site.cookies.appToken(config.AppToken);

            this.is_config = true;

        });
        //======================================================================================
    }

    checkedConfig = (): JQueryPromise<any> => {
        if (!this.is_config)
            return this.loadConfig();

        return $.Deferred().resolve();
    }

    error = site.error //$.Callbacks()
    callMethod = (serviceUrl: string, method: string, data: Object = undefined): JQueryPromise<any> => {

        return (function (service: Services, serviceUrl: string, method: string, data: Object = undefined): JQueryPromise<any> {

            data = data || {};
            if (serviceUrl == null)
                throw new Error('The service url is not setted.');

            var ajax: JQueryXHR;
            var result = service.checkedConfig()
                .pipe(() => {
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
                    ajax['element'] = () => {
                        return result['element'];
                    };

                    return ajax;
                });


            return result;

        })(this, serviceUrl, method, data);


    }
    callRemoteMethod = (method: string, data: Object = undefined): JQueryPromise<any> => {
        return this.callMethod(site.config.serviceUrl, method, data);
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



window['services'] = window['services'] || new Services();
export = <Services>window['services'];




