/// <reference path="../../../Scripts/typings/require.d.ts"/>
/// <reference path="../../../Scripts/typings/knockout.d.ts"/>
/// <reference path="../../../Scripts/typings/hammer.d.ts"/>
/// <reference path="../../../Scripts/typings/move.d.ts"/>
define(["require", "exports", 'knockout', 'Services/Service', 'Services/Home'], function (require, exports, ko, services, home) {
    return function (page) {
        var homeProductQueryArguments = {
            pageIndex: 0
        };
        var model = {
            name: ko.observable(''),
            brands: ko.observableArray(),
            advertItems: ko.observableArray(),
            homeProducts: ko.observableArray(),
        };
        function page_load(sender, args) {
            if (args.loadType == chitu.PageLoadType.init) {
                home.advertItems().done(function (advertItems) {
                    for (var i = 0; i < advertItems.length; i++) {
                        advertItems[i].index = i;
                        advertItems[i].LinkUrl = advertItems[i].LinkUrl;
                        model.advertItems.push(advertItems[i]);
                    }
                });
            }
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
        function page_loadCompleted(sender, args) {
            if (args.loadType != chitu.PageLoadType.init)
                return;
            requirejs(['Core/Carousel'], function (Carousel) {
                var c = new Carousel($(sender.node).find('[name="ad-swiper"]')[0]);
            });
        }
        function page_viewChange(sender) {
            ko.applyBindings(model, sender.node);
        }
        var viewDeferred = page.view;
        page.view = $.when(viewDeferred, chitu.Utility.loadjs(['UI/PromotionLabel', 'css!sc/Home/Index']));
        page.viewChanged.add(page_viewChange);
        page.load.add(page_load);
        page.loadCompleted.add(page_loadCompleted);
    };
});
