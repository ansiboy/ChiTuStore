/// <reference path="../../../Scripts/typings/knockout.d.ts"/>
define(["require", "exports", 'knockout', 'Services/Service', 'Services/Home'], function (require, exports, ko, services, home) {
    requirejs(['css!sc/Home/Index']);
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
        var loadComplete = $.Deferred();
        page.load.add(function (sender, args) {
            if (args.loadType == chitu.PageLoadType.open) {
                home.advertItems().done(function (advertItems) {
                    for (var i = 0; i < advertItems.length; i++) {
                        advertItems[i].index = i;
                        advertItems[i].LinkUrl = advertItems[i].LinkUrl;
                        model.advertItems.push(advertItems[i]);
                    }
                });
            }
            return home.homeProducts(homeProductQueryArguments.pageIndex).done(function (homeProducts) {
                for (var i = 0; i < homeProducts.length; i++) {
                    homeProducts[i].Url = '#Home_Product_' + homeProducts[i].ProductId;
                    model.homeProducts.push(homeProducts[i]);
                }
                homeProductQueryArguments.pageIndex++;
                args.enableScrollLoad = (homeProducts.length == services.defaultPageSize);
            });
        });
        var viewDeferred = page.view;
        page.view = $.when(viewDeferred, chitu.Utility.loadjs(['UI/PromotionLabel']));
        page.viewChanged.add(function () {
            ko.applyBindings(model, page.nodes().content);
            requirejs(['hammer'], function (HammerClass) {
                window['Hammer'] = HammerClass;
                var x = 0;
                var node = page.nodes().content.querySelector('.swiper-wrapper');
                var hammer = new Hammer(node);
                hammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });
                console.log('pan');
                var ctr_deltaX = 0;
                var pan_left_right = function (e) {
                    var transform = 'translateX(' + (x + e.deltaX) + 'px)';
                    node.style.transform = transform;
                    node.style.webkitTransform = transform;
                    e.preventDefault();
                };
                var pan_end = function (e) {
                    x = x + e.deltaX;
                };
                hammer.on('panleft', pan_left_right);
                hammer.on('panright', pan_left_right);
                hammer.on('panend', pan_end);
            });
        });
        page.loadCompleted.add(function () {
        });
    };
});
