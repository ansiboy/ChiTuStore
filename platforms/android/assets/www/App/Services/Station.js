define(["require", "exports", 'Services/Service'], function (require, exports, services) {
    "use strict";
    var SiteService = (function () {
        function SiteService() {
            this.searchProducts = function (searchText, pageIndex) {
                if (pageIndex === void 0) { pageIndex = 0; }
                var data = { searchText: searchText, pageIndex: pageIndex };
                return services.callMethod(services.config.siteServiceUrl, 'Home/SearchProduct', data);
            };
            this.hotKeywords = function () {
                return services.callMethod(services.config.siteServiceUrl, 'Home/GetSearchKeywords');
            };
            this.historyKeyword = function () {
                return services.callMethod(services.config.siteServiceUrl, 'Home/GetHistoryKeywords');
            };
        }
        return SiteService;
    }());
    var siteService = window['services']['station'] = window['services']['station'] || new SiteService();
    return siteService;
});
