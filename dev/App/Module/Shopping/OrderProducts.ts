/// <reference path='../../../Scripts/typings/require.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.d.ts' />
/// <reference path='../../../Scripts/typings/knockout.validation.d.ts' />

import account = require('Services/Account');
import app = require('Application');
import site = require('Site');
import shopping = require('Services/Shopping');
import shoppingCart = require('Services/ShoppingCart');
import coupon = require('Services/Coupon');

import ko_val = require('knockout.validation');
import mapping = require('knockout.mapping');
import AvalibleCoupons = require('Module/Shopping/OrderProduct/Coupons');

requirejs(['css!content/Shopping/OrderProducts'], function () { });
var avalibleCoupons = new AvalibleCoupons();

class Model {
    private _page: chitu.Page;

    order = null

    orderSummary = ko.observable()
    balance = ko.observable()
    useBalancePay = ko.observable()
    coupons = ko.observableArray()
    couponTitle = ko.observable()



    constructor(page: chitu.Page) {
        this._page = page;
    }

    confirmOrder = () => {
        //model.order.ReceiptAddress.extend({ required: { message: '请填写收货信息' } });
        var validation = ko_val.group(this.order);
        if (!this.order.isValid()) {
            validation.showAllMessages();
            return $.Deferred().reject();
        }

        var order = this.order;
        //var regionId = model.receiptRegionId();
        var data = {
            orderId: order.Id(),
            remark: $(this._page.element).find('[name="remark"]').val(), //order.Remark(),
            invoice: order.Invoice(),
            address: order.ReceiptAddress(),
            regionId: order.ReceiptRegionId()
        };

        return shopping.confirmOrder(data).pipe(() => {
            var productIds = [];
            var orderDetails = this.order.OrderDetails();
            for (var i = 0; i < orderDetails.length; i++) {
                productIds.push(orderDetails[i].ProductId());
            }
            return shoppingCart.removeItems(productIds);
        })
            .done(() => {
                debugger;
                //===============================================
                // 进入后订单列表，按返回键可以进入到个人中心
                window.location['skip']
                window.location.href = '#User_Index';
                //================================================

                if (ko.unwrap(order.actualPaid) > 0) {
                    window.location.href = '#Shopping_Purchase_' + ko.unwrap(this.order.Id);
                }
                else {
                    window.location.href = '#Shopping_OrderList';
                }
            });
    }
    showInvoice = () => {
        return app.redirect('Shopping_Invoice', { order: this.order });
    }
    showReceipts = () => {
        return app.redirect('User_ReceiptList', { order: this.order });
    }
    showCoupons = () => {
        return avalibleCoupons.open(ko.unwrap(this.order.Id));
        //return app.redirect('Shopping_AvailableCoupons', { coupons: ko.unwrap(model.coupons), parentModel: model })
    }

}

export = function (page) {
    /// <param name="page" type="chitu.Page"/>

    var validation;
    var model = new Model(page);

    avalibleCoupons.couponCodeSelected = (coupon) => {
        shopping.useCoupon(ko.unwrap(model.order.Id), coupon.Code).done((data) => {
            debugger;
            mapping.fromJS(data, {}, model.order);
        });
    }

    var orderId;
    page.load.add(function (sender, args) {
        /// <param name="sender" type="chitu.Page"/>

        if (orderId == args.id)
            return;

        orderId = args.id;
        return $.when(account.getBalance(), shopping.getOrder(args.id), coupon.getAvailableCoupons(args.id))
            .done(function (balance, order, coupons) {
                if (order == null) {
                    return app.showPage('Shopping_ShoppingCart', {});
                }

                model.orderSummary(ko.unwrap(order.Sum));
                model.balance(balance);
                model.coupons(coupons);

                if (coupons.length > 0) {
                    model.couponTitle(chitu.Utility.format('{0}可用张优惠', coupons.length));
                }

                order.total = ko.computed(function () {
                    var total = ko.unwrap(this.Sum);
                    return total;
                }, order);

                order.balance = ko.computed(function () {
                    var balanceAmount = ko.unwrap(this.BalanceAmount) || 0;
                    if (balanceAmount)
                        return balanceAmount;

                    var sum = ko.unwrap(this.Sum);
                    if (balance > sum) {
                        return sum;
                    }

                    return balance;
                }, order);

                order.isBalancePay = ko.pureComputed({
                    read: function () {
                        if (ko.unwrap(this.BalanceAmount))
                            return true;

                        return false;
                    },
                    write: function (value) {
                        if (value) {
                            var balanceAmount = this.balance();
                            return shopping.balancePay(ko.unwrap(model.order.Id), balanceAmount).done(function (data) {
                                mapping.fromJS(data, {}, model.order);
                            });
                        }

                        return shopping.balancePay(ko.unwrap(model.order.Id), 0).done(function (data) {
                            mapping.fromJS(data, {}, model.order);
                        });

                    }
                }, order);

                order.actualPaid = ko.computed(function () {
                    return order.Sum() - order.BalanceAmount();
                });

                if (model.order == null) {
                    model.order = order;
                    ko.applyBindings(model, page.element);
                }
                else {
                    for (var key in order) {
                        if (ko.isWriteableObservable(order[key])) {
                            var value = order[key]();
                            model.order[key](value);
                        }
                    }
                }
            });
    });

}