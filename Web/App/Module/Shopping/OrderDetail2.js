define(["require", "exports", 'ui/ScrollLoad', 'Application', 'Services/Account', 'Services/Shopping', 'Services/Service'], function (require, exports, c, app, account, shopping, services) {
    var weixin = services['weixin'];
    var Model = (function () {
        function Model() {
            var _this = this;
            this.Id = ko.observable();
            this.Serial = ko.observable();
            this.Sum = ko.observable();
            this.ReceiptAddress = ko.observable();
            this.Invoice = ko.observable();
            this.OrderDate = ko.observable();
            this.Remark = ko.observable();
            this.Status = ko.observable();
            this.Freight = ko.observable();
            this.OrderDetails = ko.observableArray();
            this.expressCompany = ko.observable();
            this.expressBillNo = ko.observable();
            this.back = function () {
                app.back({}).fail(function () {
                    app.redirect('Shopping_OrderList');
                });
            };
            this.confirmReceived = function () {
                return account.confirmReceived(_this.Id()).done(function (data) {
                    this.Status(data.Status);
                    if (this.order)
                        ko.mapping.fromJS(data, {}, this.order);
                });
            };
            this.StatusText = ko.computed(function () {
                var status = _this.Status();
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
                        return '已完成';
                    case 'Received':
                        return '已收货';
                    default:
                        return '';
                }
            }, this);
            this.purchase = function () {
                //window.location = '#Shopping_Purchase_' + ko.unwrap(this.Id) //chitu.Utility.format(site.config.purchaseUrlFormat, this.Id());
                //var openid = weixin.openid();
                //var notify_url = site.config.weixinServiceUrl + 'WeiXin/OrderPurchase/' + site.cookies.token();
                //var out_trade_no = ko.unwrap(this.Id).replace(/\-/g, '');
                //return weixin.pay(openid, notify_url, out_trade_no, site.config.storeName, ko.unwrap(this.Sum)).done(() => {
                //    this.Status('Paid');
                //    if (this['order'])
                //        this['order'].Status('Paid');
                return weixin.purchaseOrder(_this.Id, ko.unwrap(_this.Sum)).done(function () {
                    _this.Status('Paid');
                    if (_this['order'])
                        _this['order'].Status('Paid');
                });
            };
            this.cancelOrder = function () {
                var self = _this;
                return account.cancelOrder(_this.Id()).done(function (data) {
                    _this.Status(data.Status);
                    debugger;
                    if (_this['order'])
                        ko.mapping.fromJS(data, {}, _this['order']);
                });
            };
        }
        return Model;
    })();
    return function (page) {
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
        });
        ko.applyBindings(model, page.node());
    };
});
