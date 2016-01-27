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
    return function (page) {
        /// <param name="page" type="chitu.Page"/>
        var pageIndex = 0;
        var topbar = page['topbar'];
        if (topbar) {
            var div = document.createElement('div');
            $(topbar.element).append('<a name="btn_recharge" class="rightButton" href="#User_Recharge" style="padding-top:4px;">充值</a>');
        }
        var model = {
            rechargeRecords: ko.observableArray(),
            back: function () {
                app.back().fail(function () {
                    app.redirect('User_Index');
                });
            },
            recharge: function () {
                window.location.href = '#User_Recharge';
            },
            firstLoad: undefined
        };
        page.viewChanged.add(function () { return ko.applyBindings(model, page.node()); });
        page.load.add(function () {
            return account.getBalanceDetails().done(function (records) {
                pageIndex = pageIndex + 1;
                for (var i = 0; i < records.length; i++) {
                    extendItem(records[i]);
                    model.rechargeRecords.push(records[i]);
                }
            }).done(function (items) {
            });
        });
    };
});
