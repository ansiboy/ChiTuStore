import app = require('Application')
import recharge = require('Services/Recharge')
import services = require('Services/Service')
import ko_val = require('knockout.validation');
import site = require('Site');

requirejs(['css!content/User/Recharge']);

class Model {
    amount = ko.observable<number>().extend({
        required: { message: '请输入充值金额' },
        number: true
    })
    recharge = (): JQueryPromise<any> => {
        if (!this['isValid']()) {
            validation.showAllMessages();
            return
        }

        return recharge.createRechargeRecord(this.amount()).done(function (args) {
            var openid = services['weixin'].openid();

            var notify_url = services.config.weixinServiceUrl + 'WeiXin/RechargePurchase/' + site.cookies.appToken();
            var out_trade_no = args.Id.replace(/\-/g, '');
            return services['weixin'].pay(openid, notify_url, out_trade_no, site.config.storeName, args.Amount).done(function () {
                app.back();
            });

        });
    }
}

var model = new Model();
var validation = ko_val.group(model);

export = function (page: chitu.Page) {
    //c.scrollLoad(page);
    page.viewChanged.add(() => ko.applyBindings(model, page.node()));
}

