var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Application', 'Services/Recharge', 'Services/Service', 'knockout.validation', 'Site'], function (require, exports, app, recharge, services, ko_val, site) {
    requirejs(['css!content/User/Recharge']);
    var Model = (function () {
        function Model() {
            var _this = this;
            this.amount = ko.observable().extend({
                required: { message: '请输入充值金额' },
                number: true
            });
            this.alipay = function (tradeNo) {
                var result = $.Deferred();
                window.alipay.pay({
                    tradeNo: tradeNo,
                    subject: "测试标题",
                    body: "我是测试内容",
                    price: 0.01,
                    notifyUrl: "http://your.server.notify.url"
                }, function (successResults) {
                    result.resolve();
                }, function (errorResults) {
                    alert(errorResults.memo);
                    result.reject();
                });
                return result;
            };
            this.recharge = function () {
                if (!_this['isValid']()) {
                    validation.showAllMessages();
                    return;
                }
                var self = _this;
                return recharge.createRechargeRecord(_this.amount()).done(function (args) {
                    var out_trade_no = args.Id.replace(/\-/g, '');
                    if (site.env.isWeiXin) {
                        var openid = services['weixin'].openid();
                        var notify_url = services.config.weixinServiceUrl + 'WeiXin/RechargePurchase/' + services.config.appToken;
                        return services['weixin'].pay(openid, notify_url, out_trade_no, site.config.storeName, args.Amount).done(function () {
                            app.back();
                        });
                    }
                    else {
                        return self.alipay(out_trade_no);
                    }
                });
            };
        }
        return Model;
    })();
    var model = new Model();
    var validation = ko_val.group(model);
    var RechargePage = (function (_super) {
        __extends(RechargePage, _super);
        function RechargePage(html) {
            var _this = this;
            _super.call(this, html);
            this.load.add(function () { return ko.applyBindings(model, _this.element); });
        }
        return RechargePage;
    })(chitu.Page);
});
