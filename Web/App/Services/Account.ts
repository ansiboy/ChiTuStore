import ko = require('knockout');
import mapping = require('knockout.mapping');
import services = require('Services/Service');
import site = require('Site');

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

                return '';
        }
    }, order);

    order.ReceiptInfoId = ko.observable();
    order.ReceiptAddress.extend({ required: true });

    return order;
};

function translateReceipt(source) {
    var item = mapping.fromJS(source);
    item.Detail = ko.computed(function () {
        var result = this.ProvinceName() + ' ' +
            this.CityName() + ' ' +
            this.CountyName() + ' ' + this.Address();

        result = result + ' 联系人: ' + this.Consignee();
        result = result + ' 电话：'
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
            /// <param name="value" type="String"/>
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

class OrderInfo {
    notPaidCount = ko.observable(0)
    toReceiveCount = ko.observable(0)
    evaluateCount = ko.observable(2)
}

class AccountService {
    //======================================================
    // 说明：事件

    receiptInfoUpdated = $.Callbacks()
    receiptInfoInserted = $.Callbacks()
    //======================================================
    orderStatusChanged = (oldStatus: string, newStatus: string) => {
        //var status = ko.unwrap(order.Status);
        var old_count: KnockoutObservable<number>;
        var new_count: KnockoutObservable<number>;

        var get_counter = (status: string): KnockoutObservable<number>=> {
            var counter: KnockoutObservable<number>
            switch (status) {
                case 'WaitingForPayment':
                    counter = this.orderInfo.notPaidCount;
                    break;
                case 'Send':
                    counter = this.orderInfo.toReceiveCount
                    break;
                case 'Received':
                    counter = this.orderInfo.evaluateCount;
                    break;
            }
            return counter;
        }

        old_count = get_counter(oldStatus);
        new_count = get_counter(newStatus);
        if (old_count)
            old_count(old_count() - 1);

        if (new_count)
            new_count(new_count() + 1);

    }
    newReceiptInfo = () => {
        var result = services.callRemoteMethod('Address/NewReceiptInfo').then(function (item) {
            return translateReceipt(item);
        });
        return result;
        //return $.Deferred().resolve(new ReceiptInfo());
    }
    getReceiptInfo = (id) => {
        var result = services.callRemoteMethod('Address/GetReceiptInfo', { id: id });
        return result;
    }
    getReceiptInfos = () => {
        /// <returns type="jQuery.Deferred"/>

        var result = services.callRemoteMethod('Address/GetReceiptInfos', {}).then(function (items) {
            var result = [];
            for (var i = 0; i < items.length; i++) {
                result[i] = translateReceipt(items[i]);
            }
            //
            return result;
        });
        return result;
    }
    deleteReceiptInfo = (receiptInfoId) => {
        /// <summary>删除收件地址</summary>
        /// <param name="receiptInfoId" type="String"/>
        /// <returns type="jQuery.Deferred"/>
        var result = services.callRemoteMethod('Address/DeleteReceiptInfo', { receiptInfoId: receiptInfoId });
        return result;
    }
    saveReceiptInfo = (receiptInfo) => {
        /// <summary>保存用户的收货地址</summary>
        /// <param name="receiptInfo" type="models.receiptInfo"/>
        /// <returns type="jQuery.Deferred"/>

        var obj = mapping.toJS(receiptInfo);
        obj.RegionId = receiptInfo.CountyId();

        var self = this;
        var result = services.callMethod(site.config.serviceUrl, 'Address/SaveReceiptInfo', obj)
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
    }
    setDefaultReceipt = (receiptInfoId) => {
        /// <summary>设置默认收件地址</summary>
        /// <param name="receiptInfoId" type="String"/>
        /// <returns type="jQuery.Deferred"/>
        var result = services.callRemoteMethod('Address/SetDefaultReceiptInfo', { receiptInfoId: receiptInfoId });
        return result;
    }
    getCoupons = () => {
        /// <returns type="jQuery.Deferred"/>

        var args = {};
        var result = services.callRemoteMethod('Coupon/GetCoupons', args);

        return result;
    }
    getMyCoupons = () => {
        /// <returns type="jQuery.Deferred"/>

        var args = {};
        var result = services.callRemoteMethod('Coupon/GetMyCoupons', args);

        return result;
    }
    receiveCoupon = (coupon) => {
        /// <param name="coupon" type="models.coupon"/>
        var result = services.callRemoteMethod('Coupon/ReceiveCouponCode', { couponId: coupon.id() });
        return result;
    }
    useCoupon = (coupon) => {
        var args = { code: coupon.code() };
        var result = services.callRemoteMethod('Coupon/UseCouponCode', args);
        return result;
    }
    getProvinces = () => {
        /// <summary>获取省</summary>
        /// <returns type="jQuery.Deferred"/>
        var result = services.callRemoteMethod('Address/GetProvinces', {});
        return result;
    }
    getCities = (province) => {
        /// <summary>获取城市</summary>
        /// <param name="province" type="String"/>

        var guidRule = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (guidRule.test(province))
            return services.callRemoteMethod('Address/GetCities', { provinceId: province });

        return services.callRemoteMethod('Address/GetCities', { provinceName: province });;
    }
    getCounties = (city) => {
        /// <summary>获取县</summary>
        /// <returns type="jQuery.Deferred"/>
        var cityId;
        if (typeof city == 'string')
            cityId = city;
        else
            cityId = city.id();

        var result = services.callRemoteMethod('Address/GetCounties', { cityId: cityId });
        return result;
    }
    getMyOrders = (status, pageIndex) => {
        /// <summary>获取当前登录用户的订单</summary>
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
    }
    confirmReceived = (orderId: string): JQueryPromise<any>=> {
        /// <summary>确认已收到货</summary>
        /// <param name="orderId" type="String"/>
        var result = services.callMethod(site.config.serviceUrl, 'Order/ConfirmReceived', { orderId: orderId })
            .then((data) => {
                this.orderStatusChanged('Send', data.Status);
                return data;
            });
        return result;
    }
    cancelOrder = (orderId) => {
        /// <summary>取消订单</summary>
        /// <param name="orderId" type="String"/>
        /// <returns type="jQuery.Deferred"/>
        var result = services.callRemoteMethod('Order/CancelOrder', { orderId: orderId })
            .then((data) => {
                this.orderStatusChanged('WaitingForPayment', data.Status);
                return data;
            });
        return result;
    }
    purchaseOrder = (orderId: string, amount: number): JQueryPromise<any> => {
        var weixin = services['weixin'];
        var openid = weixin.openid();
        var notify_url = site.config.weixinServiceUrl + 'WeiXin/OrderPurchase/' + site.cookies.appToken();
        var out_trade_no = ko.unwrap(orderId).replace(/\-/g, '');
        return weixin.pay(openid, notify_url, out_trade_no, site.config.storeName, amount)
            .done(() => {
                this.orderStatusChanged('WaitingForPayment', 'Paid');
            });
        //.done(() => {
        //    //this.Status('Paid');
        //    if (this['order'])
        //        this['order'].Status('Paid');

        //    //window.location.href = '#Shopping_OrderList';
        //});
    }

    /// <summary>
    /// 评价晒单
    /// </summary>
    evaluateProduct = (orderDetailId: string, score: number, evaluation: string, anonymous: boolean, imageDatas: string, imageThumbs: string) => {
        var data = { orderDetailId, evaluation, imageDatas, score, imageThumbs, anonymous };
        var result = services.callMethod(site.config.serviceUrl, 'Product/EvaluateProduct', data).done(() => {
            var count = this.orderInfo.evaluateCount();
            this.orderInfo.evaluateCount(count - 1);
        })
        return result;
    }
    getSquareCode = () => {
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
    }
    sendChangePasswordVerifyCode = (mobile) => {
        //return $.ajax({
        //    url: '/VerifyCode/SendChangePassword',
        //    data: { mobile: mobile }
        //});
        return services.callRemoteMethod('VerifyCode/SendChangePassword', { mobile: mobile });
    }
    bind = (username, password) => {
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
    }
    getBalance = () => {
        return services.callMethod(site.config.accountServiceUrl, 'Account/GetAccount').then(function (data) {
            return (new Number(data.Balance)).valueOf();
        });
    }
    userInfo = () => {
        /// <returns type="jQuery.Deferred"/>
        return services.callRemoteMethod('User/GetUserInfo');
    }
    orderInfo = new OrderInfo()
    getToCommentProducts(): LoadListPromise<any> {
        var result: LoadListPromise<any> = <LoadListPromise<any>>services.callMethod(site.config.serviceUrl, 'Product/GetToCommentProducts')
            .done(() => {
                result.loadCompleted = true
            });
        return result;
    }
    getCommentedProducts(): LoadListPromise<any> {
        var result: LoadListPromise<any> = <LoadListPromise<any>>services.callMethod(site.config.serviceUrl, 'Product/GetCommentedProducts')
            .done(() => {
                result.loadCompleted = true
            });
        return result;
    }
    getScoreDetails(): LoadListPromise<any> {
        var result: LoadListPromise<any> = <LoadListPromise<any>>services.callMethod(site.config.accountServiceUrl, 'Account/GetScoreDetails')
            .done(() => {
                result.loadCompleted = true;
            });
        return result;
    }
    getBalanceDetails(): LoadListPromise<any> {
        var result: LoadListPromise<any> = <LoadListPromise<any>>services.callMethod(site.config.accountServiceUrl, 'Account/GetBalanceDetails')
            .done(() => {
                result.loadCompleted = true;
            });
        return result;
    }
}


module models {
    class user {
        userName = ko.observable('');
        nickName = ko.observable('');
        realName = ko.observable('');
        gender = ko.observable('Male');
        email = ko.observable('');
        password = ko.observable('');
        score = ko.observable(0);
        mobile = ko.observable();
        openid = ko.observable();
    }

    class ReceiptInfo {
        Address = ko.observable();
        CityId = ko.observable();
        CityName = ko.observable();
        Consignee = ko.observable();
        CountyId = ko.observable();
        CountyName = ko.observable();
        Detail = ko.observable();
        FullAddress = ko.observable();
        Id = ko.observable();
        IsDefault = ko.observable();
        Mobile = ko.observable();
        Name = ko.observable();
        Phone = ko.observable();
        PhoneNumber = ko.observable();
        PostalCode = ko.observable();
        ProvinceId = ko.observable();
        ProvinceName = ko.observable();
    }
}


export = <AccountService>(services['account'] = services['account'] || new AccountService());

