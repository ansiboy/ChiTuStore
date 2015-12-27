import services = require('Services/Service');
import auth = require('Services/Auth');
import site = require('Site');
import ko = require('knockout');

class ShoppingCartInfo {
    itemsCount = ko.observable(0)
}

class ShoppingCartService {
    itemAdded = $.Callbacks()
    itemRemoved = $.Callbacks()
    itemUpdated = $.Callbacks()
    _getItemsResult = null
    _items = []

    info = new ShoppingCartInfo()

    constructor() {
        //debugger;
        auth.whenLogin(() => this.upateProductsCount());
    }

    private upateProductsCount() {
        this.getProductsCount().done((value) => {
            //debugger;
            this.info.itemsCount(value);
        });
    }

    private processData = (data: Array<any>) => {
        for (var i = 0; i < data.length; i++) {
            var obj = JSON.parse(data[i].Remark || '{}');
            $.extend(data[i], { Type: "" }, obj);
        }
        return data;
    }
    getItem = (productId): JQueryPromise<any> => {
        /// <param name="productId">产品编号</param>
        /// <returns type="jQuery.Deferred"/>

        var result = $.Deferred();
        for (var i = 0; i < this._items.length; i++) {
            if (ko.unwrap(this._items[i].ProductId) == productId) {
                return result.resolve(this._items[i]);
            }
        }
        return result.reject();
    }
    addItem = (product, count): JQueryPromise<any>=> {
        /// <param name="product" type="models.product">
        /// 添加到购物车的产品
        /// </param>
        /// <param name="count" type="Number">
        /// 产品的数量
        /// </param>
        /// <returns type="jQuery.Deferred"/>

        var self = this;
        var productId = ko.unwrap(product.Id);

        var result = services.callRemoteMethod('ShoppingCart/AddItem', { productId: productId, count: count })
            .then((data: Array<any>) => {
                this.itemAdded.fire();
                return this.processData(data);
            });

        result.done(() => this.upateProductsCount());

        return result;
    }

    updateItem = (item): JQueryPromise<any> => {
        /// <summary>
        /// 更新购物车产品的数量
        /// </summary>
        /// <param name="item">
        /// 购物车中的项
        /// </param>
        /// <returns type="jQuery.Deferred"/>

        var self = this;
        var productId = ko.unwrap(item.ProductId);
        var count = ko.unwrap(item.Count);
        var selected = ko.unwrap(item.Selected);
        var result = services.callRemoteMethod('ShoppingCart/UpdateItem', { productId: productId, count: count, selected: selected })
            .then((data: Array<any>) => {
                this.itemUpdated.fire();
                return this.processData(data);
            });

        result.done(() => this.upateProductsCount());
        return result;
    }

    removeItems = (productIds: string[]): JQueryPromise<any> => {
        /// <summary>
        /// 移除购物车中的多个产品
        /// </summary>
        /// <param name="productIds" type="Array">
        /// 要移除产品的编号
        /// </param>
        debugger;
        var self = this;
        var result = services.callMethod(services.config.serviceUrl, 'ShoppingCart/RemoveItems', { productIds: productIds })
            .then((data) => this.processData(data));

        result.done(() => this.upateProductsCount());

        return result;
    }
    getItems = (): JQueryPromise<any> => {
        /// <summary>
        /// 获取购物车中的产品
  
        if (this._getItemsResult)
            return this._getItemsResult;

        var self = this;
        this._getItemsResult = services.callRemoteMethod('ShoppingCart/GetItems', {})
            .then((data: Array<any>) => {
                return this.processData(data);
            });

        this._getItemsResult.always(function () {
            self._getItemsResult = null;
        });
        return this._getItemsResult;
    }
    getProductsCount = (): JQueryPromise<number> => {
        /// <summary>
        /// 获取购物车中产品的总数
        /// </summary>

        return services.callMethod(services.config.serviceUrl, 'ShoppingCart/GetProductsCount');
    }

    selectAll = (): JQueryPromise<any> => {
        return services.callMethod(services.config.serviceUrl, 'ShoppingCart/SelectAll')
            .then((data) => this.processData(data));
    }
    unselectAll = (): JQueryPromise<any> => {
        return services.callMethod(services.config.serviceUrl, 'ShoppingCart/UnselectAll')
            .then((data) => this.processData(data));
    }
}



var shoppingCart: ShoppingCartService = window['services']['shoppingCart'] = (window['services']['shoppingCart'] || new ShoppingCartService());
export = shoppingCart;

