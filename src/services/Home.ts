import services = require('services/Service');
import site = require('Site');
class HomeService {
    getMenus() {
        /// <summary>
        /// 获取系统设置的菜单
        /// </summary>

        var result = services.get(services.config.siteServiceUrl, 'ui/GetMenus');
        return result;
    }
    advertItems(): JQueryPromise<any[]> {
        var result = services.get<any[]>(services.config.siteServiceUrl, 'Home/GetAdvertItems');
        return result;
    }
    homeProducts(pageIndex: number): JQueryPromise<Array<any>> {
        var result = services.get<any[]>(services.config.siteServiceUrl, 'Home/GetHomeProducts', { pageIndex });
        result.then((data: Array<any>) => {
            return data;
        })
        return result;
    }
    getBrands(args) {
        var result = services.get(services.config.siteServiceUrl, 'Product/GetBrands', args);
        return result;
    }
}
window['services']['home'] = window['services']['home'] || new HomeService();
export = <HomeService>window['services']['home'];