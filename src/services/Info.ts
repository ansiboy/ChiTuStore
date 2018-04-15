import services = require('services/Service');
import site = require('Site');

class InfoService {
    constructor() {
    }
    getArticles(args): JQueryPromise<Array<any>> {
        var result = services.get<Array<any>>(services.config.siteServiceUrl, 'Info/GetNewsList', args);
        return result;
    }
    getArticleById(newsId): JQueryPromise<any> {
        var result = services.get(services.config.siteServiceUrl, 'Info/GetNews', { newsId: newsId });
        return result;
    }
    //exports = info;
}

window['services']['info'] = window['services']['info'] || new InfoService();
export = <InfoService>window['services']['info'];

