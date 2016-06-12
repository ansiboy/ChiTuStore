var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Services/Coupon'], function (require, exports, coupon) {
    "use strict";
    requirejs(['UI/CouponListItem', 'css!content/User/Coupon']);
    var PageModel = (function () {
        function PageModel(page) {
            this.queryArguments = {
                pageIndex: 0,
                status: 'available'
            };
            this.coupons = ko.observableArray();
            this.loading = ko.observable(false);
            this.firstLoad = undefined;
            this.status = ko.observable(this.queryArguments.status);
            this.page = page;
        }
        PageModel.prototype.loadAvailable = function (model) {
            model.queryArguments.status = 'available';
            model.queryArguments.pageIndex = 0;
            model.status(model.queryArguments.status);
            model.coupons.removeAll();
            return model.page.on_load({ loadType: chitu.PageLoadType.scroll });
        };
        PageModel.prototype.loadUsed = function (model) {
            model.queryArguments.status = 'used';
            model.queryArguments.pageIndex = 0;
            model.status(model.queryArguments.status);
            model.coupons.removeAll();
            return model.page.on_load({ loadType: chitu.PageLoadType.scroll });
        };
        PageModel.prototype.loadExprired = function (model) {
            model.queryArguments.status = 'exprired';
            model.queryArguments.pageIndex = 0;
            model.status(model.queryArguments.status);
            model.coupons.removeAll();
            return model.page.on_load({ loadType: chitu.PageLoadType.scroll });
        };
        return PageModel;
    }());
    var CouponPage = (function (_super) {
        __extends(CouponPage, _super);
        function CouponPage(html) {
            _super.call(this, html);
            this.model = new PageModel(this);
            this.load.add(this.page_load);
        }
        CouponPage.prototype.page_load = function (sender, args) {
            ko.applyBindings(sender.model, sender.element);
            sender.findControl('coupons').load.add(function () {
                sender.model.loading(true);
                var result = coupon.getMyCoupons(sender.model.queryArguments).done(function (data) {
                    $(data).each(function () {
                        sender.model.coupons.push(this);
                    });
                    sender.model.loading(false);
                    sender.model.queryArguments.pageIndex = sender.model.queryArguments.pageIndex + 1;
                });
                return result;
            });
        };
        return CouponPage;
    }(chitu.Page));
    return CouponPage;
});
