var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'Application', 'Services/Account'], function (require, exports, app, account) {
    requirejs(['css!content/User/RechargeList']);
    function extendItem(item) {
        item.TypeText = ko.computed(function () {
            switch (item.Type) {
                case 'OrderPurchase':
                    return '购物消费';
                case 'OrderCancel':
                    return '订单退款';
                case 'OnlineRecharge':
                    return '线上充值';
                case 'StoreRecharge':
                    return '门店充值';
            }
            return item.Type;
        });
        if (item.Score > 0) {
            item.Score = '+' + item.Score;
        }
    }
    var RechargeListPage = (function (_super) {
        __extends(RechargeListPage, _super);
        function RechargeListPage(html) {
            _super.call(this, html);
            this.pageIndex = 0;
            this.model = {
                rechargeRecords: ko.observableArray(),
                back: function () {
                    app.back().fail(function () {
                        app.redirect('#User_Index');
                    });
                },
                recharge: function () {
                    window.location.href = '#User_Recharge';
                },
                firstLoad: undefined
            };
            this.load.add(this.page_load);
        }
        RechargeListPage.prototype.page_load = function (sender, args) {
            ko.applyBindings(sender.model, sender.element);
            sender.findControl('recharge').load.add(function () {
                return account.getBalanceDetails().done(function (records) {
                    sender.pageIndex = sender.pageIndex + 1;
                    for (var i = 0; i < records.length; i++) {
                        extendItem(records[i]);
                        sender.model.rechargeRecords.push(records[i]);
                    }
                }).done(function (items) {
                });
            });
        };
        return RechargeListPage;
    })(chitu.Page);
    return RechargeListPage;
});
