
import app = require('Application')
import recharge = require('services/Recharge')
import services = require('services/Service')
import ko_val = require('knockout.validation');
import site = require('Site');

class Model {
    amount = ko.observable<number>().extend({
        required: { message: '请输入充值金额' },
        number: true
    })
    alipay = (tradeNo: string): JQueryPromise<any> => {
        var result = $.Deferred();

        (<any>window).alipay.pay({
            tradeNo: tradeNo,//tradeNo,
            subject: "测试标题",
            body: "我是测试内容",
            price: 0.01,
            notifyUrl: "http://your.server.notify.url"
        },
            function (successResults) {
                result.resolve();
            },
            function (errorResults) {
                alert(errorResults.memo);
                result.reject();
            });

        return result;
    }
    recharge = (): JQueryPromise<any> => {
        if (!this['isValid']()) {
            validation.showAllMessages();
            return
        }

        var self = this;
        return recharge.createRechargeRecord(this.amount()).done(function (args) {
            var out_trade_no = args.Id.replace(/\-/g, '');

            if (site.env.isWeiXin) {
                var openid = services['weixin'].openid();

                var notify_url = services.config.weixinServiceUrl + 'WeiXin/RechargePurchase/' + services.config.appId;

                return services['weixin'].pay(openid, notify_url, out_trade_no, site.config.storeName, args.Amount).done(function () {
                    app.back();
                });
            }
            else {
                return self.alipay(out_trade_no);
            }

        });
    }
}

var model = new Model();
var validation = ko_val.group(model);

// export = function(page: chitu.Page) {
//     page.viewChanged.add(() => ko.applyBindings(model, page.element));
// }
class RechargePage extends chitu.Page {
    constructor(html) {
        super(html);
        this.load.add(() => ko.applyBindings(model, this.element));
    }
}
