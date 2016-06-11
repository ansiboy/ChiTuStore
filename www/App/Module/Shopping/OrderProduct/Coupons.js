define(["require", "exports", 'Services/Coupon', 'move', 'Site', 'iscroll'], function (require, exports, coupon, move, site, IScroll) {
    "use strict";
    var show_time = site.config.pageAnimationTime;
    var Model = (function () {
        function Model() {
            var _this = this;
            this.coupons = ko.observableArray();
            this.html_load = $.Deferred();
            this.close = function () {
                var m = move(_this.dialog_element);
                m.x($(window).width()).duration(show_time).end(function () { return _this.node.style.display = 'none'; });
            };
            this.open = function (orderId) {
                return $.when(coupon.getAvailableCoupons(orderId), _this.html_load).done(function (coupons) {
                    debugger;
                    var m = move(_this.dialog_element);
                    m.x($(window).width()).duration(0).end();
                    _this.node.style.display = 'block';
                    m.x(0 - $(window).width()).duration(show_time).end(function () {
                        window.setTimeout(function () { return _this.iscroll.refresh(); }, 1000);
                    });
                    _this.coupons(coupons);
                });
            };
            this.selectCouponCode = function (item) {
                debugger;
                if (_this.couponCodeSelected) {
                    _this.couponCodeSelected(item);
                }
                _this.close();
            };
            requirejs(['text!Module/Shopping/OrderProduct/Coupons.html', 'UI/CouponListItem'], function (html) {
                var $html = $(html).appendTo($('#footer'));
                var win_width = $(window).width();
                _this.width = win_width;
                $html.find('.modal-dialog').css('width', _this.width + 'px');
                var $wrapper = $html.find('.modal-body');
                var TOP_BAR_HEIGHT = 50;
                $wrapper.css('height', ($(window).height() - TOP_BAR_HEIGHT) + 'px');
                _this.iscroll = new IScroll($wrapper[0], { tap: true });
                _this.node = $html[0];
                ko.applyBindings(_this, $html[0]);
                _this.dialog_element = $($html[0]).find('.modal-dialog')[0];
                _this.html_load.resolve(_this.node);
            });
        }
        return Model;
    }());
    return Model;
});
