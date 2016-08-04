import account = require('services/Account');
import app = require('Application');
import site = require('Site');
import shopping = require('services/Shopping');
import shoppingCart = require('services/ShoppingCart');
import coupon = require('services/Coupon');

import ko_val = require('knockout.validation');
import mapping = require('knockout.mapping');
import AvalibleCoupons = require('modules/Shopping/OrderProduct/Coupons');

requirejs(['css!content/Shopping/OrderProducts'], function () { });
var avalibleCoupons = new AvalibleCoupons();

class Order {
    private _userBalance: number;
    private BalanceAmount: KnockoutObservable<number>; //= ko.observable<number>();
    private Sum: KnockoutObservable<number>;
    private total: KnockoutComputed<number>;
    private balance: KnockoutComputed<number>;
    private isBalancePay: KnockoutComputed<boolean>;

    actualPaid: KnockoutComputed<number>;

    Id: KnockoutObservable<string>;
    Invoice: KnockoutObservable<string>;
    ReceiptAddress: KnockoutObservable<string>;
    ReceiptRegionId: KnockoutObservable<string>;
    OrderDetails: KnockoutObservableArray<{ ProductId: KnockoutObservable<string> }>;

    isValid: () => boolean;

    constructor(userBalance, source: any) {
        this._userBalance = userBalance;
        for (var key in source) {
            this[key] = source[key];
        }

        this.total = ko.computed(() => {
            var total = ko.unwrap(this.Sum);
            return total;
        }, this);

        this.balance = ko.computed(() => {
            var balanceAmount = ko.unwrap(this.BalanceAmount) || 0;
            if (balanceAmount)
                return balanceAmount;

            var sum = ko.unwrap(this.Sum);
            if (this._userBalance > sum) {
                return sum;
            }

            return this._userBalance;
        }, this);

        this.isBalancePay = ko.pureComputed({
            read: function () {
                if (ko.unwrap(this.BalanceAmount))
                    return true;

                return false;
            },
            write: function (value) {
                if (value) {
                    var balanceAmount = this.balance();
                    return shopping.balancePay(ko.unwrap(this.model.order.Id), balanceAmount).done(function (data) {
                        mapping.fromJS(data, {}, this.model.order);
                    });
                }

                return shopping.balancePay(ko.unwrap(this.model.order.Id), 0).done(function (data) {
                    mapping.fromJS(data, {}, this.model.order);
                });

            }
        }, this);

        this.actualPaid = ko.computed(function () {
            return this.Sum() - this.BalanceAmount();
        }, this);
    }
}

class Model {
    private _page: chitu.Page;

    order: Order;

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
        return app.redirect('#Shopping_Invoice', { order: this.order });
    }
    showReceipts = () => {
        return app.redirect('#User_ReceiptList', { order: this.order });
    }
    showCoupons = () => {
        return avalibleCoupons.open(ko.unwrap(this.order.Id));
        //return app.redirect('Shopping_AvailableCoupons', { coupons: ko.unwrap(model.coupons), parentModel: model })
    }

}

class OrderProductsPage extends chitu.Page {
    private validation;
    private model: Model;// = new Model(page);
    private orderId;

    constructor(params) {
        super(params);
        this.model = new Model(this);

        avalibleCoupons.couponCodeSelected = (coupon) => {
            shopping.useCoupon(ko.unwrap(this.model.order.Id), coupon.Code).done((data) => {
                debugger;
                mapping.fromJS(data, {}, this.model.order);
            });
        }

        var orderId;
        this.load.add(this.page_load);
    }

