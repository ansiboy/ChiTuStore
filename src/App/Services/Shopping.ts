///<reference path='../../Scripts/typings/jquery.d.ts'/>
///<reference path='../../Scripts/typings/knockout.mapping.d.ts'/>
///<reference path='../../Scripts/typings/Site.d.ts'/>

import services = require('Services/Service');
import site = require('Site');
import mapping = require('knockout.mapping');

function translateOrder(source) {
    //source.OrderDate = services.fixJsonDates(source.OrderDate);
    var order = mapping.fromJS(source);
    var orderDetails = order.OrderDetails();
    order.OrderDetails = ko.observableArray();
    for (var i = 0; i < orderDetails.length; i++) {
        orderDetails[i].Amount = ko.computed(function () {
            return this.Price() * this.Quantity();
        }, orderDetails[i]);
        order.OrderDetails.push(orderDetails[i]);
    }

    order.ProductsAmount = ko.computed(function () {
        var amount = 0;
        for (var i = 0; i < orderDetails.length; i++) {
            amount = amount + orderDetails[i].Amount();
        }
        return amount;
    }, order);

    order.StatusText = ko.computed(function () {
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
                //
                return '';
        }
    }, order);

    order.ReceiptInfoId = ko.observable();
    order.ReceiptAddress.extend({ required: { message: '请填写收货信息' } });

    return order;
};

function translateProductData(data) {
    data.ImageUrls = (data.ImageUrl || '').split(',');
    data.ImageUrl = data.ImageUrls[0];

    var arr = [];
    var obj = JSON.parse(data.Arguments || '{}');
    for (var key in obj) {
        arr.push({ Name: key, Value: obj[key] });
    }

    data.Arguments = arr;//JSON.parse(data.Arguments || '{}');

    return data;
}

function translateComment(data) {
    data.Stars = new Array<string>();
    for (var i = 0; i < data.Score; i++) {
        data.Stars.push('*');
    }
    //data.ImageDatas = data.ImageDatas || '';
    //data.ImageThumbs = data.ImageThumbs || '';
    if (data.ImageDatas)
        data.ImageDatas = <string[]>(<string>data.ImageDatas).split(site.config.imageDataSpliter);
    else
        data.ImageDatas = [];

    if (data.ImageThumbs)
        data.ImageThumbs = <string[]>(<string>data.ImageThumbs).split(site.config.imageDataSpliter);
    else
        data.ImageThumbs = [];

    return data;
}

