define(["require", "exports", 'Services/Service', 'Site'], function (require, exports, services, site) {
    var HomeService = (function () {
        function HomeService() {
        }
        HomeService.prototype.getMenus = function () {
            /// <summary>
            /// 获取系统设置的菜单
            /// </summary>
            var result = services.callMethod(services.config.siteServiceUrl, 'UI/GetMenus');
            return result;
        };
        HomeService.prototype.advertItems = function () {
            var result = services.callMethod(services.config.siteServiceUrl, 'Home/GetAdvertItems');
            return result;
        };
        HomeService.prototype.homeProducts = function (pageIndex) {
            var result = services.callMethod(services.config.siteServiceUrl, 'Home/GetHomeProducts', { pageIndex: pageIndex });
            result.then(function (data) {
                if (data.length < site.config.pageSize)
                    result['loadCompleted'] = true;
                return data;
            });
            return result;
        };
        HomeService.prototype.getBrands = function (args) {
            var result = services.callRemoteMethod('Product/GetBrands', args);
            return result;
        };
        return HomeService;
    })();
    window['services']['home'] = window['services']['home'] || new HomeService();
    return window['services']['home'];
});
