define(["require", "exports", 'knockout', 'knockout.mapping', 'Services/Service', 'Site'], function (require, exports, ko, mapping, services, site) {
    "use strict";
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
        order.ReceiptAddress.extend({ required: true });
        return order;
    }
    ;
    function translateReceipt(source) {
        var item = mapping.fromJS(source);
        item.Detail = ko.computed(function () {
            var result = this.ProvinceName() + ' ' +
                this.CityName() + ' ' +
                this.CountyName() + ' ' + this.Address();
            result = result + ' 联系人: ' + this.Consignee();
            result = result + ' 电话：';
            if (this.Phone() != null && this.Mobile() != null)
                result = result + this.Phone() + ', ' + this.Mobile();
            else
                result = result + (this.Phone() || this.Mobile());
            return result;
        }, item);
        item.Name.extend({ required: true });
        item.ProvinceId.extend({
            required: {
                onlyIf: $.proxy(function () {
                    return this.Name();
                }, item)
            }
        });
        item.CityId.extend({
            required: {
                onlyIf: $.proxy(function () {
                    return this.ProvinceId();
                }, item)
            }
        });
        item.CountyId.extend({
            required: {
                onlyIf: $.proxy(function () {
                    return this.CityId();
                }, item)
            }
        });
        item.AreaCode = ko.observable();
        item.PhoneNumber = ko.observable();
        item.BranchNumber = ko.observable();
        item.AreaCode.extend({
            required: {
                onlyIf: $.proxy(function () {
                    return this.PhoneNumber();
                }, item)
            }
        });
        item.PhoneNumber.extend({
            required: {
                onlyIf: $.proxy(function () {
                    return this.AreaCode();
                }, item)
            }
        });
        item.Phone = ko.computed({
            read: function () {
                var phone = '';
                var areaCode = $.trim(this.AreaCode());
                var phoneNumber = $.trim(this.PhoneNumber());
                var branchNumber = $.trim(this.BranchNumber());
                if (areaCode != '' && phoneNumber != '')
                    phone = areaCode + '-' + phoneNumber;
                if (phone != '' && branchNumber != '')
                    phone = phone + '-' + branchNumber;
                return phone == '' ? null : phone;
            },
            write: function (value) {
                if (value == null || value == '')
                    return;
                var arr = value.split('-');
                this.AreaCode(arr[0]);
                this.PhoneNumber(arr[1]);
                this.BranchNumber(arr[2]);
            }
        }, item);
        item.Address.extend({ required: true });
        item.Consignee.extend({ required: true });
        item.Mobile.extend({ required: true });
        item.Phone(source.Phone);
        return item;
    }
    var OrderInfo = (function () {
        function OrderInfo() {
            this.notPaidCount = ko.observable(0);
            this.toReceiveCount = ko.observable(0);
            this.evaluateCount = ko.observable(2);
        }
        return OrderInfo;
    }());
    var AccountService = (function () {
        function AccountService() {
            var _this = this;
            this.receiptInfoUpdated = $.Callbacks();
            this.receiptInfoInserted = $.Callbacks();
            this.orderStatusChanged = function (oldStatus, newStatus) {
                var old_count;
                var new_count;
                var get_counter = function (status) {
                    var counter;
                    switch (status) {
                        case 'WaitingForPayment':
                            counter = _this.orderInfo.notPaidCount;
                            break;
                        case 'Send':
                            counter = _this.orderInfo.toReceiveCount;
                            break;
                        case 'Received':
                            counter = _this.orderInfo.evaluateCount;
                            break;
                    }
                    return counter;
                };
                old_count = get_counter(oldStatus);
                new_count = get_counter(newStatus);
                if (old_count)
                    old_count(old_count() - 1);
                if (new_count)
                    new_count(new_count() + 1);
            };
            this.newReceiptInfo = function () {
                var result = services.callRemoteMethod('Address/NewReceiptInfo').then(function (item) {
                    return translateReceipt(item);
                });
                return result;
            };
            this.getReceiptInfo = function (id) {
                var result = services.callRemoteMethod('Address/GetReceiptInfo', { id: id });
                return result;
            };
            this.getReceiptInfos = function () {
                var result = services.callRemoteMethod('Address/GetReceiptInfos', {}).then(function (items) {
                    var result = [];
                    for (var i = 0; i < items.length; i++) {
                        result[i] = translateReceipt(items[i]);
                    }
                    return result;
                });
                return result;
            };
            this.saveReceiptInfo = function (receiptInfo) {
                var obj = mapping.toJS(receiptInfo);
                obj.RegionId = receiptInfo.CountyId();
                var self = _this;
                var result = services.callMethod(services.config.serviceUrl, 'Address/SaveReceiptInfo', obj)
                    .done(function (data) {
                    receiptInfo.Id(data.Id);
                    receiptInfo.IsDefault(data.IsDefault);
                    if (receiptInfo.Id()) {
                        self.receiptInfoUpdated.fire(receiptInfo);
                    }
                    else {
                        self.receiptInfoInserted.fire(receiptInfo);
                    }
                });
                return result;
            };
            this.getMyCoupons = function () {
                var args = {};
                var result = services.callRemoteMethod('Coupon/GetMyCoupons', args);
                return result;
            };
            this.receiveCoupon = function (coupon) {
                var result = services.callRemoteMethod('Coupon/ReceiveCouponCode', { couponId: coupon.id() });
                return result;
            };
            this.useCoupon = function (coupon) {
                var args = { code: coupon.code() };
                var result = services.callRemoteMethod('Coupon/UseCouponCode', args);
                return result;
            };
            this.getCounties = function (city) {
                var cityId;
                if (typeof city == 'string')
                    cityId = city;
                else
                    cityId = city.id();
                var result = services.callRemoteMethod('Address/GetCounties', { cityId: cityId });
                return result;
            };
            this.getMyOrders = function (status, pageIndex) {
                var filter;
                if (status) {
                    filter = 'it.Status=="' + status + '"';
                }
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
            this.confirmReceived = function (orderId) {
                var result = services.callMethod(services.config.serviceUrl, 'Order/ConfirmReceived', { orderId: orderId })
                    .then(function (data) {
                    _this.orderStatusChanged('Send', data.Status);
                    return data;
                });
                return result;
            };
            this.cancelOrder = function (orderId) {
                var result = services.callRemoteMethod('Order/CancelOrder', { orderId: orderId })
                    .then(function (data) {
                    _this.orderStatusChanged('WaitingForPayment', data.Status);
                    return data;
                });
                return result;
            };
            this.purchaseOrder = function (orderId, amount) {
                var weixin = services['weixin'];
                var openid = weixin.openid();
                var notify_url = services.config.weixinServiceUrl + 'WeiXin/OrderPurchase/' + services.config.appToken;
                var out_trade_no = ko.unwrap(orderId).replace(/\-/g, '');
                return weixin.pay(openid, notify_url, out_trade_no, site.config.storeName, amount)
                    .done(function () {
                    _this.orderStatusChanged('WaitingForPayment', 'Paid');
                });
            };
            this.getSquareCode = function () {
                var deferred = $.Deferred();
                services.callRemoteMethod('ShouTao/SquareCodeTicket').done(function (args) {
                    var url;
                    if (args.ticket == '' || args.ticket == null)
                        url = '/Images/code_no.jpg';
                    else
                        url = 'https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=' + args.ticket;
                    deferred.resolve(url);
                }).fail(function () {
                    deferred.reject();
                });
                return deferred;
            };
            this.sendChangePasswordVerifyCode = function (mobile) {
                return services.callRemoteMethod('VerifyCode/SendChangePassword', { mobile: mobile });
            };
            this.bind = function (username, password) {
                return $.ajax({
                    url: '/User/Bind',
                    data: { username: username, password: password }
                }).done(function (result) {
                    if (result.Code == 'Success') {
                        alert('绑定成功');
                    }
                    else {
                        alert(result.Message);
                    }
                });
            };
            this.getBalance = function () {
                return services.callMethod(services.config.accountServiceUrl, 'Account/GetAccount').then(function (data) {
                    return (new Number(data.Balance)).valueOf();
                });
            };
            this.userInfo = function () {
                return services.callRemoteMethod('User/GetUserInfo');
            };
            this.orderInfo = new OrderInfo();
        }
        AccountService.prototype.deleteReceiptInfo = function (receiptInfoId) {
            var result = services.callRemoteMethod('Address/DeleteReceiptInfo', { receiptInfoId: receiptInfoId });
            return result;
        };
        AccountService.prototype.setDefaultReceipt = function (receiptInfoId) {
            var result = services.callRemoteMethod('Address/SetDefaultReceiptInfo', { receiptInfoId: receiptInfoId });
            return result;
        };
        AccountService.prototype.getProvinces = function () {
            var result = services.callRemoteMethod('Address/GetProvinces', {});
            return result;
        };
        AccountService.prototype.getCities = function (province) {
            var guidRule = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (guidRule.test(province))
                return services.callRemoteMethod('Address/GetCities', { provinceId: province });
            return services.callRemoteMethod('Address/GetCities', { provinceName: province });
            ;
        };
        AccountService.prototype.evaluateProduct = function (orderDetailId, score, evaluation, anonymous, imageDatas, imageThumbs) {
            var _this = this;
            var data = { orderDetailId: orderDetailId, evaluation: evaluation, imageDatas: imageDatas, score: score, imageThumbs: imageThumbs, anonymous: anonymous };
            var result = services.callMethod(services.config.serviceUrl, 'Product/EvaluateProduct', data).done(function () {
                var count = _this.orderInfo.evaluateCount();
                _this.orderInfo.evaluateCount(count - 1);
            });
            return result;
        };
        AccountService.prototype.getToCommentProducts = function () {
            var result = services.callMethod(services.config.serviceUrl, 'Product/GetToCommentProducts')
                .done(function () {
                result.loadCompleted = true;
            });
            return result;
        };
        AccountService.prototype.getCommentedProducts = function () {
            var result = services.callMethod(services.config.serviceUrl, 'Product/GetCommentedProducts')
                .done(function () {
                result.loadCompleted = true;
            });
            return result;
        };
        AccountService.prototype.getScoreDetails = function () {
            var result = services.callMethod(services.config.accountServiceUrl, 'Account/GetScoreDetails')
                .done(function () {
                result.loadCompleted = true;
            });
            return result;
        };
        AccountService.prototype.getBalanceDetails = function () {
            var result = services.callMethod(services.config.accountServiceUrl, 'Account/GetBalanceDetails')
                .done(function () {
                result.loadCompleted = true;
            });
            return result;
        };
        return AccountService;
    }());
    var models;
    (function (models) {
        var user = (function () {
            function user() {
                this.userName = ko.observable('');
                this.nickName = ko.observable('');
                this.realName = ko.observable('');
                this.gender = ko.observable('Male');
                this.email = ko.observable('');
                this.password = ko.observable('');
                this.score = ko.observable(0);
                this.mobile = ko.observable();
                this.openid = ko.observable();
            }
            return user;
        }());
        var ReceiptInfo = (function () {
            function ReceiptInfo() {
                this.Address = ko.observable();
                this.CityId = ko.observable();
                this.CityName = ko.observable();
                this.Consignee = ko.observable();
                this.CountyId = ko.observable();
                this.CountyName = ko.observable();
                this.Detail = ko.observable();
                this.FullAddress = ko.observable();
                this.Id = ko.observable();
                this.IsDefault = ko.observable();
                this.Mobile = ko.observable();
                this.Name = ko.observable();
                this.Phone = ko.observable();
                this.PhoneNumber = ko.observable();
                this.PostalCode = ko.observable();
                this.ProvinceId = ko.observable();
                this.ProvinceName = ko.observable();
            }
            return ReceiptInfo;
        }());
    })(models || (models = {}));
    return (services['account'] = services['account'] || new AccountService());
});