    private page_load(sender: OrderProductsPage, args) {
        if (this.orderId == args.id)
            return;

        this.orderId = args.id;
        return $.when(account.getBalance(), shopping.getOrder(args.id), coupon.getAvailableCoupons(args.id))
            .done((balance, order, coupons) => {
                if (order == null) {
                    return app.showPage('Shopping_ShoppingCart', {});
                }

                this.model.orderSummary(ko.unwrap(order.Sum));
                this.model.balance(balance);
                this.model.coupons(coupons);

                if (coupons.length > 0) {
                    this.model.couponTitle(chitu.Utility.format('{0}可用张优惠', coupons.length));
                }

                // order.total = ko.computed(function () {
                //     var total = ko.unwrap(this.Sum);
                //     return total;
                // }, order);

                // order.balance = ko.computed(function () {
                //     var balanceAmount = ko.unwrap(this.BalanceAmount) || 0;
                //     if (balanceAmount)
                //         return balanceAmount;

                //     var sum = ko.unwrap(this.Sum);
                //     if (balance > sum) {
                //         return sum;
                //     }

                //     return balance;
                // }, order);

                // order.isBalancePay = ko.pureComputed({
                //     read: function () {
                //         if (ko.unwrap(this.BalanceAmount))
                //             return true;

                //         return false;
                //     },
                //     write: function (value) {
                //         if (value) {
                //             var balanceAmount = this.balance();
                //             return shopping.balancePay(ko.unwrap(this.model.order.Id), balanceAmount).done(function (data) {
                //                 mapping.fromJS(data, {}, this.model.order);
                //             });
                //         }

                //         return shopping.balancePay(ko.unwrap(this.model.order.Id), 0).done(function (data) {
                //             mapping.fromJS(data, {}, this.model.order);
                //         });

                //     }
                // }, order);

                // order.actualPaid = ko.computed(function () {
                //     return order.Sum() - order.BalanceAmount();
                // });

                //if (this.model.order == null) {
                this.model.order = $.extend(order, new Order(balance, order));
                ko.applyBindings(this.model, sender.element);
                // }
                // else {
                //     for (var key in order) {
                //         if (ko.isWriteableObservable(order[key])) {
                //             var value = order[key]();
                //             sender.model.order[key](value);
                //         }
                //     }
                // }
            });
    }
}

export = OrderProductsPage;

// export = function (page) {
//     /// <param name="page" type="chitu.Page"/>

//     var validation;
//     var model = new Model(page);

//     avalibleCoupons.couponCodeSelected = (coupon) => {
//         shopping.useCoupon(ko.unwrap(model.order.Id), coupon.Code).done((data) => {
//             debugger;
//             mapping.fromJS(data, {}, model.order);
//         });
//     }

//     var orderId;
//     page.load.add(function (sender, args) {
//         /// <param name="sender" type="chitu.Page"/>

//         if (orderId == args.id)
//             return;

//         orderId = args.id;
//         return $.when(account.getBalance(), shopping.getOrder(args.id), coupon.getAvailableCoupons(args.id))
//             .done(function (balance, order, coupons) {
//                 if (order == null) {
//                     return app.showPage('Shopping_ShoppingCart', {});
//                 }

//                 model.orderSummary(ko.unwrap(order.Sum));
//                 model.balance(balance);
//                 model.coupons(coupons);

//                 if (coupons.length > 0) {
//                     model.couponTitle(chitu.Utility.format('{0}可用张优惠', coupons.length));
//                 }

//                 order.total = ko.computed(function () {
//                     var total = ko.unwrap(this.Sum);
//                     return total;
//                 }, order);

//                 order.balance = ko.computed(function () {
//                     var balanceAmount = ko.unwrap(this.BalanceAmount) || 0;
//                     if (balanceAmount)
//                         return balanceAmount;

//                     var sum = ko.unwrap(this.Sum);
//                     if (balance > sum) {
//                         return sum;
//                     }

//                     return balance;
//                 }, order);

//                 order.isBalancePay = ko.pureComputed({
//                     read: function () {
//                         if (ko.unwrap(this.BalanceAmount))
//                             return true;

//                         return false;
//                     },
//                     write: function (value) {
//                         if (value) {
//                             var balanceAmount = this.balance();
//                             return shopping.balancePay(ko.unwrap(model.order.Id), balanceAmount).done(function (data) {
//                                 mapping.fromJS(data, {}, model.order);
//                             });
//                         }

//                         return shopping.balancePay(ko.unwrap(model.order.Id), 0).done(function (data) {
//                             mapping.fromJS(data, {}, model.order);
//                         });

//                     }
//                 }, order);

//                 order.actualPaid = ko.computed(function () {
//                     return order.Sum() - order.BalanceAmount();
//                 });

//                 if (model.order == null) {
//                     model.order = order;
//                     ko.applyBindings(model, page.element);
//                 }
//                 else {
//                     for (var key in order) {
//                         if (ko.isWriteableObservable(order[key])) {
//                             var value = order[key]();
//                             model.order[key](value);
//                         }
//                     }
//                 }
//             });
//     });

// }