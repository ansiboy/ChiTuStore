define(["require", "exports", 'Services/Service', 'Services/Auth', 'Site', 'knockout'], function (require, exports, services, auth, site, ko) {
    var ShoppingCartInfo = (function () {
        function ShoppingCartInfo() {
            this.itemsCount = ko.observable(0);
        }
        return ShoppingCartInfo;
    })();
    var ShoppingCartService = (function () {
        function ShoppingCartService() {
            var _this = this;
            this.itemAdded = $.Callbacks();
            this.itemRemoved = $.Callbacks();
            this.itemUpdated = $.Callbacks();
            this._getItemsResult = null;
            this._items = [];
            this.info = new ShoppingCartInfo();
            this.processData = function (data) {
                for (var i = 0; i < data.length; i++) {
                    var obj = JSON.parse(data[i].Remark || '{}');
                    $.extend(data[i], { Type: "" }, obj);
                }
                return data;
            };
            this.getItem = function (productId) {
                /// <param name="productId">产品编号</param>
                /// <returns type="jQuery.Deferred"/>
                var result = $.Deferred();
                for (var i = 0; i < _this._items.length; i++) {
                    if (ko.unwrap(_this._items[i].ProductId) == productId) {
                        return result.resolve(_this._items[i]);
                    }
                }
                return result.reject();
            };
            this.addItem = function (product, count) {
                /// <param name="product" type="models.product">
                /// 添加到购物车的产品
                /// </param>
                /// <param name="count" type="Number">
                /// 产品的数量
                /// </param>
                /// <returns type="jQuery.Deferred"/>
                var self = _this;
                var productId = ko.unwrap(product.Id);
                var result = services.callRemoteMethod('ShoppingCart/AddItem', { productId: productId, count: count })
                    .then(function (data) {
                    _this.itemAdded.fire();
                    return _this.processData(data);
                });
                result.done(function () { return _this.upateProductsCount(); });
                return result;
            };
            this.updateItem = function (item) {
                /// <summary>
                /// 更新购物车产品的数量
                /// </summary>
                /// <param name="item">
                /// 购物车中的项
                /// </param>
                /// <returns type="jQuery.Deferred"/>
                var self = _this;
                var productId = ko.unwrap(item.ProductId);
                var count = ko.unwrap(item.Count);
                var selected = ko.unwrap(item.Selected);
                var result = services.callRemoteMethod('ShoppingCart/UpdateItem', { productId: productId, count: count, selected: selected })
                    .then(function (data) {
                    _this.itemUpdated.fire();
                    return _this.processData(data);
                });
                result.done(function () { return _this.upateProductsCount(); });
                return result;
            };
            this.removeItems = function (productIds) {
                debugger;
                var self = _this;
                var result = services.callMethod(site.config.serviceUrl, 'ShoppingCart/RemoveItems', { productIds: productIds })
                    .then(function (data) { return _this.processData(data); });
                result.done(function () { return _this.upateProductsCount(); });
                return result;
            };
            this.getItems = function () {
                /// <summary>
                /// 获取购物车中的产品
                if (_this._getItemsResult)
                    return _this._getItemsResult;
                var self = _this;
                _this._getItemsResult = services.callRemoteMethod('ShoppingCart/GetItems', {})
                    .then(function (data) {
                    return _this.processData(data);
                });
                _this._getItemsResult.always(function () {
                    self._getItemsResult = null;
                });
                return _this._getItemsResult;
            };
            this.getProductsCount = function () {
                /// <summary>
                /// 获取购物车中产品的总数
                /// </summary>
                return services.callMethod(site.config.serviceUrl, 'ShoppingCart/GetProductsCount');
            };
            this.selectAll = function () {
                return services.callMethod(site.config.serviceUrl, 'ShoppingCart/SelectAll')
                    .then(function (data) { return _this.processData(data); });
            };
            this.unselectAll = function () {
                return services.callMethod(site.config.serviceUrl, 'ShoppingCart/UnselectAll')
                    .then(function (data) { return _this.processData(data); });
            };
            auth.whenLogin(function () { return _this.upateProductsCount(); });
        }
        ShoppingCartService.prototype.upateProductsCount = function () {
            var _this = this;
            this.getProductsCount().done(function (value) {
                _this.info.itemsCount(value);
            });
        };
        return ShoppingCartService;
    })();
    var shoppingCart = window['services']['shoppingCart'] = (window['services']['shoppingCart'] || new ShoppingCartService());
    return shoppingCart;
});
