define(["require", "exports", 'Services/Account', 'Application', 'Services/Shopping', 'Services/ShoppingCart', 'Services/Coupon', 'knockout.validation', 'knockout.mapping', 'Module/Shopping/OrderProduct/Coupons'], function (require, exports, account, app, shopping, shoppingCart, coupon, ko_val, mapping, AvalibleCoupons) {
    "use strict";
    requirejs(['css!content/Shopping/OrderProducts'], function () { });
    var avalibleCoupons = new AvalibleCoupons();
    var Model = (function () {
        function Model(page) {
            var _this = this;
            this.order = null;
            this.orderSummary = ko.observable();
            this.balance = ko.observable();
            this.useBalancePay = ko.observable();
            this.coupons = ko.observableArray();
            this.couponTitle = ko.observable();
            this.confirmOrder = function () {
                var validation = ko_val.group(_this.order);
                if (!_this.order.isValid()) {
                    validation.showAllMessages();
                    return $.Deferred().reject();
                }
                var order = _this.order;
                var data = {
                    orderId: order.Id(),
                    remark: $(_this._page.element).find('[name="remark"]').val(),
                    invoice: order.Invoice(),
                    address: order.ReceiptAddress(),
                    regionId: order.ReceiptRegionId()
                };
                return shopping.confirmOrder(data).pipe(function () {
                    var productIds = [];
                    var orderDetails = _this.order.OrderDetails();
                    for (var i = 0; i < orderDetails.length; i++) {
                        productIds.push(orderDetails[i].ProductId());
                    }
                    return shoppingCart.removeItems(productIds);
                })
                    .done(function () {
                    debugger;
                    window.location['skip'];
                    window.location.href = '#User_Index';
                    if (ko.unwrap(order.actualPaid) > 0) {
                        window.location.href = '#Shopping_Purchase_' + ko.unwrap(_this.order.Id);
                    }
                    else {
                        window.location.href = '#Shopping_OrderList';
                    }
                });
            };
            this.showInvoice = function () {
                return app.redirect('#Shopping_Invoice', { order: _this.order });
            };
            this.showReceipts = function () {
                return app.redirect('#User_ReceiptList', { order: _this.order });
            };
            this.showCoupons = function () {
                return avalibleCoupons.open(ko.unwrap(_this.order.Id));
            };
            this._page = page;
        }
        return Model;
    }());
    return function (page) {
        var validation;
        var model = new Model(page);
        avalibleCoupons.couponCodeSelected = function (coupon) {
            shopping.useCoupon(ko.unwrap(model.order.Id), coupon.Code).done(function (data) {
                debugger;
                mapping.fromJS(data, {}, model.order);
            });
        };
        var orderId;
        page.load.add(function (sender, args) {
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
    };
});
