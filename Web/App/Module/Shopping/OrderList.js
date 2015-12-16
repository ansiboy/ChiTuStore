define(["require", "exports", 'Services/Account', 'Services/Shopping', 'Application', 'knockout.mapping', 'Site', 'Services/Service'], function (require, exports, account, shopping, app, mapping, site, services) {
    var weixin = services['weixin'];
    requirejs(['css!content/Shopping/OrderList']);
    var page_args = { loadType: chitu.PageLoadType.scroll };
    var Model = (function () {
        function Model(page) {
            var _this = this;
            this.lastDateTime = null;
            this.pageIndex = 0;
            this.status = ko.observable('');
            this.orders = ko.observableArray();
            this.confirmReceived = function (item, event) {
                debugger;
                return account.confirmReceived(ko.unwrap(item.Id)).done(function (data) {
                    mapping.fromJS(data, {}, item);
                });
            };
            this.pay = function (item, event) {
                debugger;
                return account.purchaseOrder(ko.unwrap(item.Id), ko.unwrap(item.Sum)).done(function (data) {
                });
            };
            this.cancelOrder = function (item) {
                return account.cancelOrder(item.Id()).done(function (data) {
                    item.Status(data.Status);
                });
            };
            this.loadOrders = function () {
                $($(_this.page.node())).find('a').removeClass('active');
                if (_this.status())
                    $(_this.page.node()).find('.tabs').find('[name="' + _this.status() + '"]').addClass('active');
                else {
                    $(_this.page.node()).find('.tabs').find('a').first().addClass('active');
                }
                _this.isLoading(true);
                return shopping.getMyOrderList(_this.status(), _this.pageIndex, _this.lastDateTime).done(function (orders) {
                    for (var i = 0; i < orders.length; i++) {
                        orders[i] = mapping.fromJS(orders[i]);
                    }
                    if (_this.pageIndex == 0 && orders.length > 0) {
                        _this.lastDateTime = ko.unwrap(orders[0].CreateDateTime);
                    }
                    _this.pageIndex = _this.pageIndex + 1;
                    _this.isLoading(false);
                    for (var i = 0; i < orders.length; i++) {
                        _this.orders.push(orders[i]);
                    }
                    if (_this.page['iscroller']) {
                        _this.page['iscroller'].refresh();
                    }
                });
            };
            this.loadOrdersByStatus = function (order_status) {
                return function (item, event) {
                    _this.status(order_status);
                    _this.pageIndex = 0;
                    _this.lastDateTime = null;
                    _this.orders.removeAll();
                    return _this.page.on_load(page_args);
                };
            };
            this.isLoading = ko.observable(false);
            this.showOrder = function (item) {
                app.redirect('Shopping_OrderDetail', { order: item });
            };
            this.showProduct = function (item) {
                debugger;
                var productId = ko.unwrap(item.ProductId);
                if (!productId) {
                    productId = ko.unwrap(item.OrderDetails()[0].ProductId);
                }
                return app.redirect('Home_Product_' + productId);
            };
            this.page = page;
            this.page.closed.add(function () {
            });
            try {
            }
            catch (e) {
                debugger;
            }
        }
        return Model;
    })();
    return function (page) {
        page.load.add(function (sender, args) {
            model.status(args.status || '');
            return model.loadOrders().done(function (items) { return items.length < site.config.pageSize; });
        });
        var model = new Model(page);
        page.viewChanged.add(function () { return ko.applyBindings(model, page.node()); });
    };
});
