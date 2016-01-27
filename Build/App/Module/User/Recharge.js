/// <reference path='../../../Scripts/typings/knockout.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.validation.d.ts' />
define(["require", "exports", 'Application', 'Services/Recharge', 'Services/Service', 'knockout.validation', 'Site'], function (require, exports, app, recharge, services, ko_val, site) {
    requirejs(['css!content/User/Recharge']);
    var Model = (function () {
        function Model() {
            var _this = this;
            this.amount = ko.observable().extend({
                required: { message: '请输入充值金额' },
                number: true
            });
            this.recharge = function () {
                if (!_this['isValid']()) {
                    validation.showAllMessages();
                    return;
                }
                return recharge.createRechargeRecord(_this.amount()).done(function (args) {
                    var openid = services['weixin'].openid();
                    var notify_url = services.config.weixinServiceUrl + 'WeiXin/RechargePurchase/' + services.config.appToken;
                    var out_trade_no = args.Id.replace(/\-/g, '');
                    return services['weixin'].pay(openid, notify_url, out_trade_no, site.config.storeName, args.Amount).done(function () {
                        app.back();
                    });
                });
            };
        }
        return Model;
    })();
    var model = new Model();
    var validation = ko_val.group(model);
    return function (page) {
        page.viewChanged.add(function () { return ko.applyBindings(model, page.node()); });
    };
});
