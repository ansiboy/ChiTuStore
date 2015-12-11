import service = require('Services/Service');
import site = require('Site');

class SiteService {
    searchProducts = (searchText: string, pageIndex: number = 0): JQueryPromise<any> => {
        var data = { searchText: searchText, pageIndex: pageIndex };
        return service.callMethod(site.config.siteServiceUrl, 'Home/SearchProduct', data);
    }
    hotKeywords = (): JQueryPromise<string[]> => {
        return service.callMethod(site.config.siteServiceUrl, 'Home/GetSearchKeywords');
    }
    historyKeyword = (): JQueryPromise<string[]>=> {
        return service.callMethod(site.config.siteServiceUrl, 'Home/GetHistoryKeywords');
    }
}

var siteService: SiteService = window['services']['station'] = window['services']['station'] || new SiteService();
export = siteService;