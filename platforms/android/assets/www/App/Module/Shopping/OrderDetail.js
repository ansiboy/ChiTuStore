var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Services/Shopping', 'knockout.mapping', 'Services/Account'], function (require, exports, shopping, mapping, account) {
    "use strict";
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
    }());
    var OrderDetailPage = (function (_super) {
        __extends(OrderDetailPage, _super);
        function OrderDetailPage(html) {
            _super.call(this, html);
            this.orderUpdated = $.Callbacks();
            this.model = new Model(this);
            this.load.add(this.page_load);
        }
        OrderDetailPage.prototype.page_load = function (sender, args) {
            var _this = this;
            return shopping.getOrder(ko.unwrap(args.order.Id))
                .done(function (order) { return _this.order_loaded(order); });
        };
        OrderDetailPage.prototype.order_loaded = function (order) {
            if (this.model.order == null) {
                this.model.order = order;
                ko.applyBindings(this.model, this.element);
            }
            var js_data = mapping.toJS(order);
            mapping.fromJS(js_data, {}, this.model.order);
        };
        return OrderDetailPage;
    }(chitu.Page));
});
