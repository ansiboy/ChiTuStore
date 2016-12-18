import site = require('Site');
import services = require('services/Service');

class Coupon {
    private extendCoupon(coupon) {
        if (coupon.UsedDateTime) {
            coupon.StatusText = '已使用';
        }
        else if (coupon.ValidEnd < new Date(Date.now())) {
            coupon.StatusText = '已过期';
        }
        else {
            coupon.StatusText = '未使用';
        }
    }
    getMyCoupons = (args) => {
        var result = services.callMethod(services.config.shopServiceUrl, 'Coupon/GetMyCoupons', args);
        result.then($.proxy((data) => {
            /// <param name="data" type="Array"/>
            $(data).each((i, item) => this.extendCoupon(item));
            return data;
        }, result));

        return result;
    }
    getAvailableCoupons(orderId):JQueryPromise<any[]> {
        return services.callMethod(services.config.shopServiceUrl, 'Coupon/GetAvailableCouponCodes', { orderId: orderId })
            .then((data) => {
                $(data).each((i, item) => this.extendCoupon(item));
                return data;
            });
    }
}

services['coupon'] = services['coupon'] || new Coupon();
export = <Coupon>services['coupon'];