class ShoppingService {
    getCategories = (parentName: string = undefined): JQueryPromise<any> => {
        var result = services.callRemoteMethod('Product/GetCategories', { parentName: parentName });
        return result;
    }
    getCategory = (categoryId): JQueryPromise<any> => {
        var result = services.callRemoteMethod('Product/GetCategory', { categoryId: categoryId });
        return result;
    }
    getProductsByCategory = (categoryName): JQueryPromise<any> => {
        var result = services.callRemoteMethod('Product/GetProducts',
            { categoryName: categoryName });
        return result;
    }
    getProductsByBrand = (brand): JQueryPromise<any> => {
        var result = services.callMethod(services.config.serviceUrl, 'Product/GetProducts', { brand: brand });
        return result;
    }
    getProduct = (productId): JQueryPromise<any> => {
        var result = services.callMethod(services.config.serviceUrl, 'Product/GetProduct', { productId: productId })
            .then(translateProductData);
        return result;
    }
    getProducts = (args) => {
        var result = $.Deferred();
        services.callRemoteMethod('Product/GetProducts', args)
            .fail($.proxy(function (args) {
                this._result.reject(args);

            }, { _result: result }))
            .done($.proxy(function (args) {
                var products = args.Products;
                var filters = args.Filters;
                this._result.resolve(products, filters);


            }, { _result: result }));

        return result;
    }
    getProductIntroduce = (productId) => {
        return services.callMethod(services.config.serviceUrl, 'Product/GetProductIntroduce', { productId: productId });
    }
    findProductsByName = (name) => {
        var result = services.callRemoteMethod('Product/FindProducts', { name: name });
        return result;
    }
    createOrder = (productIds, quantities) => {
        /// <param name="productids" type="Array">所购买产品的编号</param>
        /// <param name="quantities" type="Array"></param>
        var result = services.callRemoteMethod('Order/CreateOrder', { productIds: productIds, quantities: quantities })
            .then(function (order) {
                return translateOrder(order);
            });
        return result;
    }
    getOrder = (orderId) => {
        /// <param name="orderId">订单编号</param>
        /// <returns type="models.order"/>
        var result = services.callRemoteMethod('Order/GetOrder', { orderId: orderId }).then(function (order) {
            return translateOrder(order);
        });
        return result;
    }
    confirmOrder = (args) => {//orderId, couponCode
        var result = services.callRemoteMethod('Order/ConfirmOrder', args);
        return result;
    }
    useCoupon = (orderId: string, couponCode: string) => {
        return services.callRemoteMethod('Order/UseCoupon', { orderId: orderId, couponCode: couponCode });
    }
    getMyOrders = (status, pageIndex, lastDateTime) => {
        /// <summary>获取当前登录用户的订单</summary>
        /// <param name="lastDateTime" type="Date"/>

        var filters = [];
        if (status) {
            //filter = 'it.Status=="' + status + '"';
            filters.push('Status=="' + status + '"');
        }

        if (lastDateTime) {
            var m = lastDateTime.getMilliseconds();
            var d = lastDateTime.toFormattedString('G') + '.' + m;

            filters.push('CreateDateTime < #' + d + '#');
        }

        var filter = filters.join(' && ');
        var args = { filter: filter, StartRowIndex: pageIndex * services.defaultPageSize, MaximumRows: services.defaultPageSize };
        var result = services.callRemoteMethod('Order/GetMyOrders', args)
            .then(function (orders) {
                for (var i = 0; i < orders.length; i++) {
                    orders[i] = translateOrder(orders[i]);
                }
                return orders;
            });

        return result;
    }
    getMyLastestOrders = (status, dateTime) => {
        /// <param name="dateTime" type="Date"/>
        var d;
        if (dateTime) {
            var m = dateTime.getMilliseconds();
            dateTime = dateTime.toFormattedString('G') + '.' + m;
        }
        return services.callRemoteMethod('Order/GetMyLastestOrders', { dateTime: d, status: status })
            .then(function (orders) {
                for (var i = 0; i < orders.length; i++) {
                    orders[i] = translateOrder(orders[i]);
                }
                return orders;
            });
    }
    getMyOrderList = (status, pageIndex, lastDateTime): JQueryPromise<Array<any>> => {
        var filters = [];
        //if (status) {
        //    filters.push('Status=="' + status + '"');
        //}

        //var filter = filters.join(' && ');
        var args = { status, StartRowIndex: pageIndex * services.defaultPageSize, MaximumRows: services.defaultPageSize };
        var result = services.callRemoteMethod('Order/GetMyOrderList', args)
            .then(function (orders) {
                //for (var i = 0; i < orders.length; i++) {
                //    orders[i] = translateOrder(orders[i]);
                //}
                return orders;
            });

        result.done($.proxy(function (orders) {
            this._result.loadCompleted = orders.length < services.defaultPageSize;
        }, { _result: result }));

        return result;
    }
    getBrands = (args) => {
        var result = services.callRemoteMethod('Product/GetBrands', args).then(function (data) {
            return data;
        });
        return result;
    }
    getBrand = (itemId: string): JQueryPromise<any> => {
        var result = services.callRemoteMethod('Product/GetBrand', { brandId: itemId });
        return result;
    }
    getShippingInfo = (orderId) => {
        var result = services.callRemoteMethod('Order/GetShippingInfo', { orderId: orderId });
        return result;
    }
    changeReceipt = (orderId, receiptId) => {

        var result = services.callRemoteMethod('Order/ChangeReceipt', { orderId: orderId, receiptId: receiptId });
        return result;
    }
    allowPurchase = (orderId) => {
        /// <returns type="jQuery.Deferred"/>

        var result = services.callRemoteMethod('Order/AllowPurchase', { orderId: orderId });
        return result;
    }
    getProductStock = (productId) => {
        /// <returns type="jQuery.Deferred"/>
        return services.callRemoteMethod('Stock/GetProductStock', { productId: productId });
    }
    balancePay = (orderId, amount) => {
        /// <returns type="jQuery.Deferred"/>
        return services.callRemoteMethod('Order/BalancePay', { orderId: orderId, amount: amount });
    }
    getProductCustomProperties = (productId: string): JQueryPromise<any> => {
        return services.callMethod(services.config.serviceUrl, 'Product/GetCustomProperties', { productId: productId });
    }
    getProductByNumberValues = (groupId, data): JQueryPromise<any> => {
        var d = $.extend({ groupId: groupId }, data);
        return services.callMethod(services.config.serviceUrl, 'Product/GetProductByNumberValues', d)
            .then(translateProductData);
    }
    getProductComments(productId: string, pageSize: number): JQueryPromise<Array<any>> {
        var data = { productId, pageSize };
        return services.callMethod(services.config.serviceUrl, 'Product/GetProductCommentList', data).then((datas) => {
            for (var i = 0; i < datas.length; i++) {
                datas[i] = translateComment(datas[i]);
            }
            return datas;
        });
    }
    favorProduct(productId: string, productName: string): JQueryPromise<any> {
        var data = { productId, productName };
        return services.callMethod(services.config.serviceUrl, 'Product/FavorProduct', data);
    }
    isFavored(productId: string): JQueryPromise<boolean> {
        if (!site.storage.token) {
            return $.Deferred<boolean>().resolve(false);
        }
        var data = { productId };
        return services.callMethod(services.config.serviceUrl, 'Product/IsFavored', data);
    }
    getFavorProducts(): LoadListPromise<any> {
        var result = <LoadListPromise<any>>services.callMethod(services.config.serviceUrl, 'Product/GetFavorProducts');
        return result;
    }
    unFavorProduct(productId: string) {
        return services.callMethod(services.config.serviceUrl, 'Product/UnFavorProduct', { productId });
    }
}

window['services']['shopping'] = window['services']['shopping'] || new ShoppingService();
export = <ShoppingService>window['services']['shopping'];