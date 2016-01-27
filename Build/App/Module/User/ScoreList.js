define(["require", "exports", 'Services/Account', 'Site'], function (require, exports, account, site) {
    requirejs(['css!content/User/ScoreList']);
    var model = {
        scoreRecords: ko.observableArray(),
        loading: ko.observable(false)
    };
    function extendItem(item) {
        item.TypeText = ko.computed(function () {
            switch (item.Type) {
                case 'OrderPurchase':
                    return '兑换商品';
                case 'OrderConsume':
                    return '消费获得积分';
            }
            return item.Type;
        });
        if (item.Score > 0) {
            item.Score = '+' + item.Score;
        }
    }
    return function (page) {
        //page.load.add(() => {
        //    return account.getScoreDetails().done((data) => {
        //        for (var i = 0; i < data.length; i++) {
        //            extendItem(data[i]);
        //        }
        //        model.scoreRecords(data);
        //    })
        //});
        page.viewChanged.add(function () { return ko.applyBindings(model, page.node()); });
        page.load.add(function (sender, args) {
            model.loading(true);
            return account.getScoreDetails().done(function (data) {
                for (var i = 0; i < data.length; i++) {
                    extendItem(data[i]);
                }
                model.scoreRecords(data);
                model.loading(false);
                args.enableScrollLoad = data.length == site.config.pageSize;
            });
        });
    };
});
