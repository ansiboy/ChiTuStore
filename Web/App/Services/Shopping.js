define(["require", "exports", 'Services/Service', 'Site', 'knockout.mapping'], function (require, exports, services, site, mapping) {
    function translateOrder(source) {
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
                    return '已完成';
                case 'Received':
                    return '已收货';
                default:
                    return '';
            }
        }, order);
        order.ReceiptInfoId = ko.observable();
        order.ReceiptAddress.extend({ required: { message: '请填写收货信息' } });
        return order;
    }
    ;
    function translateProductData(data) {
        data.ImageUrls = (data.ImageUrl || '').split(',');
        data.ImageUrl = data.ImageUrls[0];
        var arr = [];
        var obj = JSON.parse(data.Arguments || '{}');
        for (var key in obj) {
            arr.push({ Name: key, Value: obj[key] });
        }
        data.Arguments = arr;
        return data;
    }
    function translateComment(data) {
        data.Stars = new Array();
        for (var i = 0; i < data.Score; i++) {
            data.Stars.push('*');
        }
        if (data.ImageDatas)
            data.ImageDatas = data.ImageDatas.split(site.config.imageDataSpliter);
        else
            data.ImageDatas = [];
        if (data.ImageThumbs)
            data.ImageThumbs = data.ImageThumbs.split(site.config.imageDataSpliter);
        else
            data.ImageThumbs = [];
        return data;
    }
    var ShoppingService = (function () {
        function ShoppingService() {
            this.getCategories = function (parentName) {
                if (parentName === void 0) { parentName = undefined; }
                var result = services.callRemoteMethod('Product/GetCategories', { parentName: parentName });
                return result;
            };
            this.getCategory = function (categoryId) {
                var result = services.callRemoteMethod('Product/GetCategory', { categoryId: categoryId });
                return result;
            };
            this.getProductsByCategory = function (categoryName) {
                var result = services.callRemoteMethod('Product/GetProducts', { categoryName: categoryName });
                return result;
            };
            this.getProductsByBrand = function (brand) {
                var result = services.callMethod(site.config.serviceUrl, 'Product/GetProducts', { brand: brand });
                return result;
            };
            this.getProduct = function (productId) {
                var result = services.callMethod(site.config.serviceUrl, 'Product/GetProduct', { productId: productId })
                    .then(translateProductData);
                return result;
            };
            this.getProducts = function (args) {
                var result = $.Deferred();
                services.callRemoteMethod('Product/GetProducts', args).then($.proxy(function (args) {
                    this._result.loadCompleted = args.Products.length < site.config.pageSize;
                    return args;
                }, { _result: result }))
                    .fail($.proxy(function (args) {
                    this._result.reject(args);
                }, { _result: result }))
                    .done($.proxy(function (args) {
                    var products = args.Products;
                    var filters = args.Filters;
                    this._result.resolve(products, filters);
                }, { _result: result }));
                return result;
            };
            this.getProductIntroduce = function (productId) {
                return services.callMethod(site.config.serviceUrl, 'Product/GetProductIntroduce', { productId: productId });
            };
            this.findProductsByName = function (name) {
                var result = services.callRemoteMethod('Product/FindProducts', { name: name });
                return result;
            };
            this.createOrder = function (productIds, quantities) {
                var result = services.callRemoteMethod('Order/CreateOrder', { productIds: productIds, quantities: quantities })
                    .then(function (order) {
                    return translateOrder(order);
                });
                return result;
            };
            this.getOrder = function (orderId) {
                var result = services.callRemoteMethod('Order/GetOrder', { orderId: orderId }).then(function (order) {
                    debugger;
                    return translateOrder(order);
                });
                return result;
            };
            this.confirmOrder = function (args) {
                var result = services.callRemoteMethod('Order/ConfirmOrder', args);
                return result;
            };
            this.useCoupon = function (orderId, couponCode) {
                return services.callRemoteMethod('Order/UseCoupon', { orderId: orderId, couponCode: couponCode });
            };
            this.getMyOrders = function (status, pageIndex, lastDateTime) {
                /// <summary>获取当前登录用户的订单</summary>
                /// <param name="lastDateTime" type="Date"/>
                var filters = [];
                if (status) {
                    filters.push('Status=="' + status + '"');
                }
                if (lastDateTime) {
                    var m = lastDateTime.getMilliseconds();
                    var d = lastDateTime.toFormattedString('G') + '.' + m;
                    filters.push('CreateDateTime < #' + d + '#');
                }
                var filter = filters.join(' && ');
                var args = { filter: filter, StartRowIndex: pageIndex * site.config.pageSize, MaximumRows: site.config.pageSize };
                var result = services.callRemoteMethod('Order/GetMyOrders', args)
                    .then(function (orders) {
                    for (var i = 0; i < orders.length; i++) {
                        orders[i] = translateOrder(orders[i]);
                    }
                    return orders;
                });
                result.done($.proxy(function (orders) {
                    this._result.loadCompleted = orders.length < site.config.pageSize;
                }, { _result: result }));
                return result;
            };
            this.getMyLastestOrders = function (status, dateTime) {
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
            };
            this.getMyOrderList = function (status, pageIndex, lastDateTime) {
                var filters = [];
                var args = { status: status, StartRowIndex: pageIndex * site.config.pageSize, MaximumRows: site.config.pageSize };
                var result = services.callRemoteMethod('Order/GetMyOrderList', args)
                    .then(function (orders) {
                    return orders;
                });
                result.done($.proxy(function (orders) {
                    this._result.loadCompleted = orders.length < site.config.pageSize;
                }, { _result: result }));
                return result;
            };
            this.getBrands = function (args) {
                var result = services.callRemoteMethod('Product/GetBrands', args).then(function (data) {
                    return data;
                });
                return result;
            };
            this.getBrand = function (itemId) {
                var result = services.callRemoteMethod('Product/GetBrand', { brandId: itemId });
                return result;
            };
            this.getShippingInfo = function (orderId) {
                var result = services.callRemoteMethod('Order/GetShippingInfo', { orderId: orderId });
                return result;
            };
            this.changeReceipt = function (orderId, receiptId) {
                var result = services.callRemoteMethod('Order/ChangeReceipt', { orderId: orderId, receiptId: receiptId });
                return result;
            };
            this.allowPurchase = function (orderId) {
                /// <returns type="jQuery.Deferred"/>
                var result = services.callRemoteMethod('Order/AllowPurchase', { orderId: orderId });
                return result;
            };
            this.getProductStock = function (productId) {
                return services.callRemoteMethod('Stock/GetProductStock', { productId: productId });
            };
            this.balancePay = function (orderId, amount) {
                return services.callRemoteMethod('Order/BalancePay', { orderId: orderId, amount: amount });
            };
            this.getProductCustomProperties = function (productId) {
                return services.callMethod(site.config.serviceUrl, 'Product/GetCustomProperties', { productId: productId });
            };
            this.getProductByNumberValues = function (groupId, data) {
                var d = $.extend({ groupId: groupId }, data);
                return services.callMethod(site.config.serviceUrl, 'Product/GetProductByNumberValues', d)
                    .then(translateProductData);
            };
        }
        ShoppingService.prototype.getProductComments = function (productId, pageSize) {
            var data = { productId: productId, pageSize: pageSize };
            return services.callMethod(site.config.serviceUrl, 'Product/GetProductCommentList', data).then(function (datas) {
                for (var i = 0; i < datas.length; i++) {
                    datas[i] = translateComment(datas[i]);
                }
                return datas;
            });
        };
        ShoppingService.prototype.favorProduct = function (productId, productName) {
            var data = { productId: productId, productName: productName };
            return services.callMethod(site.config.serviceUrl, 'Product/FavorProduct', data);
        };
        ShoppingService.prototype.isFavored = function (productId) {
            if (!site.cookies.token()) {
                return $.Deferred().resolve(false);
            }
            var data = { productId: productId };
            return services.callMethod(site.config.serviceUrl, 'Product/IsFavored', data);
        };
        ShoppingService.prototype.getFavorProducts = function () {
            var result = services.callMethod(site.config.serviceUrl, 'Product/GetFavorProducts');
            result.done(function (data) { return result.loadCompleted = data.length < site.config.pageSize; });
            return result;
        };
        ShoppingService.prototype.unFavorProduct = function (productId) {
            return services.callMethod(site.config.serviceUrl, 'Product/UnFavorProduct', { productId: productId });
        };
        return ShoppingService;
    })();
    window['services']['shopping'] = window['services']['shopping'] || new ShoppingService();
    return window['services']['shopping'];
});
