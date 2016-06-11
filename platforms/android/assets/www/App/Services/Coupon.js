define(["require", "exports", 'Site', 'Services/Service'], function (require, exports, site, services) {
    "use strict";
    var Coupon = (function () {
        function Coupon() {
            var _this = this;
            this.getMyCoupons = function (args) {
                var result = services.callMethod(services.config.serviceUrl, 'Coupon/GetMyCoupons', args);
                result.then($.proxy(function (data) {
                    $(data).each(function (i, item) { return _this.extendCoupon(item); });
                    result['loadCompleted'] = data.length < site.config.pageSize;
                    return data;
                }, result));
                return result;
            };
        }
        Coupon.prototype.extendCoupon = function (coupon) {
            if (coupon.UsedDateTime) {
                coupon.StatusText = '已使用';
            }
            else if (coupon.ValidEnd < new Date(Date.now())) {
                coupon.StatusText = '已过期';
            }
            else {
                coupon.StatusText = '未使用';
            }
        };
        Coupon.prototype.getAvailableCoupons = function (orderId) {
            var _this = this;
            return services.callMethod(services.config.serviceUrl, 'Coupon/GetAvailableCouponCodes', { orderId: orderId })
                .then(function (data) {
                $(data).each(function (i, item) { return _this.extendCoupon(item); });
                return data;
            });
        };
        return Coupon;
    }());
    services['coupon'] = services['coupon'] || new Coupon();
    return services['coupon'];
});
