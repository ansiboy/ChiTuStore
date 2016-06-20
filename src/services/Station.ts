import services = require('services/Service');
import site = require('Site');

class SiteService {
    searchProducts = (searchText: string, pageIndex: number = 0): JQueryPromise<any> => {
        var data = { searchText: searchText, pageIndex: pageIndex };
        return services.callMethod(services.config.siteServiceUrl, 'Home/SearchProduct', data);
    }
    hotKeywords = (): JQueryPromise<string[]> => {
        return services.callMethod(services.config.siteServiceUrl, 'Home/GetSearchKeywords');
    }
    historyKeyword = (): JQueryPromise<string[]>=> {
        return services.callMethod(services.config.siteServiceUrl, 'Home/GetHistoryKeywords');
    }
}

var siteService: SiteService = window['services']['station'] = window['services']['station'] || new SiteService();
export = siteService;