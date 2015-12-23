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
                sender.enableScrollLoad = homeProducts.length == services.defaultPageSize;
            });
        });
        var viewDeferred = page.view;
        page.view = $.when(viewDeferred, chitu.Utility.loadjs(['ui/PromotionLabel']));
        page.viewChanged.add(function () { return ko.applyBindings(model, page.nodes().content); });
        page.loadCompleted.add(function () {
            requirejs(['swiper'], function (Swiper) {
                var mySwiper = new Swiper($(page.node()).find('[name="ad-swiper"]')[0], {
                    loop: false,
                    autoplay: 5000,
                    pagination: $(page.node()).find('[name="ad-pagination"]')[0],
                    onTap: function (swiper, event) {
                        var url = $(swiper.slides[swiper.activeIndex]).attr('url');
                        window.location.href = url;
                    }
                });
            });
        });
    };
});
