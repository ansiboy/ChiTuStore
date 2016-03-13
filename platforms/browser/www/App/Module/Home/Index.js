/// <reference path="../../../Scripts/typings/require.d.ts"/>
/// <reference path="../../../Scripts/typings/knockout.d.ts"/>
/// <reference path="../../../Scripts/typings/hammer.d.ts"/>
/// <reference path="../../../Scripts/typings/move.d.ts"/>
define(["require", "exports", 'knockout', 'Services/Service', 'Services/Home', 'Core/Carousel'], function (require, exports, ko, services, home, Carousel) {
    return function (page) {
        var homeProductQueryArguments = {
            pageIndex: 0
        };
        var model = {
            name: ko.observable(''),
            brands: ko.observableArray(),
            advertItems: ko.observableArray(),
            homeProducts: ko.observableArray(),
            pay: function () {
                window.alipay.pay({
                    tradeNo: 'g1239aaga1142f',
                    subject: "测试标题",
                    body: "我是测试内容",
                    price: 0.01,
                    notifyUrl: "http://your.server.notify.url"
                }, function (successResults) {
                    alert(successResults);
                }, function (errorResults) {
                    alert(errorResults);
                });
            }
        };
        function page_load(sender, args) {
            var result = home.homeProducts(homeProductQueryArguments.pageIndex)
                .done(function (homeProducts) {
                for (var i = 0; i < homeProducts.length; i++) {
                    homeProducts[i].Url = '#Home_Product_' + homeProducts[i].ProductId;
                    model.homeProducts.push(homeProducts[i]);
                }
                homeProductQueryArguments.pageIndex++;
                args.enableScrollLoad = (homeProducts.length == services.defaultPageSize);
            });
            return result;
        }
        var viewDeferred = page.view;
        page.view = $.when(viewDeferred, chitu.Utility.loadjs(['UI/PromotionLabel', 'css!sc/Home/Index']));
        page.viewChanged.add(function (sender, args) {
            ko.applyBindings(model, sender.element);
            var scroll_view = page.findControl('products');
            scroll_view.scrollLoad = page_load;
            var items_deferred = home.advertItems().done(function (advertItems) {
                for (var i = 0; i < advertItems.length; i++) {
                    advertItems[i].index = i;
                    advertItems[i].LinkUrl = advertItems[i].LinkUrl;
                    model.advertItems.push(advertItems[i]);
                }
                var c = new Carousel($(page.element).find('[name="ad-swiper"]')[0]);
                scroll_view.scroll.add(function (sender, e) {
                    c.pause = e.scrollTop < 0;
                });
            });
        });
    };
});
