import services = require('Services/Service');
import site = require('Site');

class InfoService {
    constructor() {
    }
    getArticles(args): JQueryPromise<Array<any>> {
        var result = services.callMethod(site.config.siteServiceUrl, 'Info/GetNewsList', args)
        result.done($.proxy(function (items) {
            this.loadCompleted = items.length < site.config.pageSize;
            return items;

        }, result));

        return result;
    }
    getArticleById(newsId): JQueryPromise<any> {
        var result = services.callMethod(site.config.siteServiceUrl, 'Info/GetNews', { newsId: newsId });
        return result;
    }
    //exports = info;
}

window['services']['info'] = window['services']['info'] || new InfoService();
export = <InfoService>window['services']['info'];

