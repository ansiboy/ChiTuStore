define(["require", "exports", 'Services/Shopping', 'knockout.mapping', 'Services/Account'], function (require, exports, shopping, mapping, account) {
    requirejs(['css!content/Shopping/OrderDetail']);
    var Model = (function () {
        function Model(page) {
            var _this = this;
            this.order = null;
            this.expressCompany = ko.observable();
            this.expressBillNo = ko.observable();
            this.confirmReceived = function () {
                return account.confirmReceived(_this.order.Id()).done(function (data) {
                    _this.order.Status(data.Status);
                    mapping.fromJS(data, {}, _this.order);
                    _this.page.orderUpdated.fire(data);
                });
            };
            this.purchase = function () {
                return account.purchaseOrder(ko.unwrap(_this.order.Id), ko.unwrap(_this.order.Amount)).done(function () {
                    _this.page.orderUpdated.fire({ Status: 'Paid' });
                    _this.order.Status('Paid');
                });
            };
            this.cancelOrder = function () {
                var self = _this;
                return account.cancelOrder(_this.order.Id()).done(function (data) {
                    mapping.fromJS(data, {}, _this.order);
                    _this.page.orderUpdated.fire(data);
                });
            };
            this.back = function () {
                _this.page.hide();
            };
            this.page = page;
        }
        return Model;
    })();
    var OrderDetailPage = (function () {
        function OrderDetailPage(source) {
            this.orderUpdated = $.Callbacks();
            this.sorce = source;
        }
        OrderDetailPage.prototype.hide = function () {
            this.sorce.hide();
        };
        return OrderDetailPage;
    })();
    return function (page) {
        page.load.add(page_load);
        var model = new Model(new OrderDetailPage(page));
        function page_load(sender, args) {
            return shopping.getOrder(ko.unwrap(args.order.Id)).done(order_loaded);
        }
        function order_loaded(order) {
            if (model.order == null) {
                model.order = order;
                ko.applyBindings(model, page.node);
            }
            var js_data = mapping.toJS(order);
            mapping.fromJS(js_data, {}, model.order);
        }
    };
});
