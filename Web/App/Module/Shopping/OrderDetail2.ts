import c = require('ui/ScrollLoad');
import app = require('Application');
import account = require('Services/Account');
import shopping = require('Services/Shopping');
import site = require('Site');

//==================================================
// 说明：不能直接引入 Services/WeiXin 因为环境不一定是微信
import services = require('Services/Service');
var weixin = services['weixin'];
//==================================================

class Model {
    Id = ko.observable<string>()
    Serial = ko.observable()
    Sum = ko.observable()
    ReceiptAddress = ko.observable()
    Invoice = ko.observable()
    OrderDate = ko.observable()
    Remark = ko.observable()
    Status = ko.observable()
    Freight = ko.observable()
    OrderDetails = ko.observableArray()
    expressCompany = ko.observable()
    expressBillNo = ko.observable()
    back = () => {
        app.back({}).fail(() => {
            app.redirect('Shopping_OrderList');
        });
    }
    confirmReceived = () => {
        return account.confirmReceived(this.Id()).done(function (data) {
            this.Status(data.Status);
            if (this.order)
                ko.mapping.fromJS(data, {}, this.order);
        });
    }

    StatusText = ko.computed(() => {
        var status = this.Status();
        switch (status) {
            case 'WaitingForPayment':
                return '待付款';
            case 'Paid':
                return '已付款';
            case 'Send':
                return '已发货';
            case 'Canceled':
                return '已取消';
            case 'Finish':
                return '已完成'
            case 'Received':
                return '已收货';
            default:
                return '';
        }
    }, this)

    purchase = () => {
        //window.location = '#Shopping_Purchase_' + ko.unwrap(this.Id) //chitu.Utility.format(site.config.purchaseUrlFormat, this.Id());
        //var openid = weixin.openid();
        //var notify_url = site.config.weixinServiceUrl + 'WeiXin/OrderPurchase/' + site.cookies.token();
        //var out_trade_no = ko.unwrap(this.Id).replace(/\-/g, '');
        //return weixin.pay(openid, notify_url, out_trade_no, site.config.storeName, ko.unwrap(this.Sum)).done(() => {
        //    this.Status('Paid');
        //    if (this['order'])
        //        this['order'].Status('Paid');

        //    //window.location.href = '#Shopping_OrderList';
        //});
        return weixin.purchaseOrder(this.Id, ko.unwrap(this.Sum)).done(() => {
            this.Status('Paid');
            if (this['order'])
                this['order'].Status('Paid');
        })
    }

    cancelOrder = () => {
        var self = this;
        return account.cancelOrder(this.Id()).done((data) => {
            this.Status(data.Status);
            //model.order.Status(data.Status);
            debugger;
            if (this['order'])
                ko.mapping.fromJS(data, {}, this['order']);
        });
    }
}

export = function (page) {
    /// <param name="page" type="chitu.Page"/>
    c.scrollLoad(page);
    var model = new Model();



    page.load.add(function (sender, args) {
        model['order'] = args.order;
        shopping.getShippingInfo(args.id).done(function (obj) {
            model.expressCompany(obj.ExpressCompany);
            model.expressBillNo(obj.ExpressBillNo);
        });

        return shopping.getOrder(args.id).done(function (order) {
            model.OrderDetails.removeAll();
            for (var key in order) {
                if (model[key] && ko.isWriteableObservable(model[key])) {
                    model[key](order[key]());
                }
            }
        });
    })

    ko.applyBindings(model, page.node());

} 

