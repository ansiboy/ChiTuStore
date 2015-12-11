var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'Core/Page', 'Services/Shopping', 'knockout.mapping', 'Services/Account', 'Services/Service'], function (require, exports, Page, shopping, mapping, account, services) {
    var weixin = services['weixin'];
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
                return weixin.purchaseOrder(ko.unwrap(_this.order.Id), ko.unwrap(_this.order.Amount)).done(function () {
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
    var OrderDetailPage = (function (_super) {
        __extends(OrderDetailPage, _super);
        function OrderDetailPage(element) {
            var _this = this;
            _super.call(this, element);
            this.model = new Model(this);
            this.orderUpdated = $.Callbacks();
            this.page_load = function (sender, args) {
                var deferred = $.Deferred();
                window.setTimeout(function () { return deferred.resolve(); }, 400);
                return $.when(shopping.getOrder(ko.unwrap(args.order.Id))
                    .then(function (data) {
                    mapping.fromJS(data, {}, args.order);
                    return args.order;
                })
                    .done(_this.order_loaded), deferred);
            };
            this.order_loaded = function (order) {
                if (_this.model.order == null) {
                    _this.model.order = order;
                    ko.applyBindings(_this.model, _this.element);
                }
                else {
                    var js_data = mapping.toJS(order);
                    mapping.fromJS(js_data, {}, _this.model.order);
                }
            };
            this.load.add(this.page_load);
            requirejs(['text!Module/Shopping/OrderDetail.html'], function (html) {
                _this.content.element.innerHTML = html;
                var q = _this.content.element.querySelector('[ch-part="header"]');
                if (q)
                    _this.header.element.appendChild(q);
                q = _this.content.element.querySelector('[ch-part="footer"]');
                if (q)
                    _this.footer.element.appendChild(q);
            });
        }
        return OrderDetailPage;
    })(Page);
    return function () {
        var element = document.createElement('div');
        document.body.appendChild(element);
        var od = new OrderDetailPage(element);
        return od;
    };
});
