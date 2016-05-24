var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", 'chitu', 'knockout', 'Services/Service', 'Services/Home', 'Core/Carousel'], function (require, exports, chitu, ko, services, home, Carousel) {
    chitu.Utility.loadjs('UI/PromotionLabel');
    var IndexPage = (function (_super) {
        __extends(IndexPage, _super);
        function IndexPage(html) {
            _super.call(this, html);
            this.homeProductQueryArguments = {
                pageIndex: 0
            };
            this.model = {
                name: ko.observable(''),
                brands: ko.observableArray(),
                advertItems: ko.observableArray(),
                homeProducts: ko.observableArray()
            };
            this.findControl('products').scrollLoad = IndexPage.scrollView_load;
            this.load.add(this.page_load);
            ko.applyBindings(this.model, this.element);
        }
        IndexPage.scrollView_load = function (sender, args) {
            var page = sender.page;
            var result = home.homeProducts(page.homeProductQueryArguments.pageIndex)
                .done(function (homeProducts) {
                for (var i = 0; i < homeProducts.length; i++) {
                    homeProducts[i].Url = '#Home_Product_' + homeProducts[i].ProductId;
                    page.model.homeProducts.push(homeProducts[i]);
                }
                page.homeProductQueryArguments.pageIndex++;
                args.enableScrollLoad = (homeProducts.length == services.defaultPageSize);
            });
            return result;
        };
        IndexPage.prototype.page_load = function (sender, args) {
            return home.advertItems().done(function (advertItems) {
                for (var i = 0; i < advertItems.length; i++) {
                    advertItems[i].index = i;
                    advertItems[i].LinkUrl = advertItems[i].LinkUrl;
                    sender.model.advertItems.push(advertItems[i]);
                }
                var c = new Carousel($(sender.element).find('[name="ad-swiper"]')[0]);
            });
        };
        return IndexPage;
    })(chitu.Page);
    return IndexPage;
});
