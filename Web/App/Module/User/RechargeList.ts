import app = require('Application');

import services = require('Services/Service');
import TopBar = require('UI/TopBar');
import account = require('Services/Account');


requirejs(['css!content/User/RechargeList']);

function extendItem(item) {
    item.TypeText = ko.computed<string>(() => {
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
        return <string>item.Type;
    })

    if (item.Score > 0) {
        item.Score = '+' + item.Score;
    }
}

export =function (page: chitu.Page) {
    /// <param name="page" type="chitu.Page"/>

    var pageIndex = 0
    var topbar: TopBar = page['topbar'];
    if (topbar) {
        var div = document.createElement('div');
        //div.className = 'pull-right';
        //div.innerHTML = '<a class="btn btn-small" >充值</a>';
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
    }

    page.viewChanged.add(() => ko.applyBindings(model, page.node()));

    page.load.add(() => {
        return account.getBalanceDetails().done(function (records) {
            pageIndex = pageIndex + 1;
            for (var i = 0; i < records.length; i++) {
                //records[i].StatusText = ko.computed(function () {
                //    var status = this.Status;
                //    switch (status) {
                //        case 'WaitingForPayment':
                //            return '待支付';
                //        case 'Paid':
                //            return '已支付';
                //    }
                //}, records[i]);
                extendItem(records[i]);
                model.rechargeRecords.push(records[i]);
            }

        }).done((items) => {
            //page.enableScrollLoad = items.length < services.defaultPageSize;
        });
    });


};

