import services = require('Services/Service');
import site = require('Site');
class HomeService {
    getMenus() {
        /// <summary>
        /// 获取系统设置的菜单
        /// </summary>

        var result = services.callMethod(services.config.siteServiceUrl, 'UI/GetMenus');
        return result;
    }
    advertItems():JQueryPromise<any[]> {
        var result = services.callMethod(services.config.siteServiceUrl, 'Home/GetAdvertItems');
        return result;
    }
    homeProducts(pageIndex: number): JQueryPromise<Array<any>> {
        var result = services.callMethod(services.config.siteServiceUrl, 'Home/GetHomeProducts', { pageIndex });
        result.then((data: Array<any>) => {
            return data;
        })
        return result;
    }
    getBrands(args) {
        var result = services.callRemoteMethod('Product/GetBrands', args);
        return result;
    }
}
window['services']['home'] = window['services']['home'] || new HomeService();
export = <HomeService>window['services']['home'];