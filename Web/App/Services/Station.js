define(["require", "exports", 'Services/Service', 'Site'], function (require, exports, service, site) {
    var SiteService = (function () {
        function SiteService() {
            this.searchProducts = function (searchText, pageIndex) {
                if (pageIndex === void 0) { pageIndex = 0; }
                var data = { searchText: searchText, pageIndex: pageIndex };
                return service.callMethod(site.config.siteServiceUrl, 'Home/SearchProduct', data);
            };
            this.hotKeywords = function () {
                return service.callMethod(site.config.siteServiceUrl, 'Home/GetSearchKeywords');
            };
            this.historyKeyword = function () {
                return service.callMethod(site.config.siteServiceUrl, 'Home/GetHistoryKeywords');
            };
        }
        return SiteService;
    })();
    var siteService = window['services']['station'] = window['services']['station'] || new SiteService();
    return siteService;
});
