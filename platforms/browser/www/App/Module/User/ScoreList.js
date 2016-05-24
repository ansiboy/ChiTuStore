var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    var ScoreListPage = (function (_super) {
        __extends(ScoreListPage, _super);
        function ScoreListPage(html) {
            var _this = this;
            _super.call(this, html);
            this.load.add(function (sender, args) {
                ko.applyBindings(model, _this.element);
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
        }
        return ScoreListPage;
    })(chitu.Page);
    return ScoreListPage;
});
