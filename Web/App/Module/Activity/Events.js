chitu.action(function (page) {
    /// <param name="page" type="chitu.Page"/>
    var model = {
        addToShoppingCart: function () {
            var product = { Id: 'd57dc675-e6e1-411c-ba66-17b51b7189ce' };
            return services.shoppingCart
                     .addItem(product, 1)
                     .done(function () {
                         bootbox.alert('成功添加到购物车');
                     });
        }
    };

    page.shown.add(function () {
        site.wxShare = function (args) {
            /// <param name="args" type="site.wxShareArguments"/>
            args.description('人体70%的免疫细胞来自肠道，让肠道健康专家：来自英国的全球益生元领导品牌“必米诺”，给你免费清清肠。');
            args.imgUrl('http://www.lanfans.com/imagesbak/events_tb.jpg');
            args.title('关注免费领取118元必米诺');
        }
    });

    ko.applyBindings(model, page.node());
 
});